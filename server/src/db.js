import 'dotenv/config';
import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_PORT = '3306',
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_CONN_LIMIT = '10',
  DB_QUEUE_LIMIT = '0'
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.warn('[db] Missing DB env vars. Ensure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are set.');
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
  charset: 'utf8mb4'
});

export async function pingDatabase() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows?.[0]?.ok === 1;
}


