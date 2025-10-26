import React, { useState, useMemo, useEffect } from "react";
import "./ProductList.css";
import "./FilterPage.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdmin } from "./AdminContext.jsx";
import { useProducts } from "./ProductsContext.jsx";
import FilterPanel from "./FilterPanel.jsx";
import ProductModal from "./ProductModal.jsx";

export default function FilterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdminLoggedIn } = useAdmin();
  const { products, refreshProducts } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sortBy: '',
    deliveryTime: '',
    brand: '',
    lastBuyer: ''
  });
  const [hasFiltered, setHasFiltered] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // קבלת הקטגוריה מה-URL
  const categorySlug = searchParams.get('category');
  
  // מיפוי קטגוריות
  const categories = [
    { id: 1, key: "car", title: "לרכב", slug: "לרכב" },
    { id: 2, key: "textile", title: "טקסטיל וביגוד", slug: "טקסטיל-וביגוד" },
    { id: 3, key: "home", title: "כלי בית", slug: "כלי-בית" },
    { id: 4, key: "judaica", title: "יודאיקה", slug: "יודאיקה" },
    { id: 8, key: "winter", title: "מוצרי חורף", slug: "מוצרי-חורף" },
    { id: 6, key: "gifts", title: "מתנות", slug: "מתנות" },
    { id: 7, key: "summer", title: "מוצרי קיץ", slug: "מוצרי-קיץ" },
    { id: 9, key: "outdoor", title: 'אביזרי יח"צ', slug: "אביזרי-יחץ" },
    { id: 10, key: "bags", title: "תיקים", slug: "תיקים" },
    { id: 5, key: "new", title: "מוצרים חדשים", slug: "מוצרים-חדשים" },
  ];
  
  const currentCategory = categorySlug ? categories.find(c => c.slug === categorySlug) : null;

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (!hasFiltered) return [];
    
    let filtered = [...products];
    
    // סינון לפי קטגוריה אם נבחרה
    if (currentCategory) {
      filtered = filtered.filter(p => String(p.category_id) === String(currentCategory.id));
    }

    // סינון לפי מחיר
    filtered = filtered.filter(product => {
      const price = parseFloat(product.unit_price_incl_vat) || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // סינון לפי זמן אספקה
    if (filters.deliveryTime) {
      if (filters.deliveryTime === '1-1') {
        filtered = filtered.filter(p => p.delivery_time_days === 1);
      } else if (filters.deliveryTime === '1-2') {
        filtered = filtered.filter(p => p.delivery_time_days >= 1 && p.delivery_time_days <= 2);
      } else if (filters.deliveryTime === '2-3') {
        filtered = filtered.filter(p => p.delivery_time_days >= 2 && p.delivery_time_days <= 3);
      } else if (filters.deliveryTime === '3-5') {
        filtered = filtered.filter(p => p.delivery_time_days >= 3 && p.delivery_time_days <= 5);
      } else if (filters.deliveryTime === '5-7') {
        filtered = filtered.filter(p => p.delivery_time_days >= 5 && p.delivery_time_days <= 7);
      } else if (filters.deliveryTime === '7+') {
        filtered = filtered.filter(p => p.delivery_time_days >= 7);
      }
    }

    // סינון לפי מותג
    if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand || (p.displayed_by && p.displayed_by === filters.brand));
    }

    // סינון לפי שם מזמין אחרון
    if (filters.lastBuyer && filters.lastBuyer.trim()) {
      const searchTerm = filters.lastBuyer.trim().toLowerCase();
      filtered = filtered.filter(p => {
        const searchFields = [
          p.last_buyer,
          p.last_ordered_by_name,
          p.displayed_by,
          p.brand,
          p.name
        ].filter(field => field).map(field => field.toLowerCase());
        
        return searchFields.some(field => field.includes(searchTerm));
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
  }, [products, filters, hasFiltered, currentCategory]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setHasFiltered(true);
  };

  return (
    <>
      <FilterPanel 
        products={products}
        onFilterChange={handleFilterChange}
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
      />
      
      <div className={`main-content ${filterPanelOpen ? 'filter-open' : ''}`}>
        <h2 style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        {currentCategory ? `סינון מוצרים - ${currentCategory.title}` : 'סינון מוצרים'}
      </h2>

      {!hasFiltered ? (
        <div style={{ textAlign: "center", margin: 40, color: "#666" }}>
          {currentCategory 
            ? `השתמש בסינון כדי לחפש מוצרים בקטגוריה ${currentCategory.title}`
            : 'השתמש בסינון כדי לחפש מוצרים'
          }
        </div>
      ) : (
        <>
          <div className="products-header">
            <div className="products-count">
              מציג {filteredAndSortedProducts.length} מתוך {currentCategory ? products.filter(p => String(p.category_id) === String(currentCategory.id)).length : products.length} מוצרים
            </div>
          </div>
          
          <div className="product-list-grid">
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
                </div>
              </div>
            ))}
          </div>
          
          {filteredAndSortedProducts.length === 0 && (
            <div className="no-results">
              לא נמצאו מוצרים התואמים לקריטריונים שנבחרו.
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  // איפוס מלא של כל הסינונים
                  const resetFilters = {
                    priceRange: { min: 0, max: 1000 },
                    sortBy: '',
                    deliveryTime: '',
                    brand: '',
                    lastBuyer: ''
                  };
                  setFilters(resetFilters);
                  setHasFiltered(false);
                  // איפוס גם בפאנל הסינון
                  window.dispatchEvent(new CustomEvent('resetFilters'));
                }}
              >
                איפוס סינונים
              </button>
            </div>
          )}
        </>
      )}
      
      </div>
      
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}