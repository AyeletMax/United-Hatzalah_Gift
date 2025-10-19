import React, { useState } from "react";
import "./ProductList.css";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext.jsx";
import { useProducts } from "./ProductsContext.jsx";

export default function ProductList({ products = [], categorySlug }) {
  const navigate = useNavigate();
  const { isAdminLoggedIn } = useAdmin();
  const { refreshProducts } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories] = useState([
    { id: 1, name: "לרכב" },
    { id: 2, name: "טקסטיל וביגוד" },
    { id: 3, name: "כלי בית" },
    { id: 4, name: "יודאיקה" },
    { id: 5, name: "מוצרים חדשים" },
    { id: 6, name: "מתנות" },
    { id: 7, name: "מוצרי קיץ" },
    { id: 8, name: "מוצרי חורף" },
    { id: 9, name: "אביזרי יח\"\u05e6" },
    { id: 10, name: "תיקים" }
  ]);

  const handleProductClick = (product) => {
    const productSlug = product.name.replace(/\s+/g, '-');
    if (categorySlug) {
      navigate(`/${categorySlug}/${productSlug}`);
    } else {
      // For search results, find the category from the product
      const categories = [
        { id: 1, slug: "לרכב" },
        { id: 2, slug: "טקסטיל-וביגוד" },
        { id: 3, slug: "כלי-בית" },
        { id: 4, slug: "יודאיקה" },
        { id: 5, slug: "מוצרים-חדשים" },
        { id: 6, slug: "מתנות" },
        { id: 7, slug: "מוצרי-קיץ" },
        { id: 8, slug: "מוצרי-חורף" },
        { id: 9, slug: "אביזרי-יחץ" },
        { id: 10, slug: "תיקים" }
      ];
      const category = categories.find(c => c.id === product.category_id);
      if (category) {
        navigate(`/${category.slug}/${productSlug}`);
      }
    }
  };

  const saveProduct = async (productData) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      
      await fetch(`${apiUrl}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      refreshProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error('שגיאה בעדכון מוצר:', error);
    }
  };

  const deleteProduct = async (productId, e) => {
    e.stopPropagation();
    if (confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const apiUrl = baseUrl.includes("localhost")
          ? baseUrl
          : baseUrl.includes("onrender.com")
          ? baseUrl
          : `${baseUrl}.onrender.com`;
        await fetch(`${apiUrl}/api/products/${productId}`, { method: 'DELETE' });
        refreshProducts();
      } catch (error) {
        console.error('שגיאה במחיקת מוצר:', error);
      }
    }
  };

  if (!products.length) {
    return (
      <div className="product-list-empty">לא נמצאו מוצרים בקטגוריה זו.</div>
    );
  }
  
  return (
    <div className={`product-list-grid ${editingProduct ? 'modal-open' : ''}`}>
        {products.map((p) => (
          <div className="product-card" key={p.id} onClick={() => handleProductClick(p)}>
          {p.image_url && (
            <img 
              src={p.image_url} 
              alt={p.name} 
              className="product-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          <div className="product-placeholder" style={{ display: 'none', width: '120px', height: '120px', background: '#f0f0f0', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '48px' }}>
            📦
          </div>
          <div className="product-info">
            <div className="product-name">{p.name}</div>
            {p.unit_price_incl_vat && (
              <div className="product-price">₪{p.unit_price_incl_vat}</div>
            )}
            {p.category_name && (
              <div className="product-category">{p.category_name}</div>
            )}
          </div>
          {isAdminLoggedIn && !editingProduct && (
            <div className="admin-actions" onClick={(e) => e.stopPropagation()}>
              <button className="edit-btn" onClick={(e) => {
                e.stopPropagation();
                setEditingProduct(p);
              }}>ערוך</button>
              <button className="delete-btn" onClick={(e) => deleteProduct(p.id, e)}>מחק</button>
            </div>
          )}
          </div>
        ))}
        
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onSave={saveProduct}
            onClose={() => setEditingProduct(null)}
          />
        )}
    </div>
  );
}

const ProductForm = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    unit_price_incl_vat: product?.unit_price_incl_vat || '',
    delivery_time_days: product?.delivery_time_days || '',
    image_url: product?.image_url || ''
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div className="product-form" style={{ zIndex: 1000000 }}>
        <h2>עריכת מוצר</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="שם המוצר"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            required
          >
            <option value="">בחר קטגוריה</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input
            type="number"
            step="0.01"
            placeholder="מחיר"
            value={formData.unit_price_incl_vat}
            onChange={(e) => setFormData({...formData, unit_price_incl_vat: e.target.value})}
            required
          />
          
          <input
            type="number"
            placeholder="זמן אספקה (ימים)"
            value={formData.delivery_time_days}
            onChange={(e) => setFormData({...formData, delivery_time_days: e.target.value})}
          />
          
          <div className="form-actions">
            <button type="submit">שמור</button>
            <button type="button" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
};
