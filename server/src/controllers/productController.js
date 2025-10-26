import productService from "../services/productService.js";

const getAllProducts = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      category_id: req.query.category_id,
      brand_id: req.query.brand_id,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      max_delivery_days: req.query.max_delivery_days,
      last_ordered_by: req.query.last_ordered_by
    };
    const products = await productService.getAllProducts(filters);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log('[createProduct] Request body:', req.body);
    
    // Clean up empty strings for numeric fields
    const cleanedData = {
      ...req.body,
      delivery_time_days: req.body.delivery_time_days === '' ? null : req.body.delivery_time_days,
      unit_price_incl_vat: req.body.unit_price_incl_vat === '' ? 0 : req.body.unit_price_incl_vat
    };
    
    const newProduct = await productService.createProduct(cleanedData);
    console.log('[createProduct] Created product:', newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('[createProduct] Error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
};

const updateProduct = async (req, res) => {
  try {
    // Clean up empty strings for numeric fields
    const cleanedData = {
      ...req.body,
      delivery_time_days: req.body.delivery_time_days === '' ? null : req.body.delivery_time_days,
      unit_price_incl_vat: req.body.unit_price_incl_vat === '' ? 0 : req.body.unit_price_incl_vat
    };
    
    const updatedProduct = await productService.updateProduct(req.params.id, cleanedData);
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};