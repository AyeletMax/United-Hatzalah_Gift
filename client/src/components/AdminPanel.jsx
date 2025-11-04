import { useState, useEffect } from 'react';
import { useProducts } from './ProductsContext.jsx';
import { useAdmin } from './AdminContext.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import './AdminPanel.css';

const AdminPanel = () => {
  const { isAdminLoggedIn, setIsAdminLoggedIn } = useAdmin();
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminLoggedIn);
  const [password, setPassword] = useState('');
  const { products, refreshProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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
      window.showToast && window.showToast('התחברת בהצלחה!', 'success');
    } else {
      window.showToast && window.showToast('סיסמה שגויה', 'error');
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
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) {
        window.showToast && window.showToast('עריכת/הוספת מוצרים זמינה רק עם API מוגדר', 'warning');
        return;
      }
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      const url = selectedProduct 
        ? `${apiUrl}/api/products/${selectedProduct.id}` 
        : `${apiUrl}/api/products`;
      
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
        window.showToast && window.showToast('שגיאה בשמירה: ' + errorText, 'error');
        return;
      }
      
      const result = await response.json();
      console.log('הצלחה:', result);
      
      console.log('Trying to show admin toast:', window.showToast);
      if (window.showToast) {
        window.showToast(selectedProduct ? 'המוצר עודכן בהצלחה! השינויים נשמרו' : 'המוצר נוסף בהצלחה! המוצר זמין עכשיו באתר', 'success', 4000);
      } else {
        console.log('showToast not available in admin');
      }
      refreshProducts();
      // נקה את sessionStorage אחרי שמירה מוצלחת
      try {
        const key = selectedProduct 
          ? `uploadedImage_${selectedProduct.id}` 
          : 'uploadedImage_new';
        sessionStorage.removeItem(key);
      } catch {}
      setShowProductForm(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('שגיאה:', error);
      window.showToast && window.showToast('שגיאה: ' + error.message, 'error');
    }
  };

  const deleteProduct = async (id) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      const url = `${apiUrl}/api/products/${productToDelete}`;
      await fetch(url, { method: 'DELETE' });
      window.showToast && window.showToast('המוצר נמחק בהצלחה! הפעולה בוצעה', 'success', 3000);
      refreshProducts();
    } catch (error) {
      console.error('שגיאה במחיקת מוצר:', error);
      window.showToast && window.showToast('שגיאה במחיקת המוצר', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setProductToDelete(null);
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
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="מחיקת מוצר"
        message="האם אתה בטוח שברצונך למחוק את המוצר?פעולה זו לא ניתנת לביטול."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        confirmText="מחק"
        cancelText="ביטול"
      />
    </div>
  );
};

const ProductForm = ({ product, categories, onSave, onClose }) => {
  const [showEmptyFieldsConfirm, setShowEmptyFieldsConfirm] = useState(false);
  const [emptyFieldsList, setEmptyFieldsList] = useState([]);
  const [pendingFormData, setPendingFormData] = useState(null);
  
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
  
  // פונקציה ליצירת מפתח ייחודי לשמירת תמונה ב-sessionStorage
  const getStorageKey = () => `uploadedImage_${product?.id || 'new'}`;
  
  // טען תמונה מ-sessionStorage בעת אתחול
  const [uploadedImageUrl, setUploadedImageUrl] = useState(() => {
    try {
      const key = `uploadedImage_${product?.id || 'new'}`;
      const saved = sessionStorage.getItem(key);
      return saved || null;
    } catch {
      return null;
    }
  });

  // וידוא שהנתונים מעודכנים כשהמוצר משתנה, אבל שמור את התמונה שהועלתה
  useEffect(() => {
    if (product) {
      // נסה לטעון תמונה שהועלתה מ-sessionStorage (למקרה של דפלוי/רענון)
      try {
        const savedImage = sessionStorage.getItem(getStorageKey());
        if (savedImage && !uploadedImageUrl) {
          setUploadedImageUrl(savedImage);
        }
      } catch (error) {
        console.error('שגיאה בטעינת תמונה מ-sessionStorage:', error);
      }
      
      // שמור את התמונה שהועלתה אם קיימת ב-formData או ב-uploadedImageUrl, אחרת השתמש בתמונה מהמוצר
      // חשוב: prev.image_url יש עדיפות כדי לשמור תמונות שהועלו
      setFormData(prev => {
        const savedImage = sessionStorage.getItem(getStorageKey());
        const imageToUse = prev.image_url || uploadedImageUrl || savedImage || product.image_url || '';
        return {
          name: product.name || '',
          description: product.description || '',
          category_id: product.category_id || '',
          unit_price_incl_vat: product.unit_price_incl_vat || '',
          delivery_time_days: product.delivery_time_days || '',
          image_url: imageToUse,
          brand: product.brand || '',
          last_buyer: product.last_buyer || '',
          last_ordered_by_name: product.last_ordered_by_name || product.last_buyer || '',
          displayed_by: product.displayed_by || '',
          popularity_score: product.popularity_score || 0,
          brand_id: product.brand_id || null
        };
      });
    } else {
      // אם אין מוצר (הוספה חדשה), אפס את התמונה שהועלתה
      try {
        sessionStorage.removeItem(getStorageKey());
      } catch {}
      setUploadedImageUrl(null);
    }
  }, [product?.id, uploadedImageUrl]); // רץ כשה-ID משתנה או כשתמונה חדשה מועלת
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const envBase = import.meta.env.VITE_API_URL || '';
      const apiUrl = envBase
        ? (envBase.includes("localhost") || envBase.includes("onrender.com")
            ? envBase
            : `${envBase}.onrender.com`)
        : (window.location.origin.includes('localhost')
            ? 'http://localhost:3000'
            : 'https://hatzalah-gift.onrender.com');
      const url = `${apiUrl}/api/upload/image`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formDataUpload
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const resolvedUrl = result.imageUrl?.startsWith('http')
        ? result.imageUrl
        : `${apiUrl}${result.imageUrl}`;
      
      // שמור את התמונה בstate נפרד וב-sessionStorage כדי שלא תאבד בדפלוי
      setUploadedImageUrl(resolvedUrl);
      try {
        sessionStorage.setItem(getStorageKey(), resolvedUrl);
      } catch (error) {
        console.error('שגיאה בשמירת תמונה ב-sessionStorage:', error);
      }
      setFormData(prev => ({...prev, image_url: resolvedUrl}));
    } catch (error) {
      console.error('שגיאה בהעלאת תמונה:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    
    // בדיקת שדות חובה
    const missingFields = [];
    if (!formData.name?.trim()) missingFields.push('שם המוצר');
    if (!formData.category_id) missingFields.push('קטגוריה');
    if (!formData.unit_price_incl_vat) missingFields.push('מחיר');
    
    if (missingFields.length > 0) {
      window.showToast && window.showToast(`שדות חובה חסרים: ${missingFields.join(', ')}`, 'warning');
      return;
    }
    
    // בדיקת שדות אופציונליים ריקים
    const emptyOptionalFields = [];
    if (!formData.description?.trim()) emptyOptionalFields.push('תיאור');
    if (!formData.delivery_time_days) emptyOptionalFields.push('זמן אספקה');
    if (!formData.brand?.trim()) emptyOptionalFields.push('מותג');
    if (!formData.last_buyer?.trim()) emptyOptionalFields.push('לקוח אחרון');
    if (!formData.image_url?.trim()) emptyOptionalFields.push('תמונה');
    
    if (emptyOptionalFields.length > 0) {
      setEmptyFieldsList(emptyOptionalFields);
      setPendingFormData(cleanData);
      setShowEmptyFieldsConfirm(true);
      return;
    }
    
    // אם אין שדות ריקים, שמור ישירות
    proceedWithSave(cleanData);
  };
  
  const proceedWithSave = (data) => {
    console.log('שולח טופס:', data);
    console.log('תיאור מהטופס:', formData.description);
    console.log('תיאור מנוקה:', data.description);
    onSave(data);
  };
  
  const handleEmptyFieldsConfirm = () => {
    setShowEmptyFieldsConfirm(false);
    proceedWithSave(pendingFormData);
    setPendingFormData(null);
    setEmptyFieldsList([]);
  };
  
  const handleEmptyFieldsCancel = () => {
    setShowEmptyFieldsConfirm(false);
    setPendingFormData(null);
    setEmptyFieldsList([]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-form" onClick={(e) => e.stopPropagation()}>
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
        
        <ConfirmDialog
          isOpen={showEmptyFieldsConfirm}
          title="שדות ריקים"
          message={`השדות הבאים ריקים:\n${emptyFieldsList.join(', ')}\n\nהאם אתה בטוח שברצונך להמשיך?`}
          onConfirm={handleEmptyFieldsConfirm}
          onCancel={handleEmptyFieldsCancel}
          confirmText="המשך"
          cancelText="חזור לעריכה"
        />
      </div>
    </div>
  );
};

export default AdminPanel;