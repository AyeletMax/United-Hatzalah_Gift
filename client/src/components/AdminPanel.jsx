import { useState, useEffect } from 'react';
import { useProducts } from './ProductsContext.jsx';
import { useAdmin } from './AdminContext.jsx';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdminLoggedIn, setIsAdminLoggedIn } = useAdmin();
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminLoggedIn);
  const [password, setPassword] = useState('');
  const { products, refreshProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ;

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
      
      // Check if editing a product from URL
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');
      if (editId) {
        // Find and set the product for editing
        const productToEdit = products.find(p => p.id === parseInt(editId));
        if (productToEdit) {
          setSelectedProduct(productToEdit);
          setShowProductForm(true);
        }
        // Clear the URL parameter
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [isAuthenticated, products]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setIsAdminLoggedIn(true);
      loadCategories();
    } else {
      alert('סיסמה שגויה');
    }
  };

  const loadCategories = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      
      const categoriesRes = await fetch(`${apiUrl}/api/categories`);
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('שגיאה בטעינת קטגוריות:', error);
    }
  };

  const saveProduct = async (productData) => {
    try {
      console.log('שומר מוצר:', productData);
      
      const method = selectedProduct ? 'PUT' : 'POST';
      const url = selectedProduct 
        ? `http://localhost:3000/api/products/${selectedProduct.id}` 
        : 'http://localhost:3000/api/products';
      
      console.log('שולח ל:', url);
      console.log('נתונים:', JSON.stringify(productData));
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      console.log('תגובה:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('שגיאה:', errorText);
        alert('שגיאה בשמירה: ' + errorText);
        return;
      }
      
      const result = await response.json();
      console.log('הצלחה:', result);
      
      alert(selectedProduct ? 'המוצר עודכן!' : 'המוצר נוסף!');
      refreshProducts();
      setShowProductForm(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('שגיאה:', error);
      alert('שגיאה: ' + error.message);
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
        refreshProducts();
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
      <div className="admin-header">
        <h1>פאנל ניהול</h1>
      </div>
      
      <div className="admin-info">
        <p>כדי לערוך או למחוק מוצרים, עבור לקטגוריה הרצויה באתר</p>
      </div>

      <div className="admin-actions">
        <button 
          onClick={() => {
            console.log('Add product button clicked');
            setShowProductForm(true);
          }}
          style={{ display: 'block', visibility: 'visible' }}
        >
          הוסף מוצר חדש
        </button>

        <button className="logout-btn" onClick={() => {
          setIsAuthenticated(false);
          setIsAdminLoggedIn(false);
        }}>יציאה</button>
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
    description: product?.description || '',
    category_id: product?.category_id || '',
    unit_price_incl_vat: product?.unit_price_incl_vat || '',
    delivery_time_days: product?.delivery_time_days || '',
    image_url: product?.image_url || '',
    brand: product?.brand || '',
    last_buyer: product?.last_buyer || '',
    last_ordered_by_name: product?.last_ordered_by_name || product?.last_buyer || '',
    displayed_by: product?.displayed_by || '',
    popularity_score: product?.popularity_score || 0,
    brand_id: product?.brand_id || null
  });
  
  console.log('ProductForm initialized with product:', product);
  console.log('ProductForm formData:', formData);
  
  // וידוא שהנתונים מעודכנים כשהמוצר משתנה
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        unit_price_incl_vat: product.unit_price_incl_vat || '',
        delivery_time_days: product.delivery_time_days || '',
        image_url: product.image_url || '',
        brand: product.brand || '',
        last_buyer: product.last_buyer || '',
        last_ordered_by_name: product.last_ordered_by_name || product.last_buyer || '',
        displayed_by: product.displayed_by || '',
        popularity_score: product.popularity_score || 0,
        brand_id: product.brand_id || null
      });
    }
  }, [product]);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    
    if (!formData.name || !formData.category_id || !formData.unit_price_incl_vat) {
      alert('אנא מלא את כל השדות החובה');
      return;
    }
    
    const cleanData = {
      name: formData.name.trim(),
      description: formData.description ? formData.description.trim() : null,
      category_id: parseInt(formData.category_id),
      unit_price_incl_vat: parseFloat(formData.unit_price_incl_vat),
      delivery_time_days: formData.delivery_time_days ? parseInt(formData.delivery_time_days) : null,
      image_url: formData.image_url || null,
      brand: formData.brand ? formData.brand.trim() : null,
      last_buyer: formData.last_buyer ? formData.last_buyer.trim() : null,
      last_ordered_by_name: formData.last_ordered_by_name ? formData.last_ordered_by_name.trim() : (formData.last_buyer ? formData.last_buyer.trim() : null),
      displayed_by: formData.displayed_by ? formData.displayed_by.trim() : null,
      popularity_score: 0,
      brand_id: null
    };
    
    console.log('תיאור שנשלח:', cleanData.description);
    
    console.log('שולח טופס:', cleanData);
    console.log('תיאור מהטופס:', formData.description);
    console.log('תיאור מנוקה:', cleanData.description);
    onSave(cleanData);
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
          
          <textarea
            placeholder="תיאור המוצר"
            value={formData.description || ''}
            onChange={(e) => {
              console.log('מעדכן תיאור:', e.target.value);
              setFormData({...formData, description: e.target.value});
            }}
            rows="3"
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
          
          <input
            type="text"
            placeholder="מותג"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
          />
          
          <input
            type="text"
            placeholder="לקוח אחרון שקנה"
            value={formData.last_buyer}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData, 
                last_buyer: value,
                last_ordered_by_name: value
              });
            }}
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