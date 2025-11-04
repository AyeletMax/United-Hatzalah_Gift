import React, { useState, useEffect } from "react";
import "./ProductList.css";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext.jsx";
import { useProducts } from "./ProductsContext.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

export default function ProductList({ products = [], categorySlug }) {
  const navigate = useNavigate();
  const { isAdminLoggedIn } = useAdmin();
  const { refreshProducts } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // טעינת קטגוריות מהשרת
  const loadCategories = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) {
        setCategories([
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
        return;
      }
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      
      const categoriesRes = await fetch(`${apiUrl}/api/categories`);
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('שגיאה בטעינת קטגוריות:', error);
      // fallback לקטגוריות סטטיות
      setCategories([
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
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadCategories();
    }
  }, [isAdminLoggedIn]);

  const handleProductClick = (product) => {
    if (categorySlug) {
      navigate(`/${categorySlug}/${product.id}`);
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
        navigate(`/${category.slug}/${product.id}`);
      }
    }
  };

  const saveProduct = async (productData) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (!baseUrl) {
      window.showToast && window.showToast('עריכת מוצרים זמינה רק במצב פיתוח', 'warning');
      setEditingProduct(null);
      return;
    }
    try {
      console.log('מעדכן מוצר:', productData);
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      
      const response = await fetch(`${apiUrl}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('שגיאה בתגובה:', errorData);
        window.showToast && window.showToast(`שגיאה בעדכון המוצר: ${response.status} - ${errorData}`, 'error');
        return;
      }
      
      const result = await response.json();
      console.log('מוצר עודכן בהצלחה:', result);
      
      window.showToast && window.showToast('המוצר עודכן בהצלחה! השינויים נשמרו', 'success', 4000);
      refreshProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error('שגיאה בעדכון מוצר:', error);
      window.showToast && window.showToast(`שגיאה בעדכון המוצר: ${error.message}`, 'error');
    }
  };

  const deleteProduct = async (productId, e) => {
    e.stopPropagation();
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) {
        window.showToast && window.showToast('לא ניתן למחוק מוצרים בענן', 'error');
        return;
      }
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      await fetch(`${apiUrl}/api/products/${productToDelete}`, { method: 'DELETE' });
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





  if (!products.length) {
    return (
      <div className="product-list-empty">לא נמצאו מוצרים בקטגוריה זו.</div>
    );
  }
  


  return (
    <>
      <div className={`product-list-grid ${editingProduct ? 'modal-open' : ''}`}>
        {products.map((p) => (
          <div className="product-card" key={p.id} onClick={() => handleProductClick(p)}>
          {p.image_url && !p.image_url.includes('via.placeholder') && (
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
          {(!p.image_url || p.image_url.includes('via.placeholder')) && (
            <div className="product-placeholder" style={{ display: 'flex', width: '120px', height: '120px', background: '#f0f0f0', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '48px' }}>
              📦
            </div>
          )}

          <div className="product-info">
            <div className="product-name">{p.name}</div>
            {p.unit_price_incl_vat && (
              <div className="product-price">₪{p.unit_price_incl_vat}</div>
            )}
            {p.category_name && (
              <div className="product-category">{p.category_name}</div>
            )}
            {isAdminLoggedIn && !editingProduct && (
              <div className="admin-actions" onClick={(e) => e.stopPropagation()}>
                <button className="edit-btn" onClick={(e) => {
                  e.stopPropagation();
                  setEditingProduct(p);
                }} title="ערוך">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button className="delete-btn" onClick={(e) => deleteProduct(p.id, e)} title="מחק">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
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
    </>
  );
}

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
    is_new: product?.is_new || false
  });
  const [uploading, setUploading] = useState(false);

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
      setFormData({...formData, image_url: resolvedUrl});
    } catch (error) {
      console.error('שגיאה בהעלאת תמונה:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // בדיקת שדות חובה
    const missingFields = [];
    if (!formData.name?.trim()) missingFields.push('שם המוצר');
    if (!formData.category_id) missingFields.push('קטגוריה');
    if (!formData.unit_price_incl_vat || formData.unit_price_incl_vat <= 0) missingFields.push('מחיר תקין');
    
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
      setPendingFormData(formData);
      setShowEmptyFieldsConfirm(true);
      return;
    }
    
    // אם אין שדות ריקים, שמור ישירות
    proceedWithSave(formData);
  };
  
  const proceedWithSave = (data) => {
    const cleanedData = {
      ...data,
      is_new: formData.is_new || false
    };
    console.log('שולח נתוני מוצר לעדכון:', cleanedData);
    onSave(cleanedData);
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
    <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={onClose}>
      <div className="product-form" style={{ zIndex: 1000000 }} onClick={(e) => e.stopPropagation()}>
        <h2>עריכת מוצר</h2>
        
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
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
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
            min="0"
            placeholder="מחיר"
            value={formData.unit_price_incl_vat}
            onChange={(e) => setFormData({...formData, unit_price_incl_vat: e.target.value})}
            onWheel={(e) => e.target.blur()}
            required
          />
          
          <input
            type="number"
            min="0"
            placeholder="זמן אספקה (ימים)"
            value={formData.delivery_time_days}
            onChange={(e) => setFormData({...formData, delivery_time_days: e.target.value})}
            onWheel={(e) => e.target.blur()}
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
          
          <input
            type="text"
            placeholder="מוצג על ידי"
            value={formData.displayed_by}
            onChange={(e) => setFormData({...formData, displayed_by: e.target.value})}
          />
          
          <div className="checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({...formData, is_new: e.target.checked})}
              />
              מוצר חדש (יופיע בקטגוריית "מוצרים חדשים")
            </label>
          </div>
          
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
