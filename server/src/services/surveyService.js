import { pool } from "../db.js";

const getAllSurveyResponses = async (filters = {}) => {
  let query = `
    SELECT psr.*, p.name as product_name 
    FROM product_survey_responses psr 
    LEFT JOIN products p ON psr.product_id = p.id 
    WHERE 1=1
  `;
  const params = [];

  if (filters.product_id) {
    query += ` AND psr.product_id = ?`;
    params.push(filters.product_id);
  }
  if (filters.min_rating) {
    query += ` AND psr.rating >= ?`;
    params.push(filters.min_rating);
  }
  if (filters.max_rating) {
    query += ` AND psr.rating <= ?`;
    params.push(filters.max_rating);
  }
  if (filters.date_from) {
    query += ` AND psr.created_at >= ?`;
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    query += ` AND psr.created_at <= ?`;
    params.push(filters.date_to);
  }

  query += ` ORDER BY psr.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

const getSurveyResponseById = async (id) => {
  const [rows] = await pool.query(`
    SELECT psr.*, p.name as product_name 
    FROM product_survey_responses psr 
    LEFT JOIN products p ON psr.product_id = p.id 
    WHERE psr.id = ?
  `, [id]);
  return rows[0];
};

const getSurveyResponsesByProduct = async (productId) => {
  const [rows] = await pool.query(`
    SELECT psr.*, p.name as product_name 
    FROM product_survey_responses psr 
    LEFT JOIN products p ON psr.product_id = p.id 
    WHERE psr.product_id = ? 
    ORDER BY psr.created_at DESC
  `, [productId]);
  return rows;
};

const checkUserResponse = async (productId, userName, userEmail) => {
  const [rows] = await pool.query(
    "SELECT id FROM product_survey_responses WHERE product_id = ? AND user_name = ? AND user_email = ?",
    [productId, userName, userEmail]
  );
  return rows.length > 0;
};

const createSurveyResponse = async (surveyResponse) => {
  const { product_id, user_name, user_email, rating, answers } = surveyResponse;
  
  // Check if user already responded
  const hasResponded = await checkUserResponse(product_id, user_name, user_email);
  if (hasResponded) {
    throw new Error('משתמש זה כבר דירג את המוצר');
  }
  
  // שמירת התגובה עם התשובות כ-JSON
  const answersJson = answers ? JSON.stringify(answers) : null;
  
  const [result] = await pool.query(
    "INSERT INTO product_survey_responses (product_id, user_name, user_email, rating, answers) VALUES (?, ?, ?, ?, ?)",
    [product_id, user_name, user_email, rating, answersJson]
  );
  return { id: result.insertId, product_id, user_name, user_email, rating, answers, created_at: new Date() };
};

const updateSurveyResponse = async (id, surveyResponse) => {
  const { rating } = surveyResponse;
  const [result] = await pool.query(
    "UPDATE product_survey_responses SET rating = ? WHERE id = ?",
    [rating, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, rating };
};

const deleteSurveyResponse = async (id) => {
  const [result] = await pool.query("DELETE FROM product_survey_responses WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const resetProductSurvey = async (productId) => {
  try {
    console.log(`איפוס סקר למוצר ID: ${productId}`);
    
    // Validate productId
    if (!productId || productId <= 0) {
      throw new Error('מזהה מוצר לא תקין');
    }
    
    // בדיקה מוקדמת של מספר התגובות למחיקה
    const [countResult] = await pool.query(
      "SELECT COUNT(*) as count FROM product_survey_responses WHERE product_id = ?", 
      [productId]
    );
    const existingCount = countResult[0]?.count || 0;
    
    if (existingCount === 0) {
      console.log(`אין סקרים למוצר ${productId} למחיקה`);
      return 0;
    }
    
    // מחיקת התגובות
    const [result] = await pool.query(
      "DELETE FROM product_survey_responses WHERE product_id = ?", 
      [productId]
    );
    
    console.log(`נמחקו ${result.affectedRows} סקרים למוצר ${productId}`);
    
    return result.affectedRows;
  } catch (error) {
    console.error(`שגיאה באיפוס סקר מוצר ${productId}:`, error.message);
    throw error;
  }
};

export default {
  getAllSurveyResponses,
  getSurveyResponseById,
  getSurveyResponsesByProduct,
  checkUserResponse,
  createSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
  resetProductSurvey,
};