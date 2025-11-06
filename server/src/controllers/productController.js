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
    console.log('\n=== CREATE PRODUCT REQUEST ===');
    console.log('[createProduct] Headers:', req.headers);
    console.log('[createProduct] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[createProduct] Body type:', typeof req.body);
    console.log('[createProduct] Body keys:', Object.keys(req.body));
    
    // וידוא שדות חובה
    if (!req.body.name || !req.body.category_id) {
      console.log('[createProduct] Missing required fields:', {
        name: req.body.name,
        category_id: req.body.category_id
      });
      return res.status(400).json({ 
        error: 'שם המוצר וקטגוריה הם שדות חובה',
        received: { name: req.body.name, category_id: req.body.category_id }
      });
    }
    
    // Clean up empty strings for numeric fields
    // delivery_time_days is INT UNSIGNED - must be null or positive integer
    let deliveryTimeDays = null;
    if (req.body.delivery_time_days !== '' && 
        req.body.delivery_time_days !== null && 
        req.body.delivery_time_days !== undefined) {
      const parsed = parseInt(req.body.delivery_time_days);
      if (!isNaN(parsed) && parsed >= 0) {
        deliveryTimeDays = parsed;
      }
    }
    
    const cleanedData = {
      ...req.body,
      delivery_time_days: deliveryTimeDays,
      unit_price_incl_vat: req.body.unit_price_incl_vat === '' ? 0 : parseFloat(req.body.unit_price_incl_vat),
      category_id: parseInt(req.body.category_id),
      brand_id: req.body.brand_id ? parseInt(req.body.brand_id) : null,
      popularity_score: req.body.popularity_score ? parseInt(req.body.popularity_score) : 0,
      is_new: req.body.is_new || false
    };
    
    console.log('[createProduct] Cleaned data:', JSON.stringify(cleanedData, null, 2));
    
    const newProduct = await productService.createProduct(cleanedData);
    console.log('[createProduct] Created product:', JSON.stringify(newProduct, null, 2));
    console.log('=== CREATE PRODUCT SUCCESS ===\n');
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('=== CREATE PRODUCT ERROR ===');
    console.error('[createProduct] Error:', err);
    console.error('[createProduct] Stack:', err.stack);
    console.error('=== END ERROR ===\n');
    res.status(500).json({ error: err.message, details: err.stack });
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log('[updateProduct] Request body:', req.body);
    console.log('[updateProduct] Product ID:', req.params.id);
    
    // וידוא שדות חובה
    if (!req.body.name || !req.body.category_id) {
      return res.status(400).json({ 
        error: 'שם המוצר וקטגוריה הם שדות חובה' 
      });
    }
    
    // Clean up empty strings for numeric fields
    // delivery_time_days is INT UNSIGNED - must be null or positive integer
    let deliveryTimeDays = null;
    if (req.body.delivery_time_days !== '' && 
        req.body.delivery_time_days !== null && 
        req.body.delivery_time_days !== undefined) {
      const parsed = parseInt(req.body.delivery_time_days);
      if (!isNaN(parsed) && parsed >= 0) {
        deliveryTimeDays = parsed;
      }
    }
    
    const cleanedData = {
      ...req.body,
      delivery_time_days: deliveryTimeDays,
      unit_price_incl_vat: req.body.unit_price_incl_vat === '' ? 0 : parseFloat(req.body.unit_price_incl_vat),
      category_id: parseInt(req.body.category_id),
      brand_id: req.body.brand_id ? parseInt(req.body.brand_id) : null,
      popularity_score: req.body.popularity_score ? parseInt(req.body.popularity_score) : 0,
      is_new: req.body.is_new || false
    };
    
    console.log('[updateProduct] Cleaned data:', cleanedData);
    
    const updatedProduct = await productService.updateProduct(req.params.id, cleanedData);
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    
    console.log('[updateProduct] Updated product:', updatedProduct);
    res.json(updatedProduct);
  } catch (err) {
    console.error('[updateProduct] Error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
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