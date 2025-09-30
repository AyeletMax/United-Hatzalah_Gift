import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();


const {
  DB_HOST,
  DB_PORT = "3306",
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_CONN_LIMIT = "10",
  DB_QUEUE_LIMIT = "0",
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error(
    "[db] Missing DB env vars. Ensure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are set."
  );
  console.log("[db] Current values:", {
    DB_HOST,
    DB_USER: DB_USER ? "***" : "missing",
    DB_PASSWORD: DB_PASSWORD ? "***" : "missing",
    DB_NAME
  });
}

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(DB_CONN_LIMIT),
  queueLimit: Number(DB_QUEUE_LIMIT),
  charset: "utf8mb4",
});

export async function pingDatabase() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}
