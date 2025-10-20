import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addFilterFields() {
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

    // הוספת שדה פופולריות
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN popularity_score INT UNSIGNED DEFAULT 0 AFTER last_ordered_by_name
      `);
      console.log('שדה popularity_score נוסף בהצלחה');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('שדה popularity_score כבר קיים');
      } else {
        throw error;
      }
    }

    // הוספת שדה תאריך יצירה
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER popularity_score
      `);
      console.log('שדה created_at נוסף בהצלחה');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('שדה created_at כבר קיים');
      } else {
        throw error;
      }
    }

    // הוספת שדה מותג כטקסט (במקום foreign key)
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN brand VARCHAR(255) NULL AFTER brand_id
      `);
      console.log('שדה brand נוסף בהצלחה');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('שדה brand כבר קיים');
      } else {
        throw error;
      }
    }

    // הוספת שדה לקוח אחרון
    try {
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN last_buyer VARCHAR(255) NULL AFTER brand
      `);
      console.log('שדה last_buyer נוסף בהצלחה');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('שדה last_buyer כבר קיים');
      } else {
        throw error;
      }
    }

    // עדכון נתונים לדוגמה - תמיד עדכן
    await connection.execute(`
      UPDATE products 
      SET 
        popularity_score = FLOOR(RAND() * 100),
        brand = CASE 
          WHEN id % 4 = 0 THEN 'סמסונג'
          WHEN id % 4 = 1 THEN 'אפל'
          WHEN id % 4 = 2 THEN 'LG'
          ELSE 'פיליפס'
        END,
        last_buyer = CASE 
          WHEN id % 5 = 0 THEN 'יוסי כהן'
          WHEN id % 5 = 1 THEN 'שרה לוי'
          WHEN id % 5 = 2 THEN 'דוד ישראלי'
          WHEN id % 5 = 3 THEN 'מרים כהן'
          ELSE 'אברהם לוי'
        END,
        last_ordered_by_name = CASE 
          WHEN id % 4 = 0 THEN 'יוסי כהן'
          WHEN id % 4 = 1 THEN 'שרה לוי'
          WHEN id % 4 = 2 THEN 'דוד ישראלי'
          ELSE 'מרים כהן'
        END
    `);

    console.log('נתונים לדוגמה עודכנו בהצלחה');
    console.log('השדות החדשים נוספו בהצלחה!');

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addFilterFields();