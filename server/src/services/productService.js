import { pool } from "../db.js";

const getAllProducts = async (filters = {}) => {
  let query = `
    SELECT p.*, c.name as category_name, b.name as brand_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.name) {
    query += ` AND p.name LIKE ?`;
    params.push(`%${filters.name}%`);
  }
  if (filters.category_id) {
    query += ` AND p.category_id = ?`;
    params.push(filters.category_id);
  }
  if (filters.brand_id) {
    query += ` AND p.brand_id = ?`;
    params.push(filters.brand_id);
  }
  if (filters.min_price) {
    query += ` AND p.unit_price_incl_vat >= ?`;
    params.push(filters.min_price);
  }
  if (filters.max_price) {
    query += ` AND p.unit_price_incl_vat <= ?`;
    params.push(filters.max_price);
  }
  if (filters.max_delivery_days) {
    query += ` AND (p.delivery_time_days IS NULL OR p.delivery_time_days <= ?)`;
    params.push(filters.max_delivery_days);
  }
  if (filters.last_ordered_by) {
    query += ` AND (p.last_ordered_by_name LIKE ? OR p.last_buyer LIKE ?)`;
    params.push(`%${filters.last_ordered_by}%`, `%${filters.last_ordered_by}%`);
  }
  if (filters.brand) {
    query += ` AND (p.brand LIKE ? OR b.name LIKE ?)`;
    params.push(`%${filters.brand}%`, `%${filters.brand}%`);
  }

  query += ` ORDER BY p.name`;

  const [rows] = await pool.query(query, params);
  return rows;
};

const getProductById = async (id) => {
  const [rows] = await pool.query(`
    SELECT p.*, c.name as category_name, b.name as brand_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id 
    WHERE p.id = ?
  `, [id]);
  return rows[0];
};

const createProduct = async (product) => {
  const { name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, brand, last_buyer, popularity_score } = product;
  const [result] = await pool.query(
    "INSERT INTO products (name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, brand, last_buyer, popularity_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, category_id, brand_id, unit_price_incl_vat || 0, delivery_time_days || null, last_ordered_by_name, image_url, brand, last_buyer, popularity_score || 0]
  );
  return { id: result.insertId, name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, brand, last_buyer, popularity_score };
};

const updateProduct = async (id, product) => {
  const { name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, brand, last_buyer, popularity_score } = product;
  const [result] = await pool.query(
    "UPDATE products SET name = ?, category_id = ?, brand_id = ?, unit_price_incl_vat = ?, delivery_time_days = ?, last_ordered_by_name = ?, image_url = ?, brand = ?, last_buyer = ?, popularity_score = ? WHERE id = ?",
    [name, category_id, brand_id, unit_price_incl_vat, delivery_time_days || null, last_ordered_by_name, image_url, brand, last_buyer, popularity_score || 0, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, name, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, brand, last_buyer, popularity_score };
};

const deleteProduct = async (id) => {
  const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};