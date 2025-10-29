import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testProductInsert() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('מתחבר לבסיס הנתונים...');

    // נתוני מוצר לבדיקה
    const testProduct = {
      name: 'מוצר בדיקה',
      description: 'תיאור מוצר בדיקה',
      category_id: 1,
      brand_id: null,
      unit_price_incl_vat: 99.99,
      delivery_time_days: 5,
      last_ordered_by_name: 'בדיקה בדיקה',
      image_url: null,
      brand: 'מותג בדיקה',
      last_buyer: 'בדיקה בדיקה',
      popularity_score: 0,
      displayed_by: 'מנהל בדיקה'
    };

    console.log('מוסיף מוצר בדיקה:', testProduct);

    // הוספת המוצר
    const [result] = await connection.execute(`
      INSERT INTO products (
        name, description, category_id, brand_id, unit_price_incl_vat, 
        delivery_time_days, last_ordered_by_name, image_url, brand, 
        last_buyer, popularity_score, displayed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testProduct.name,
      testProduct.description,
      testProduct.category_id,
      testProduct.brand_id,
      testProduct.unit_price_incl_vat,
      testProduct.delivery_time_days,
      testProduct.last_ordered_by_name,
      testProduct.image_url,
      testProduct.brand,
      testProduct.last_buyer,
      testProduct.popularity_score,
      testProduct.displayed_by
    ]);

    console.log('מוצר נוסף בהצלחה! ID:', result.insertId);

    // בדיקת המוצר שנוסף
    const [inserted] = await connection.execute(`
      SELECT * FROM products WHERE id = ?
    `, [result.insertId]);

    console.log('המוצר שנוסף:');
    console.log(inserted[0]);

    // מחיקת המוצר לאחר הבדיקה
    await connection.execute(`
      DELETE FROM products WHERE id = ?
    `, [result.insertId]);

    console.log('מוצר הבדיקה נמחק בהצלחה');

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testProductInsert();