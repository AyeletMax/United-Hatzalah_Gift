import { pool } from '../src/db.js';

async function addIsNewField() {
  try {
    console.log('Adding is_new field to products table...');
    
    // Add is_new column
    await pool.execute(`
      ALTER TABLE products 
      ADD COLUMN is_new BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ is_new field added successfully');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ is_new field already exists');
    } else {
      console.error('❌ Error adding is_new field:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

addIsNewField();