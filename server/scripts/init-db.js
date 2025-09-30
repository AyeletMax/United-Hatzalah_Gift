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
    // Ensure missing columns exist (for reruns on existing DBs)
    await ensureColumn(connection, 'question_options', 'display_order', 'INT UNSIGNED NOT NULL DEFAULT 0');
    await ensureColumn(connection, 'product_questions', 'display_order', 'INT UNSIGNED NOT NULL DEFAULT 0');
    // Create indexes idempotently using information_schema (MySQL lacks IF NOT EXISTS for CREATE INDEX)
    await ensureIndex(connection, 'products', 'ix_products_category_brand', '`category_id`, `brand_id`');
    await ensureIndex(connection, 'question_options', 'ix_question_options_display_order', '`question_id`, `display_order`');
    await ensureIndex(connection, 'product_questions', 'ix_product_questions_display_order', '`product_id`, `display_order`');
    console.log('[init-db] Schema applied successfully');
  } finally {
    connection.release();
  }
  await pool.end();
}

async function ensureColumn(conn, table, column, definitionSql) {
  const [rows] = await conn.query(
    'SELECT COUNT(1) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    [table, column]
  );
  if (!rows[0] || rows[0].c === 0) {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${definitionSql}`);
    console.log(`[init-db] Added column ${column} to ${table}`);
  } else {
    console.log(`[init-db] Column ${column} already exists on ${table}`);
  }
}

async function ensureIndex(conn, table, indexName, columnsSql) {
  const [rows] = await conn.query(
    'SELECT COUNT(1) AS c FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?',
    [table, indexName]
  );
  if (!rows[0] || rows[0].c === 0) {
    await conn.query(`CREATE INDEX ${indexName} ON \`${table}\` (${columnsSql})`);
    console.log(`[init-db] Created index ${indexName} on ${table}`);
  } else {
    console.log(`[init-db] Index ${indexName} already exists`);
  }
}

run().catch((err) => {
  console.error('[init-db] Failed:', err);
  process.exit(1);
});


