import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addDescriptionField() {
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

    // הוספת שדה תיאור
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN description TEXT NULL AFTER name
      `);
      console.log('שדה description נוסף בהצלחה');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('שדה description כבר קיים');
      } else {
        throw error;
      }
    }

    console.log('השדה נוסף בהצלחה!');

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDescriptionField();