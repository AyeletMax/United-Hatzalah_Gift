import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addSampleData() {
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

    // הוספת נתונים לדוגמה עם שמות ישראליים
    const sampleProducts = [
      {
        name: 'רדיו דו כיווני מקצועי',
        category_id: 1,
        unit_price_incl_vat: 450.00,
        delivery_time_days: 3,
        last_ordered_by_name: 'דוד כהן',
        last_buyer: 'דוד כהן',
        displayed_by: 'יוסי לוי',
        brand: 'מוטורולה',
        popularity_score: 85
      },
      {
        name: 'ערכת עזרה ראשונה מתקדמת',
        category_id: 2,
        unit_price_incl_vat: 320.00,
        delivery_time_days: 2,
        last_ordered_by_name: 'שרה ישראלי',
        last_buyer: 'שרה ישראלי',
        displayed_by: 'דוד כהן',
        brand: 'מדיקל פלוס',
        popularity_score: 92
      },
      {
        name: 'פנס LED עמיד למים',
        category_id: 3,
        unit_price_incl_vat: 89.90,
        delivery_time_days: 1,
        last_ordered_by_name: 'מרים לוי',
        last_buyer: 'מרים לוי',
        displayed_by: 'אברהם כהן',
        brand: 'לדלנסר',
        popularity_score: 78
      },
      {
        name: 'חליפת הגנה כימית',
        category_id: 2,
        unit_price_incl_vat: 180.00,
        delivery_time_days: 5,
        last_ordered_by_name: 'אברהם דוד',
        last_buyer: 'אברהם דוד',
        displayed_by: 'רחל ישראלי',
        brand: 'דופונט',
        popularity_score: 65
      },
      {
        name: 'מכשיר מדידת לחץ דם דיגיטלי',
        category_id: 4,
        unit_price_incl_vat: 250.00,
        delivery_time_days: 3,
        last_ordered_by_name: 'רחל כהן',
        last_buyer: 'רחל כהן',
        displayed_by: 'דוד כהן',
        brand: 'אומרון',
        popularity_score: 88
      },
      {
        name: 'כפפות ניטריל חד פעמיות',
        category_id: 2,
        unit_price_incl_vat: 45.00,
        delivery_time_days: 1,
        last_ordered_by_name: 'יוסי ישראלי',
        last_buyer: 'יוסי ישראלי',
        displayed_by: 'שרה לוי',
        brand: 'מדיגלוב',
        popularity_score: 95
      },
      {
        name: 'מטפה כיבוי אש נייד',
        category_id: 1,
        unit_price_incl_vat: 120.00,
        delivery_time_days: 2,
        last_ordered_by_name: 'משה כהן',
        last_buyer: 'משה כהן',
        displayed_by: 'דוד כהן',
        brand: 'פיירטק',
        popularity_score: 72
      },
      {
        name: 'אלונקה מתקפלת',
        category_id: 3,
        unit_price_incl_vat: 380.00,
        delivery_time_days: 4,
        last_ordered_by_name: 'דינה לוי',
        last_buyer: 'דינה לוי',
        displayed_by: 'יעקב ישראלי',
        brand: 'פרנו',
        popularity_score: 80
      },
      {
        name: 'מכשיר החייאה AED',
        category_id: 4,
        unit_price_incl_vat: 2500.00,
        delivery_time_days: 7,
        last_ordered_by_name: 'אליהו כהן',
        last_buyer: 'אליהו כהן',
        displayed_by: 'דוד כהן',
        brand: 'פיליפס',
        popularity_score: 98
      },
      {
        name: 'תיק חירום רפואי',
        category_id: 10,
        unit_price_incl_vat: 150.00,
        delivery_time_days: 2,
        last_ordered_by_name: 'תמר ישראלי',
        last_buyer: 'תמר ישראלי',
        displayed_by: 'דוד כהן',
        brand: 'מדיבג',
        popularity_score: 85
      },
      {
        name: 'מסכות הגנה N95',
        category_id: 2,
        unit_price_incl_vat: 25.00,
        delivery_time_days: 1,
        last_ordered_by_name: 'דוד כהן',
        last_buyer: 'דוד כהן',
        displayed_by: 'מרים לוי',
        brand: '3M',
        popularity_score: 90
      },
      {
        name: 'חגורת כלים טקטית',
        category_id: 9,
        unit_price_incl_vat: 95.00,
        delivery_time_days: 3,
        last_ordered_by_name: 'גדעון כהן',
        last_buyer: 'גדעון כהן',
        displayed_by: 'דוד כהן',
        brand: 'בלקהוק',
        popularity_score: 75
      }
    ];

    // מחיקת נתונים קיימים (אופציונלי)
    await connection.execute('DELETE FROM products WHERE id > 0');
    console.log('נתונים קיימים נמחקו');

    // הכנסת הנתונים החדשים
    for (const product of sampleProducts) {
      await connection.execute(`
        INSERT INTO products 
        (name, category_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, last_buyer, displayed_by, brand, popularity_score) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.name,
        product.category_id,
        product.unit_price_incl_vat,
        product.delivery_time_days,
        product.last_ordered_by_name,
        product.last_buyer,
        product.displayed_by,
        product.brand,
        product.popularity_score
      ]);
    }

    console.log(`${sampleProducts.length} מוצרים נוספו בהצלחה!`);
    
    // בדיקה שהנתונים נוספו
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM products');
    console.log(`סה"כ מוצרים במסד הנתונים: ${rows[0].count}`);

    // הצגת דוגמאות
    const [samples] = await connection.execute(`
      SELECT name, last_ordered_by_name, last_buyer, displayed_by 
      FROM products 
      WHERE last_ordered_by_name LIKE '%דוד כהן%' OR last_buyer LIKE '%דוד כהן%' OR displayed_by LIKE '%דוד כהן%'
      LIMIT 5
    `);
    
    console.log('\nמוצרים הקשורים לדוד כהן:');
    samples.forEach(row => {
      console.log(`- ${row.name}: מזמין=${row.last_ordered_by_name}, קונה=${row.last_buyer}, מוצג=${row.displayed_by}`);
    });

  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSampleData();