import { pool } from "../db.js";

const getAllCatalogs = async (filters = {}) => {
  let query = "SELECT * FROM catalogs WHERE 1=1";
  const params = [];

  if (filters.name) {
    query += " AND name LIKE ?";
    params.push(`%${filters.name}%`);
  }

  query += " ORDER BY name";

  const [rows] = await pool.query(query, params);
  return rows;
};

const getCatalogById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM catalogs WHERE id = ?", [id]);
  return rows[0];
};

const createCatalog = async (catalog) => {
  const { name, pdf_url } = catalog;
  const [result] = await pool.query(
    "INSERT INTO catalogs (name, pdf_url) VALUES (?, ?)",
    [name, pdf_url]
  );
  return { id: result.insertId, name, pdf_url };
};

const updateCatalog = async (id, catalog) => {
  const { name, pdf_url } = catalog;
  const [result] = await pool.query(
    "UPDATE catalogs SET name = ?, pdf_url = ? WHERE id = ?",
    [name, pdf_url, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, name, pdf_url };
};

const deleteCatalog = async (id) => {
  const [result] = await pool.query("DELETE FROM catalogs WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export default {
  getAllCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog,
};