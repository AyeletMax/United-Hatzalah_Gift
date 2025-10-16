import { pool } from '../src/db.js';

async function seedData() {
  try {
    console.log('[seed] Starting data seeding...');

    // 1. הוספת קטגוריות
    console.log('[seed] Adding categories...');
    await pool.query(`
      INSERT INTO categories (id, name) VALUES
      (1, 'לרכב'),
      (2, 'טקסטיל וביגוד'),
      (3, 'כלי בית'),
      (4, 'יודאיקה'),
      (5, 'מוצרים חדשים'),
      (6, 'מתנות'),
      (7, 'מוצרי קיץ'),
      (8, 'מוצרי חורף'),
      (9, 'אביזרי יח"צ'),
      (10, 'תיקים')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 2. הוספת מותגים
    console.log('[seed] Adding brands...');
    await pool.query(`
      INSERT INTO brands (name) VALUES
      ('מותג A'),
      ('מותג B'),
      ('מותג C'),
      ('מותג D')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 3. הוספת מוצרים
    console.log('[seed] Adding products...');
    await pool.query(`
      INSERT INTO products (name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, image_url) VALUES
      -- לרכב (1)
      ('מטען לרכב', 1, 1, 89.90, 3, 'https://via.placeholder.com/300x300?text=מטען+לרכב'),
      ('מצלמת דרך', 1, 2, 299.90, 5, 'https://via.placeholder.com/300x300?text=מצלמת+דרך'),
      ('כיסוי הגה', 1, 1, 49.90, 2, 'https://via.placeholder.com/300x300?text=כיסוי+הגה'),
      
      -- טקסטיל וביגוד (2)
      ('חולצת פולו', 2, 3, 129.90, 7, 'https://via.placeholder.com/300x300?text=חולצת+פולו'),
      ('מכנסיים', 2, 3, 179.90, 7, 'https://via.placeholder.com/300x300?text=מכנסיים'),
      ('סווטשירט', 2, 4, 149.90, 5, 'https://via.placeholder.com/300x300?text=סווטשירט'),
      
      -- כלי בית (3)
      ('סט סכו"ם', 3, 2, 199.90, 4, 'https://via.placeholder.com/300x300?text=סט+סכום'),
      ('מחבת', 3, 1, 89.90, 3, 'https://via.placeholder.com/300x300?text=מחבת'),
      ('סיר לחץ', 3, 2, 349.90, 5, 'https://via.placeholder.com/300x300?text=סיר+לחץ'),
      
      -- יודאיקה (4)
      ('מזוזה מעוצבת', 4, 1, 79.90, 3, 'https://via.placeholder.com/300x300?text=מזוזה'),
      ('נרות שבת', 4, 2, 59.90, 2, 'https://via.placeholder.com/300x300?text=נרות+שבת'),
      ('כיפה רקומה', 4, 1, 39.90, 2, 'https://via.placeholder.com/300x300?text=כיפה'),
      
      -- מוצרים חדשים (5)
      ('גאדג\\ט חדש', 5, 3, 99.90, 4, 'https://via.placeholder.com/300x300?text=גאדגט+חדש'),
      ('מוצר חדשני', 5, 4, 149.90, 5, 'https://via.placeholder.com/300x300?text=מוצר+חדשני'),
      
      -- מתנות (6)
      ('סט מתנה', 6, 2, 199.90, 3, 'https://via.placeholder.com/300x300?text=סט+מתנה'),
      ('קופסת שוקולד', 6, 1, 79.90, 2, 'https://via.placeholder.com/300x300?text=שוקולד'),
      
      -- מוצרי קיץ (7)
      ('כובע קיץ', 7, 3, 49.90, 3, 'https://via.placeholder.com/300x300?text=כובע+קיץ'),
      ('משקפי שמש', 7, 4, 89.90, 4, 'https://via.placeholder.com/300x300?text=משקפי+שמש'),
      
      -- מוצרי חורף (8)
      ('כפפות חורף', 8, 1, 59.90, 3, 'https://via.placeholder.com/300x300?text=כפפות'),
      ('צעיף חם', 8, 2, 79.90, 3, 'https://via.placeholder.com/300x300?text=צעיף'),
      
      -- אביזרי יח"צ (9)
      ('כיסא קמפינג', 9, 3, 149.90, 5, 'https://via.placeholder.com/300x300?text=כיסא+קמפינג'),
      ('צידנית', 9, 4, 199.90, 4, 'https://via.placeholder.com/300x300?text=צידנית'),
      
      -- תיקים (10)
      ('תיק גב', 10, 1, 179.90, 4, 'https://via.placeholder.com/300x300?text=תיק+גב'),
      ('תיק יד', 10, 2, 149.90, 3, 'https://via.placeholder.com/300x300?text=תיק+יד')
    `);

    console.log('[seed] ✅ Data seeding completed successfully!');
    console.log('[seed] Added:');
    console.log('  - 10 categories');
    console.log('  - 4 brands');
    console.log('  - 24 products');
    
  } catch (err) {
    console.error('[seed] ❌ Error seeding data:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seedData().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});