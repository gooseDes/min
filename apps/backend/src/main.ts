import bcrypt from "bcrypt";
import cors from "cors";
import { eq, or } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import express, { Request, Response } from "express";
import fs from "fs";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import pino from "pino";
import sharp from "sharp";
import webpush from "web-push";
import { db } from "./db/index.js";
import { chatsTable, emojisTable, subscriptionsTable, usersTable } from "./db/schema.js";
import { initAdmin } from "./lib/firebaseAdmin.js";
import { Turn } from "./lib/turn.js";
import { formatUser, jsonToObject, objectToJson, validateString } from "./lib/utils.js";
import { JWT_SECRET, origins } from "./shared.js";
import createSocketEndpoints from "./socketEndpoints.js";
import { SocketUser, TokenPayload } from "./types/auth.js";

initAdmin();

const EMOJI_SIZE = 96;
const AVATAR_SIZE = 512;
const MAX_ATTACHMENT_SIZE = 2048;

const logsDir = "logs";
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logFile = path.join(logsDir, `${new Date().toISOString().replace(/:/g, "-")}.log`);

const streams = [
  {
    stream: pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
      },
    }),
  },
  { stream: pino.destination(logFile) },
];

const logger = pino(
  {
    level: "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams),
);

logger.info("Setting things up...");

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

webpush.setVapidDetails(`mailto:${process.env.EMAIL}`, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

// Creating folder for uploads and avatars
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const imagesDir = "images";
const avatarsDir = path.join(uploadsDir, "avatars");
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir);
const attachmentsDir = path.join(uploadsDir, "attachments");
if (!fs.existsSync(attachmentsDir)) fs.mkdirSync(attachmentsDir);
const emojisDir = path.join(uploadsDir, "emojis");
if (!fs.existsSync(emojisDir)) fs.mkdirSync(emojisDir);

// Setting up fallbacks
const defaultAvatar = path.join(imagesDir, "logo.webp");
const defaultAttachment = path.join(imagesDir, "no_image.webp");
const defaultEmoji = path.join(imagesDir, "no_image.webp");

const upload = multer({ dest: path.join(uploadsDir, "temp"), limits: { fileSize: 10 * 1024 * 1024 } });

await migrate(db, { migrationsFolder: "./drizzle/migrations" });

await db
  .insert(chatsTable)
  .values({ id: 1, type: "group", name: "Default Chat" })
  .onDuplicateKeyUpdate({ set: { id: 1 } });

// Add avatar column to users table
const users = await db.select().from(usersTable);
for (const user of users) {
  if (user.avatar === "replace") {
    await db
      .update(usersTable)
      .set({ avatar: `${user.id}` })
      .where(eq(usersTable.id, user.id));
  }
}

// Initializing turn server api
const turn = new Turn(db.$client);

interface AuthRequest extends Request {
  userId?: number;
  userName?: string;
}

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

// Something for verification
function authMiddleware(req: AuthRequest, res: Response, next: () => void) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.userId = decoded.id;
    req.userName = decoded.name;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid Token" });
  }
}

// Route for loading avatars
app.post("/upload-avatar", authMiddleware, upload.single("avatar"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, msg: "File is not loaded" });

    const userId = req.userId;
    const suffix = Math.round(Date.now() / 1000);
    const outPath = path.join(avatarsDir, `${userId}_${suffix}.webp`);

    // Converting and resizing image
    await sharp(req.file.path)
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
      .toFormat("webp", { quality: 80 })
      .toFile(outPath);

    // Deleting temp
    fs.unlinkSync(req.file.path);

    // Deleting old avatar
    const oldAvatarDb = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (oldAvatarDb?.avatar) {
      const oldAvatar = oldAvatarDb.avatar;
      try {
        fs.unlinkSync(path.join(avatarsDir, oldAvatar + ".webp"));
      } catch (err) {}
    }

    await db
      .update(usersTable)
      .set({ avatar: `${userId}_${suffix}` })
      .where(eq(usersTable.id, userId));

    res.json({ success: true, url: `/avatars/${userId}_${suffix}.webp`, avatar: `${userId}_${suffix}` });
    logger.info(`${formatUser({ id: userId, name: req.userName })} uploaded their avatar`);
  } catch (err) {
    logger.error(`Error loading avatar for user ${formatUser({ id: req.userId, name: req.userName })}:\n${err}`);
    res.status(500).json({ success: false, msg: "Error loading" });
  }
});

// Hosting avatars
app.get("/avatars/:id.webp", (req, res) => {
  /*if (req.params.id.split("_").length <= 1) {
        const avatarName = await connection.query("SELECT avatar FROM users WHERE id = ?", [req.params.id]);
        req.params.id = avatarName[0][0].avatar;
    }*/
  const filePath = path.join(avatarsDir, req.params.id + ".webp");
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.sendFile(path.resolve(defaultAvatar));
  }
});

// Hosting avatars for push messages
app.get("/avatars/:id.png", (req, res) => {
  const filePath = path.join(avatarsDir, req.params.id + ".webp");
  let mypath: string;

  if (fs.existsSync(filePath)) {
    mypath = path.resolve(filePath);
  } else {
    mypath = path.resolve(defaultAvatar);
  }

  sharp(mypath)
    .resize(64, 64)
    .toFormat("png")
    .toBuffer()
    .then(buffer => {
      res.type("image/png");
      res.send(buffer);
    })
    .catch(err => {
      logger.error(`Error resizing avatar for someone:\n${err}`);
      res.status(500).json({ success: false, msg: "Error resizing" });
    });
});

// Route for loading attachments
app.post("/attach", authMiddleware, upload.array("attachments", 5), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, msg: "Files are not loaded" });
    const userId = req.userId;
    const urls = [];

    const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"]);

    if (!Array.isArray(req.files)) return res.status(400).json({ success: false, msg: "Files are not loaded" });
    for (let file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = imageExts.has(ext);
      const newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${isImage ? ".webp" : ext}`;
      const outPath = path.join(attachmentsDir, newFilename);

      if (isImage) {
        await sharp(file.path)
          .rotate()
          .resize({
            width: MAX_ATTACHMENT_SIZE,
            height: MAX_ATTACHMENT_SIZE,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toFile(outPath);
        fs.unlinkSync(file.path);
      } else {
        // fs.renameSync(file.path, outPath);
        fs.unlinkSync(file.path);
      }

      urls.push(`/attachments/${newFilename}`);
      logger.info(`${formatUser({ id: userId, name: req.userName })} uploaded attachment ${newFilename}`);
    }

    res.json({ success: true, urls: urls });
  } catch (err) {
    logger.error(`Error loading attachments for ${formatUser({ id: req.userId, name: req.userName })}:\n${err}`);

    if (!Array.isArray(req.files)) return res.status(500).json({ success: false, msg: "Error loading" });
    for (const file of req.files ?? []) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    res.status(500).json({ success: false, msg: "Error loading" });
  }
});

// Hosting attachments
app.get("/attachments/:filename", (req, res) => {
  const filePath = path.join(attachmentsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.sendFile(path.resolve(defaultAttachment));
  }
});

// Route for uploading custom emojis
app.post("/upload-emoji", authMiddleware, upload.single("emoji"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, msg: "File is not loaded" });
    const { name } = req.body;
    if (!validateString(name, "username", 1, 32)) return res.status(400).json({ success: false, msg: "Invalid emoji name" });

    const insertedEmoji = await db.insert(emojisTable).values({ name, uploaderId: req.userId }).$returningId();
    const outPath = path.join(emojisDir, `${insertedEmoji[0].id}.webp`);

    // Converting and resizing image
    await sharp(req.file.path)
      .resize(EMOJI_SIZE, EMOJI_SIZE, { fit: "cover" })
      .toFormat("webp", { quality: 80 })
      .toFile(outPath);

    fs.unlinkSync(req.file.path);

    res.json({ success: true, url: `/emojis/${insertedEmoji[0].id}.webp` });
    logger.info(`${formatUser({ id: req.userId, name: req.userName })} uploaded their custom emoji`);
  } catch (err) {
    logger.error(`Error loading custom emoji by user ${formatUser({ id: req.userId, name: req.userName })}:\n${err}`);
    res.status(500).json({ success: false, msg: "Error loading" });
  }
});

// Hosting custom emojis
app.get("/emojis/:id.webp", (req, res) => {
  const filePath = path.join(emojisDir, req.params.id + ".webp");
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.sendFile(path.resolve(defaultEmoji));
  }
});

// Signing up
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!validateString(email, "email", 1, 256)) return res.status(400).json({ msg: "Please enter valid email" });
    if (!validateString(username, "username", 1, 64))
      return res.status(400).json({ msg: "Username must be 1-64 characters and must consist of a-z A-Z 0-9 _ -" });
    if (!validateString(password, "password", 6, 64))
      return res.status(400).json({ msg: "Password must be 6-64 characters long and not contain any prohibited characters" });
    const results = await db.query.usersTable.findMany({
      where: or(eq(usersTable.name, username), eq(usersTable.email, email)),
    });
    if (results.length > 0) {
      return res.status(400).json({ msg: "User with such username or email exists" });
    }
    bcrypt.hash(password, 10, async (error, hash) => {
      if (error) {
        return res.status(400).json({ msg: "Error hashing password!" });
      }
      const inserted = await db.insert(usersTable).values({ name: username, email, password: hash }).$returningId();
      const token = jwt.sign({ id: inserted[0].id, name: username, email: email }, JWT_SECRET, { expiresIn: "7d" });
      logger.info(`${formatUser({ id: inserted[0].id, name: username })} just created an account!`);
      return res.json({ id: inserted[0].id, token: token });
    });
  } catch (err) {
    logger.error(`Unexpected error happend while registering user account with data ${objectToJson(req.body)}`);
    return res.status(400).json({ msg: "Unexpected error while registering" });
  }
});

// Signing in
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const results = await db.query.usersTable.findMany({ where: eq(usersTable.email, email) });
    if (results.length === 0) {
      return res.status(400).json({ msg: "User with such email does not exist" });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ msg: "Error comparing password" });
      }
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect password" });
      }
      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      if (!token) {
        return res.status(500).json({ msg: "Error generating token" });
      }
      return res.json({ token: token, username: user.name, id: user.id });
    });
  } catch (err) {
    logger.error(`Unexpected error happend while logining user with data ${objectToJson(req.body)}`);
    return res.status(400).json({ msg: "Unexpected error while logining" });
  }
});

// Verify token
app.post("/verify", (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ msg: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.json({ valid: true, user: decoded });
    } catch (err) {
      return res.status(400).json({ valid: false, msg: "Invalid token" });
    }
  } catch (err) {
    return res.status(400).json({ msg: "Unexpected error while verifying" });
  }
});

// Route for subscribing to web push
app.post("/subscribe", async (req, res) => {
  try {
    const subscription = jsonToObject(req.body.subscription);
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ ok: false, msg: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const subscriptions = await db.query.subscriptionsTable.findMany({ where: eq(subscriptionsTable.userId, decoded.id) });
    let contin = true;
    subscriptions.forEach(row => {
      if (jsonToObject(row.subscription).endpoint == subscription.endpoint) {
        contin = false;
      }
    });
    if (!contin) return res.status(400).json({ ok: false, msg: "This device has already subscribed" });
    await db.insert(subscriptionsTable).values({ userId: decoded.id, subscription: subscription });
    return res.json({ ok: true });
  } catch (err) {
    logger.error(`Unexpected error happend while subscribing user to push messages with data ${objectToJson(req.body)}`);
    return res.status(400).json({ ok: false, msg: "Unexpected error while subscribing" });
  }
});

createSocketEndpoints(server, logger, turn);

// Starting server
const PORT = process.env.PORT || 5000;
server.listen({ port: PORT, hostname: "0.0.0.0" }, () => {
  logger.info(`Server is successfully started and runs on ${PORT} port!`);
});
