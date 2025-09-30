import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  console.log(`[init-db] Running schema from ${schemaPath}`);
  const connection = await pool.getConnection();
  try {
    await connection.query(sql);
    console.log('[init-db] Schema applied successfully');
  } finally {
    connection.release();
  }
  await pool.end();
}

run().catch((err) => {
  console.error('[init-db] Failed:', err);
  process.exit(1);
});


