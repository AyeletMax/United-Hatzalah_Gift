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
      const fullUrl = baseUrl.includes("localhost")
        ? `${baseUrl}/api/products`
        : baseUrl.includes("onrender.com")
        ? `${baseUrl}/api/products`
        : `${baseUrl}.onrender.com/api/products`;
      console.log('Fetching from:', fullUrl);
      const res = await fetch(fullUrl, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      console.log('Products received:', data);
      // ניקוי URLs של via.placeholder
      const cleanedData = data.map(product => ({
        ...product,
        image_url: product.image_url && product.image_url.includes('via.placeholder') ? null : product.image_url
      }));
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
