import { pool } from './db.js';

async function main() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('[server] DB connection OK');
  } catch (err) {
    console.error('[server] DB connection failed:', err.message);
    process.exit(1);
  }

  console.log('[server] Ready');
}

main();


