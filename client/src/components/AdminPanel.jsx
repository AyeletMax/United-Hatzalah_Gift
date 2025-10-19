import { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ;

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('סיסמה שגויה');
    }
  };

  const loadData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/api/products`),
        fetch(`${apiUrl}/api/categories`)
      ]);
      setProducts(await productsRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    }
  };

  const saveProduct = async (productData) => {
    try {
      const method = selectedProduct ? 'PUT' : 'POST';
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      const endPath = selectedProduct ? `api/products/${selectedProduct.id}` : 'api/products';
      const url = `${apiUrl}/${endPath}`;
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      loadData();
      setShowProductForm(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('שגיאה בשמירת מוצר:', error);
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const apiUrl = baseUrl.includes("localhost")
          ? baseUrl
          : baseUrl.includes("onrender.com")
          ? baseUrl
          : `${baseUrl}.onrender.com`;
        const url = `${apiUrl}/api/products/${id}`;
        await fetch(url, { method: 'DELETE' });
        loadData();
      } catch (error) {
        console.error('שגיאה במחיקת מוצר:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h2>כניסת מנהל</h2>
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin}>כניסה</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>פאנל ניהול</h1>
      
      <div className="admin-actions">
        <button onClick={() => setShowProductForm(true)}>הוסף מוצר חדש</button>
        <button onClick={loadData}>רענן נתונים</button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.image_url && <img src={product.image_url} alt={product.name} />}
            <h3>{product.name}</h3>
            <p>מחיר: ₪{product.unit_price_incl_vat}</p>
            <div className="card-actions">
              <button onClick={() => {
                setSelectedProduct(product);
                setShowProductForm(true);
              }}>ערוך</button>
              <button onClick={() => deleteProduct(product.id)} className="delete-btn">מחק</button>
            </div>
          </div>
        ))}
      </div>

      {showProductForm && (
        <ProductForm
          product={selectedProduct}
          categories={categories}
          onSave={saveProduct}
          onClose={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

const ProductForm = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || '',
    unit_price_incl_vat: product?.unit_price_incl_vat || '',
    delivery_time_days: product?.delivery_time_days || '',
    image_url: product?.image_url || ''
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      const url = `${apiUrl}/api/upload/image`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formDataUpload
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const fullImageUrl = `${apiUrl}${result.imageUrl}`;
      setFormData({...formData, image_url: fullImageUrl});
    } catch (error) {
      console.error('שגיאה בהעלאת תמונה:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="product-form">
        <h2>{product ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
        
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
          
          <div className="image-upload-section">
            <label>תמונה:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading && <span>מעלה תמונה...</span>}
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="תצוגה מקדימה" style={{width: '100px', height: '100px', objectFit: 'cover'}} />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="submit">שמור</button>
            <button type="button" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;