import React from "react";
import "./ProductList.css";
import { useNavigate } from "react-router-dom";

export default function ProductList({ products = [], categorySlug }) {
  const navigate = useNavigate();

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

  if (!products.length) {
    return (
      <div className="product-list-empty">לא נמצאו מוצרים בקטגוריה זו.</div>
    );
  }
  
  return (
    <div className="product-list-grid">
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
          </div>
        ))}
    </div>
  );
}
