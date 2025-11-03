import { pool } from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getImageKitClient() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) return null;
  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

let ensuredColumn = false;
async function ensureImageFileIdColumn() {
  if (ensuredColumn) return;
  try {
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_file_id VARCHAR(255) NULL");
  } catch (e) {
    // ignore if not supported or already exists
  } finally {
    ensuredColumn = true;
  }
}

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
  await ensureImageFileIdColumn();
  console.log('[productService.createProduct] Input product:', product);
  console.log('[productService.createProduct] Description:', product.description);
  
  const [result] = await pool.query(
    "INSERT INTO products (name, description, category_id, brand_id, unit_price_incl_vat, delivery_time_days, last_ordered_by_name, image_url, image_file_id, brand, last_buyer, popularity_score, displayed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      product.name,
      product.description,
      product.category_id,
      product.brand_id || null,
      product.unit_price_incl_vat || 0,
      product.delivery_time_days || null,
      product.last_ordered_by_name || null,
      product.image_url || null,
      product.image_file_id || null,
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
  await ensureImageFileIdColumn();
  console.log('[productService.updateProduct] Input ID:', id);
  console.log('[productService.updateProduct] Input product:', product);
  
  const [result] = await pool.query(
    "UPDATE products SET name = ?, description = ?, category_id = ?, brand_id = ?, unit_price_incl_vat = ?, delivery_time_days = ?, last_ordered_by_name = ?, image_url = ?, image_file_id = ?, brand = ?, last_buyer = ?, popularity_score = ?, displayed_by = ? WHERE id = ?",
    [
      product.name,
      product.description || null,
      product.category_id,
      product.brand_id || null,
      product.unit_price_incl_vat || 0,
      product.delivery_time_days || null,
      product.last_ordered_by_name || null,
      product.image_url || null,
      product.image_file_id || null,
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
  await ensureImageFileIdColumn();
  // Fetch current image URL before deletion
  const [rows] = await pool.query("SELECT image_url, image_file_id FROM products WHERE id = ?", [id]);
  const product = rows[0];

  // Delete DB row
  const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  const deleted = result.affectedRows > 0;

  if (!deleted) return false;

  // Attempt to remove local uploaded file if exists
  try {
    const imageUrl = product?.image_url;
    if (imageUrl && imageUrl.includes('/uploads/')) {
      const afterUploads = imageUrl.split('/uploads/')[1];
      if (afterUploads) {
        const filename = afterUploads.split('?')[0];
        const uploadsDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[productService.deleteProduct] Local image deleted:', filePath);
        }
      }
    }

    // Attempt to delete from ImageKit if URL matches endpoint
    try {
      const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
      const ikClient = getImageKitClient();
      if (ikClient && endpoint && imageUrl && imageUrl.startsWith(endpoint)) {
        // Prefer delete by fileId if we have it
        if (product?.image_file_id) {
          try {
            await ikClient.deleteFile(product.image_file_id);
            console.log('[productService.deleteProduct] ImageKit delete by fileId OK:', product.image_file_id);
            return true;
          } catch {}
        }
        // Parse path and filename from the CDN URL
        let filename = '';
        let pathInIk = '/';
        try {
          const urlObj = new URL(imageUrl);
          const parts = urlObj.pathname.split('/').filter(Boolean);
          // parts: [<ik_id>, ...path, filename]
          if (parts.length >= 2) {
            filename = parts[parts.length - 1] || '';
            const folderParts = parts.slice(1, -1); // skip account id segment
            pathInIk = '/' + folderParts.join('/');
            if (pathInIk === '/') pathInIk = '/';
          }
        } catch {}

        // 1) Try listFiles with folder path and name
        let fileIdToDelete = '';
        if (filename) {
          try {
            const list = await ikClient.listFiles({ path: pathInIk, name: filename, limit: 1 });
            const file = Array.isArray(list) ? list[0] : null;
            if (file && file.fileId) {
              fileIdToDelete = file.fileId;
            }
          } catch {}
        }

        // 2) Fallback: searchQuery by name
        if (!fileIdToDelete && filename) {
          try {
            const listSearch = await ikClient.listFiles({ searchQuery: `name = "${filename}"`, limit: 1 });
            const file = Array.isArray(listSearch) ? listSearch[0] : null;
            if (file && file.fileId) {
              fileIdToDelete = file.fileId;
            }
          } catch {}
        }

        if (fileIdToDelete) {
          await ikClient.deleteFile(fileIdToDelete);
          console.log('[productService.deleteProduct] ImageKit delete by lookup OK:', fileIdToDelete, 'path:', pathInIk, 'name:', filename);
        }
      }
    } catch (ikErr) {
      console.error('[productService.deleteProduct] Failed to delete from ImageKit:', ikErr?.message || ikErr);
    }
  } catch (err) {
    // Log but do not fail the request if file deletion fails
    console.error('[productService.deleteProduct] Failed to delete image file:', err.message);
  }

  return true;
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};