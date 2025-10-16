import { pool } from "../db.js";

const getAllCategories = async (filters = {}) => {
  let query = "SELECT * FROM categories WHERE 1=1";
  const params = [];

  if (filters.name) {
    query += " AND name LIKE ?";
    params.push(`%${filters.name}%`);
  }

  query += " ORDER BY name";

  const [rows] = await pool.query(query, params);
  return rows;
};

const getCategoryById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
  return rows[0];
};

const createCategory = async (category) => {
  const { name } = category;
  const [result] = await pool.query(
    "INSERT INTO categories (name) VALUES (?)",
    [name]
  );
  return { id: result.insertId, name };
};

const updateCategory = async (id, category) => {
  const { name } = category;
  const [result] = await pool.query(
    "UPDATE categories SET name = ? WHERE id = ?",
    [name, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, name };
};

const deleteCategory = async (id) => {
  const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};