import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkLastProducts() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('בודק את המוצרים האחרונים...');

    const [rows] = await connection.execute(`
      SELECT * FROM products ORDER BY id DESC LIMIT 3
    `);
    
    console.log('המוצרים האחרונים:');
    rows.forEach(product => {
      console.log('ID:', product.id);
      console.log('שם:', product.name);
      console.log('תיאור:', product.description);
      console.log('מותג:', product.brand);
      console.log('לקוח אחרון:', product.last_buyer);
      console.log('מוצג על ידי:', product.displayed_by);
      console.log('תמונה:', product.image_url);
      console.log('---');
    });

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkLastProducts();