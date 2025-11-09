import { pool } from '../src/db.js';

async function addAnswersField() {
  try {
    console.log('Adding answers field to product_survey_responses table...');
    
    // Check if column already exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'product_survey_responses' 
      AND COLUMN_NAME = 'answers'
    `);
    
    if (columns.length === 0) {
      // Add new column
      await pool.query(`
        ALTER TABLE product_survey_responses 
        ADD COLUMN answers JSON NULL
      `);
      
      console.log('Added answers column successfully');
    } else {
      console.log('Answers column already exists, skipping migration');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addAnswersField().catch(console.error);