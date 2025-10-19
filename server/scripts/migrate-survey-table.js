import { pool } from '../src/db.js';

async function migrateSurveyTable() {
  try {
    console.log('Starting migration of product_survey_responses table...');
    
    // Check if columns already exist
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'product_survey_responses' 
      AND COLUMN_NAME IN ('user_name', 'user_email')
    `);
    
    if (columns.length === 0) {
      // Add new columns
      await pool.query(`
        ALTER TABLE product_survey_responses 
        ADD COLUMN user_name VARCHAR(255) NOT NULL DEFAULT '',
        ADD COLUMN user_email VARCHAR(255) NOT NULL DEFAULT ''
      `);
      
      console.log('Added user_name and user_email columns');
      
      // Add unique constraint
      await pool.query(`
        ALTER TABLE product_survey_responses 
        ADD CONSTRAINT ux_psr_product_user UNIQUE (product_id, user_name, user_email)
      `);
      
      console.log('Added unique constraint for product_id, user_name, user_email');
    } else {
      console.log('Columns already exist, skipping migration');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateSurveyTable().catch(console.error);