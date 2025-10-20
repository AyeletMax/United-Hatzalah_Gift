import React, { useState, useMemo } from "react";
import "./ProductList.css";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext.jsx";
import { useProducts } from "./ProductsContext.jsx";
import FilterPanel from "./FilterPanel.jsx";

export default function ProductList({ products = [], categorySlug }) {
  const navigate = useNavigate();
  const { isAdminLoggedIn } = useAdmin();
  const { refreshProducts } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sortBy: '',
    deliveryTime: '',
    brand: '',
    lastBuyer: ''
  });
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

  // סינון ומיון המוצרים
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // סינון לפי מחיר
    filtered = filtered.filter(product => {
      const price = parseFloat(product.unit_price_incl_vat) || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // סינון לפי זמן אספקה
    if (filters.deliveryTime) {
      if (filters.deliveryTime === '1-3') {
        filtered = filtered.filter(p => p.delivery_time_days >= 1 && p.delivery_time_days <= 3);
      } else if (filters.deliveryTime === '4-7') {
        filtered = filtered.filter(p => p.delivery_time_days >= 4 && p.delivery_time_days <= 7);
      } else if (filters.deliveryTime === '8-14') {
        filtered = filtered.filter(p => p.delivery_time_days >= 8 && p.delivery_time_days <= 14);
      } else if (filters.deliveryTime === '15+') {
        filtered = filtered.filter(p => p.delivery_time_days >= 15);
      } else {
        filtered = filtered.filter(p => p.delivery_time_days == filters.deliveryTime);
      }
    }

    // סינון לפי מותג
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand && p.brand.includes(filters.brand));
    }

    // סינון לפי לקוח אחרון
    if (filters.lastBuyer && filters.lastBuyer.trim()) {
      const searchTerm = filters.lastBuyer.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const fields = [
          p.last_buyer,
          p.last_ordered_by_name,
          p.lastBuyer,
          p.customer_name
        ];
        
        return fields.some(field => 
          field && 
          typeof field === 'string' && 
          field.toLowerCase().includes(searchTerm)
        );
      });
    }

    // מיון
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (parseFloat(a.unit_price_incl_vat) || 0) - (parseFloat(b.unit_price_incl_vat) || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (parseFloat(b.unit_price_incl_vat) || 0) - (parseFloat(a.unit_price_incl_vat) || 0));
          break;
        case 'popular':
          filtered.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name, 'he'));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name, 'he'));
          break;
      }
    }

    return filtered;
  }, [products, filters]);



  if (!products.length) {
    return (
      <div className="product-list-empty">לא נמצאו מוצרים בקטגוריה זו.</div>
    );
  }
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <FilterPanel 
        products={products}
        onFilterChange={handleFilterChange}
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
      />
      
      <div className="products-header">
        <div className="products-count">
          מציג {filteredAndSortedProducts.length} מתוך {products.length} מוצרים
        </div>
        <button 
          className={`filter-toggle-btn ${(filters.sortBy || filters.deliveryTime || filters.brand || filters.lastBuyer || filters.priceRange.min > 0 || filters.priceRange.max < 1000) ? 'active' : ''}`}
          onClick={() => setFilterPanelOpen(!filterPanelOpen)}
        >
          <span className="filter-icon">⚙️</span>
          {filterPanelOpen ? 'הסתר סינון' : 'הצג סינון'}
          {(filters.sortBy || filters.deliveryTime || filters.brand || filters.lastBuyer || filters.priceRange.min > 0 || filters.priceRange.max < 1000) && (
            <span className="filter-active-indicator">•</span>
          )}
        </button>
      </div>
      
      <div className={`product-list-grid ${editingProduct ? 'modal-open' : ''}`}>
        {filteredAndSortedProducts.map((p) => (
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
      
      {filteredAndSortedProducts.length === 0 && products.length > 0 && (
        <div className="no-results">
          לא נמצאו מוצרים התואמים לקריטריונים שנבחרו.
          <button onClick={() => setFilters({
            priceRange: { min: 0, max: 1000 },
            sortBy: '',
            deliveryTime: '',
            brand: '',
            lastBuyer: ''
          })}>
            איפוס סינונים
          </button>
        </div>
      )}
    </>
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
