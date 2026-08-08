import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: "root",
  password: "root",
  database: "min",
});

export const db = drizzle(pool, { schema, mode: "default" });
