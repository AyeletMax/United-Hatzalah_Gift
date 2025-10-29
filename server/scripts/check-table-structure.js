import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkTableStructure() {
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

    // בדיקת מבנה הטבלה
    const [columns] = await connection.execute(`
      DESCRIBE products
    `);
    
    console.log('מבנה טבלת products:');
    console.table(columns);

    // בדיקת מספר המוצרים
    const [count] = await connection.execute(`
      SELECT COUNT(*) as total FROM products
    `);
    
    console.log(`סה"כ מוצרים בטבלה: ${count[0].total}`);

    // בדיקת מוצר לדוגמה
    const [sample] = await connection.execute(`
      SELECT * FROM products LIMIT 1
    `);
    
    if (sample.length > 0) {
      console.log('מוצר לדוגמה:');
      console.log(sample[0]);
    }

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTableStructure();