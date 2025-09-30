import { pool } from "../db.js";

const getAllQuestions = async (filters = {}) => {
  let query = "SELECT * FROM questions WHERE 1=1";
  const params = [];

  if (filters.question_text) {
    query += " AND question_text LIKE ?";
    params.push(`%${filters.question_text}%`);
  }

  query += " ORDER BY id";

  const [rows] = await pool.query(query, params);
  return rows;
};

const getQuestionById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM questions WHERE id = ?", [id]);
  return rows[0];
};

const createQuestion = async (question) => {
  const { question_text } = question;
  const [result] = await pool.query(
    "INSERT INTO questions (question_text) VALUES (?)",
    [question_text]
  );
  return { id: result.insertId, question_text };
};

const updateQuestion = async (id, question) => {
  const { question_text } = question;
  const [result] = await pool.query(
    "UPDATE questions SET question_text = ? WHERE id = ?",
    [question_text, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, question_text };
};

const deleteQuestion = async (id) => {
  const [result] = await pool.query("DELETE FROM questions WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};