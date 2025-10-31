import React, { createContext, useContext, useEffect, useState } from "react";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) {
        // בענן - אין שרת, הצג רשימה ריקה
        setProducts([]);
        setLoading(false);
        return;
      }
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      const fullUrl = `${apiUrl}/api/products`;
      console.log('Fetching from:', fullUrl);
      const res = await fetch(fullUrl, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      console.log('Products received:', data);
      // ניקוי URLs של via.placeholder והמרת paths יחסיים ל-URL מלא
      const cleanedData = data.map(product => {
        let imageUrl = product.image_url;
        if (imageUrl && !imageUrl.includes('via.placeholder')) {
          // אם זה path יחסי, המיר ל-URL מלא
          if (imageUrl.startsWith('/')) {
            imageUrl = `${apiUrl}${imageUrl}`;
          }
          // ודא שזה https אם האתר ב-https
          if (typeof window !== 'undefined' && window.location.protocol === 'https:' && imageUrl.startsWith('http:')) {
            imageUrl = imageUrl.replace('http:', 'https:');
          }
        } else if (imageUrl && imageUrl.includes('via.placeholder')) {
          imageUrl = null;
        }
        return {
          ...product,
          image_url: imageUrl
        };
      });
      setProducts(cleanedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refreshProducts: fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
