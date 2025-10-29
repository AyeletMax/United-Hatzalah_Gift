import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function updateCategories() {
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

    // עדכון הקטגוריות להתאים לניווט
    await connection.execute(`
      UPDATE categories SET name = 'ביגוד קיץ וחורף' WHERE id = 2
    `);

    console.log('הקטגוריות עודכנו בהצלחה!');

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateCategories();