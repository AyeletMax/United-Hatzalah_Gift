import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addDisplayedByField() {
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

    // הוספת שדה "מוצג על ידי"
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN displayed_by VARCHAR(255) NULL AFTER last_buyer
      `);
      console.log('שדה displayed_by נוסף בהצלחה');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('שדה displayed_by כבר קיים');
      } else {
        throw error;
      }
    }

    // עדכון נתונים לדוגמה
    await connection.execute(`
      UPDATE products 
      SET displayed_by = CASE 
        WHEN id % 6 = 0 THEN 'יוסי כהן'
        WHEN id % 6 = 1 THEN 'שרה לוי'
        WHEN id % 6 = 2 THEN 'דוד כהן'
        WHEN id % 6 = 3 THEN 'מרים כהן'
        WHEN id % 6 = 4 THEN 'אברהם לוי'
        ELSE 'רחל ישראלי'
      END
    `);

    console.log('נתונים לדוגמה עודכנו בהצלחה');
    console.log('השדה החדש נוסף בהצלחה!');

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDisplayedByField();