import { pool } from "../db.js";

const getAllBrands = async (filters = {}) => {
  let query = "SELECT * FROM brands WHERE 1=1";
  const params = [];

  if (filters.name) {
    query += " AND name LIKE ?";
    params.push(`%${filters.name}%`);
  }

  query += " ORDER BY name";

  const [rows] = await pool.query(query, params);
  return rows;
};

const getBrandById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM brands WHERE id = ?", [id]);
  return rows[0];
};

const createBrand = async (brand) => {
  const { name } = brand;
  const [result] = await pool.query(
    "INSERT INTO brands (name) VALUES (?)",
    [name]
  );
  return { id: result.insertId, name };
};

const updateBrand = async (id, brand) => {
  const { name } = brand;
  const [result] = await pool.query(
    "UPDATE brands SET name = ? WHERE id = ?",
    [name, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, name };
};

const deleteBrand = async (id) => {
  const [result] = await pool.query("DELETE FROM brands WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export default {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};