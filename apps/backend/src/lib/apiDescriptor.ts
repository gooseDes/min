import { db } from "@/db";
import { chatUsersTable, usersTable } from "@/db/schema";
import { JWT_SECRET, origins } from "@/shared";
import { SocketUser, TokenPayload } from "@/types/auth";
import { eq } from "drizzle-orm";
import { IncomingMessage, Server, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import { Logger } from "pino";
import * as SocketIO from "socket.io";
import z from "zod";
import { formatUser } from "./utils";

export type FailedHandler = { success: false; message: string };

interface Endpoint {
  inputSchema: z.ZodObject;
  outputSchema: z.ZodObject;
  handler: (
    socket: SocketIO.Socket,
    data: z.infer<z.ZodObject>,
  ) => z.infer<z.ZodObject> | FailedHandler | Promise<z.infer<z.ZodObject> | FailedHandler>;
}
export type EndpointRegistry = Record<string, Endpoint>;

type SocketWithUser = SocketIO.Socket & { user: SocketUser };

class ApiDescriptor {
  public io: SocketIO.Server;
  private logger: Logger;
  public registry: Record<string, Endpoint> = {};

  constructor(server: Server<typeof IncomingMessage, typeof ServerResponse>, logger: Logger) {
    this.logger = logger;

    this.io = new SocketIO.Server(server, {
      cors: {
        origin: origins,
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("No token provided (╯°□°）╯︵ ┻━┻"));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        const user = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, decoded.id),
          columns: { id: true, name: true, avatar: true },
        });
        if (!user) {
          return next(new Error("User not found (╯°□°）╯︵ ┻━┻"));
        }
        socket.user = { ...user, ...decoded };
        const chat_ids = await db.query.chatUsersTable.findMany({
          where: eq(chatUsersTable.userId, decoded.id),
          columns: { chatId: true },
        });
        chat_ids.forEach(chat => {
          socket.join(`chat:${chat.chatId}`);
        });
        socket.join("chat:1");
        next();
      } catch (_err) {
        return next(new Error("Invalid token (╯°□°）╯︵ ┻━┻"));
      }
    });

    this.io.on("connection", socket => {
      Object.keys(this.registry).forEach(name => {
        const { inputSchema, outputSchema: _outputSchema, handler } = this.registry[name];
        socket.on(name, async (data: any) => {
          const requestId = data?.requestId;
          const parsed = inputSchema.safeParse(data);
          if (parsed.success) {
            try {
              const result = await handler(socket, parsed.data as any);
              if ("success" in result && result.success === false) {
                socket.emit(name, { success: false, message: `Failed ${name}: ${result.message}` });
              } else {
                socket.emit(name, { success: true, ...(requestId ? { ...result, requestId } : result) });
              }
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              socket.emit(name, { success: false, message: `Caught error in ${name}: ${errorMsg}` });
              this.logger.error(`Caught error in ${name} requested by ${formatUser(socket.user)}: ${errorMsg}`);
            }
          } else {
            socket.emit(name, { success: false, message: `Invalid input data: ${parsed.error.message}` });
            this.logger.error(`Invalid input data in ${name} requested by ${formatUser(socket.user)}: ${parsed.error.message}`);
          }
        });
      });
    });
  }

  addEndpoint<InSchema extends z.ZodObject, OutSchema extends z.ZodObject>(
    name: string,
    inputSchema: InSchema,
    outputSchema: OutSchema,
    handler: (
      socket: SocketWithUser,
      data: z.infer<InSchema>,
    ) => z.infer<OutSchema> | FailedHandler | Promise<z.infer<OutSchema> | FailedHandler>,
  ) {
    this.registry[name] = { inputSchema, outputSchema, handler: handler as Endpoint["handler"] };
  }
}

export function fail(msg: string): FailedHandler {
  return { success: false, message: msg };
}

export default ApiDescriptor;
