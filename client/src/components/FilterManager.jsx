import React, { useState, createContext, useContext } from 'react';
import FilterPanel from './FilterPanel.jsx';

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sortBy: '',
    deliveryTime: '',
    brand: '',
    lastBuyer: ''
  });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters); // לדיבוג
    setFilters(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      priceRange: { min: 0, max: 1000 },
      sortBy: '',
      deliveryTime: '',
      brand: '',
      lastBuyer: ''
    };
    setFilters(resetFilters);
  };

  // פונקציה לסינון מוצרים
  const applyFilters = (products) => {
    if (!products || products.length === 0) return [];
    
    let filtered = [...products];

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
      filtered = filtered.filter(p => p.brand && p.brand.includes(filters.brand));
    }

    // סינון לפי לקוח אחרון
    if (filters.lastBuyer) {
      filtered = filtered.filter(p => 
        p.last_buyer && p.last_buyer.toLowerCase().includes(filters.lastBuyer.toLowerCase())
      );
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
  };

  return (
    <FilterContext.Provider value={{
      isFilterOpen,
      filters,
      toggleFilter,
      handleFilterChange,
      resetFilters,
      applyFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const FilterManager = ({ products }) => {
  const { isFilterOpen, filters, handleFilterChange, toggleFilter } = useFilter();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <FilterPanel 
      products={products}
      onFilterChange={handleFilterChange}
      isOpen={isFilterOpen}
      onToggle={toggleFilter}
    />
  );
};