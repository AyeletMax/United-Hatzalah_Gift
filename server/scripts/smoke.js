import { pool } from '../src/db.js';

async function run() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert category if not exists
    const [cat] = await conn.query(
      'INSERT INTO categories (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      ['בדיקת קטגוריה']
    );
    const categoryId = cat.insertId;

    // Insert brand if not exists
    const [br] = await conn.query(
      'INSERT INTO brands (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      ['בדיקת מותג']
    );
    const brandId = br.insertId;

    // Insert a product
    const [prod] = await conn.query(
      'INSERT INTO products (name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url) VALUES (?,?,?,?,?,?,?)',
      ['מוצר בדיקה', categoryId, brandId, 12.34, 3, 'בודק/ת', 'https://example.com/test.jpg']
    );
    const productId = prod.insertId;

    // Create a question and option
    const [q] = await conn.query(
      'INSERT INTO questions (question_text) VALUES (?)',
      ['האם אהבת את המוצר?']
    );
    const questionId = q.insertId;
    await conn.query(
      'INSERT INTO question_options (question_id, option_text, option_value) VALUES (?,?,?)',
      [questionId, 'כן', 'yes']
    );

    // Link question to product
    await conn.query(
      'INSERT INTO product_questions (product_id, question_id) VALUES (?, ?)',
      [productId, questionId]
    );

    // Create a response with rating 5 and select an option
    const [resp] = await conn.query(
      'INSERT INTO product_survey_responses (product_id, rating) VALUES (?, ?)',
      [productId, 5]
    );
    const responseId = resp.insertId;

    const [[opt]] = await conn.query(
      'SELECT id FROM question_options WHERE question_id = ? LIMIT 1',
      [questionId]
    );
    await conn.query(
      'INSERT INTO response_answers (response_id, question_id, option_id) VALUES (?,?,?)',
      [responseId, questionId, opt.id]
    );

    await conn.commit();

    // Validate counts
    const [[{ c_products }]] = await conn.query('SELECT COUNT(*) AS c_products FROM products');
    const [[{ c_responses }]] = await conn.query('SELECT COUNT(*) AS c_responses FROM product_survey_responses');
    console.log(`[smoke] products=${c_products}, responses=${c_responses}`);
  } catch (e) {
    await conn.rollback();
    console.error('[smoke] Failed:', e.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

run();


