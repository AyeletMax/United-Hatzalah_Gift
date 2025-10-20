import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

export default function FilterPanel({ products, onFilterChange, isOpen, onToggle }) {
  // סגירה בלחיצה על הרקע במובייל
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && window.innerWidth <= 768) {
      onToggle();
    }
  };
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sortBy: '',
    deliveryTime: '',
    brand: '',
    lastBuyer: ''
  });

  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // חישוב טווח המחירים מהמוצרים
  useEffect(() => {
    if (products.length > 0) {
      const prices = products
        .map(p => parseFloat(p.unit_price_incl_vat))
        .filter(price => !isNaN(price));
      
      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange({ min: minPrice, max: maxPrice });
        
        // עדכון הסינונים רק אם הם עדיין בברירת מחדל
        if (filters.priceRange.min === 0 && filters.priceRange.max === 1000) {
          const newFilters = {
            ...filters,
            priceRange: { min: minPrice, max: maxPrice }
          };
          setFilters(newFilters);
          onFilterChange(newFilters);
        }
      }
    }
  }, [products]);



  // עדכון הסינונים
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // עדכון מיידי כשהסינונים משתנים
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // מאזין לאירוע איפוס סינונים
  useEffect(() => {
    const handleResetFilters = () => {
      const resetFilters = {
        priceRange: { min: priceRange.min, max: priceRange.max },
        sortBy: '',
        deliveryTime: '',
        brand: '',
        lastBuyer: ''
      };
      setFilters(resetFilters);
    };

    window.addEventListener('resetFilters', handleResetFilters);
    return () => window.removeEventListener('resetFilters', handleResetFilters);
  }, [priceRange]);

  // איפוס הסינונים
  const resetFilters = () => {
    const resetFilters = {
      priceRange: { min: priceRange.min, max: priceRange.max },
      sortBy: '',
      deliveryTime: '',
      brand: '',
      lastBuyer: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // קבלת רשימת מותגים ייחודיים
  const uniqueBrands = [...new Set(products
    .map(p => p.brand)
    .filter(brand => brand && brand.trim() !== '')
  )];

  // קבלת רשימת זמני אספקה ייחודיים
  const uniqueDeliveryTimes = [...new Set(products
    .map(p => p.delivery_time_days)
    .filter(time => time !== null && time !== undefined)
  )].sort((a, b) => a - b);

  return (
    <div className={`filter-panel ${isOpen ? 'open' : ''}`} onClick={handleBackdropClick}>
      <div className="filter-header">
        <h3>סינון מוצרים</h3>
        <button className="filter-toggle" onClick={onToggle}>
          {isOpen ? '✕' : '⚙️'}
        </button>
      </div>

      {isOpen && (
        <div className="filter-content" onClick={(e) => e.stopPropagation()}>
          {/* סינון לפי מחיר */}
          <div className="filter-section">
            <h4>טווח מחירים</h4>
            <div className="price-range">
              <div className="price-slider">
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceRange.min}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value)
                  })}
                  className="slider-min"
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filters.priceRange.max}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    max: parseInt(e.target.value)
                  })}
                  className="slider-max"
                />
              </div>
              <div className="price-display">
                ₪{filters.priceRange.min} - ₪{filters.priceRange.max}
              </div>
            </div>
          </div>

          {/* מיון */}
          <div className="filter-section">
            <h4>מיון לפי</h4>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            >
              <option value="">בחר מיון</option>
              <option value="price-low">מחיר: נמוך לגבוה</option>
              <option value="price-high">מחיר: גבוה לנמוך</option>
              <option value="popular">פופולרי ביותר</option>
              <option value="newest">חדש ביותר</option>
              <option value="name-asc">שם: א-ת</option>
              <option value="name-desc">שם: ת-א</option>
            </select>
          </div>

          {/* זמן אספקה */}
          <div className="filter-section">
            <h4>זמן אספקה</h4>
            <select
              value={filters.deliveryTime}
              onChange={(e) => updateFilter('deliveryTime', e.target.value)}
            >
              <option value="">כל זמני האספקה</option>
              <option value="1-3">1-3 ימים</option>
              <option value="4-7">4-7 ימים</option>
              <option value="8-14">8-14 ימים</option>
              <option value="15+">15+ ימים</option>
              {uniqueDeliveryTimes.map(time => (
                <option key={time} value={time}>{time} ימים</option>
              ))}
            </select>
          </div>

          {/* מותג */}
          {uniqueBrands.length > 0 && (
            <div className="filter-section">
              <h4>מותג</h4>
              <select
                value={filters.brand}
                onChange={(e) => updateFilter('brand', e.target.value)}
              >
                <option value="">כל המותגים</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          )}

          {/* שם מזמין אחרון */}
          <div className="filter-section">
            <h4>חיפוש לפי שם</h4>
            <input
              type="text"
              placeholder="חפש לפי שם מזמין/מותג"
              value={filters.lastBuyer}
              onChange={(e) => updateFilter('lastBuyer', e.target.value)}
            />
          </div>

          {/* כפתור איפוס */}
          <div className="filter-actions">
            <button className="reset-btn" onClick={resetFilters}>
              איפוס סינונים
            </button>
          </div>
        </div>
      )}
    </div>
  );
}