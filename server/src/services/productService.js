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
    query += ` AND (LOWER(p.last_ordered_by_name) LIKE LOWER(?) OR LOWER(p.last_buyer) LIKE LOWER(?) OR LOWER(p.displayed_by) LIKE LOWER(?))`;
    params.push(`%${filters.last_ordered_by}%`, `%${filters.last_ordered_by}%`, `%${filters.last_ordered_by}%`);
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
  console.log('[productService.createProduct] Input product:', product);
  console.log('[productService.createProduct] Description:', product.description);
  
  const [result] = await pool.query(
    "INSERT INTO products (name, description, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, brand, last_buyer, popularity_score, displayed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      product.name,
      product.description,
      product.category_id,
      product.brand_id || null,
      product.unit_price_incl_vat || 0,
      product.delivery_time_days || null,
      product.last_ordered_by_name || null,
      product.image_url || null,
      product.brand || null,
      product.last_buyer || null,
      product.popularity_score || 0,
      product.displayed_by || null
    ]
  );
  
  console.log('[productService.createProduct] Inserted with description:', product.description);
  
  return { 
    id: result.insertId, 
    ...product
  };
};

const updateProduct = async (id, product) => {
  console.log('[productService.updateProduct] Input ID:', id);
  console.log('[productService.updateProduct] Input product:', product);
  
  const [result] = await pool.query(
    "UPDATE products SET name = ?, description = ?, category_id = ?, brand_id = ?, unit_price_incl_vat = ?, delivery_time_days = ?, last_ordered_by_name = ?, image_url = ?, brand = ?, last_buyer = ?, popularity_score = ?, displayed_by = ? WHERE id = ?",
    [
      product.name,
      product.description || null,
      product.category_id,
      product.brand_id || null,
      product.unit_price_incl_vat || 0,
      product.delivery_time_days || null,
      product.last_ordered_by_name || null,
      product.image_url || null,
      product.brand || null,
      product.last_buyer || null,
      product.popularity_score || 0,
      product.displayed_by || null,
      id
    ]
  );
  
  if (result.affectedRows === 0) return null;
  
  return { 
    id: parseInt(id), 
    ...product
  };
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