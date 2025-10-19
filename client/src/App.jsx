import "./App.css";
import "./theme.css";
import "./responsive.css";

import Hero from "./components/Hero.jsx";
import CategoryPuzzleGrid from "./components/CategoryPuzzleGrid.jsx";
import ProductList from "./components/ProductList.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { useProducts } from "./components/ProductsContext.jsx";
import { Routes, Route, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductModal from "./components/ProductModal.jsx";

const categories = [
  { id: 1, key: "car", title: "לרכב", slug: "לרכב", icon: "🚗", color: "#fff2e9" },
  { id: 2, key: "textile", title: "טקסטיל וביגוד", slug: "טקסטיל-וביגוד", icon: "👕", color: "#e9f0ff" },
  { id: 3, key: "home", title: "כלי בית", slug: "כלי-בית", icon: "🍽️", color: "#f1f7ff" },
  { id: 4, key: "judaica", title: "יודאיקה", slug: "יודאיקה", icon: "🕯️", color: "#fff7f0" },
  { id: 8, key: "winter", title: "מוצרי חורף", slug: "מוצרי-חורף", icon: "❄️", color: "#e9f5ff" },
  { id: 6, key: "gifts", title: "מתנות", slug: "מתנות", icon: "🎁", color: "#ffe9f0" },
  { id: 7, key: "summer", title: "מוצרי קיץ", slug: "מוצרי-קיץ", icon: "☀️", color: "#fff4e9" },
  { id: 9, key: "outdoor", title: 'אביזרי יח"צ', slug: "אביזרי-יחץ", icon: "🏕️", color: "#f0ffe9" },
  { id: 10, key: "bags", title: "תיקים", slug: "תיקים", icon: "👜", color: "#f9e9ff" },
  { id: 5, key: "new", title: "מוצרים חדשים", slug: "מוצרים-חדשים", icon: "✨", color: "#fff9e9" },
];

function CategoryPage() {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { slug, productName } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const filteredProducts = category
    ? products.filter((p) => String(p.category_id) === String(category.id))
    : [];
  
  const selectedProduct = productName 
    ? filteredProducts.find(p => p.name.replace(/\s+/g, '-') === productName)
    : null;
  
  const handleCategorySelect = (c) => {
    navigate(`/${c.slug}`);
  };
  
  const closeModal = () => {
    navigate(`/${slug}`);
  };
  
  return (
    <>
    {console.log("היי מה קורה")}
      <h2 style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        {category ? category.title : 'קטגוריה'}
      </h2>
      {loading ? (
        <div style={{ textAlign: "center", margin: 40 }}>טוען מוצרים...</div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "red", margin: 40 }}>
          שגיאה: {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", margin: 40 }}>
          אין מוצרים בקטגוריה זו
        </div>
      ) : (
        <ProductList products={filteredProducts} categorySlug={slug} />
      )}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </>
  );
}

function SearchPage() {
  const [searchParams] = useSearchParams();
  const { products, loading, error } = useProducts();
  const query = searchParams.get('q') || '';
  
  const filteredProducts = query
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      )
    : [];
  
  return (
    <>
      <h2 style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
        תוצאות חיפוש עבור: "{query}"
      </h2>
      {loading ? (
        <div style={{ textAlign: "center", margin: 40 }}>טוען מוצרים...</div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "red", margin: 40 }}>
          שגיאה: {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", margin: 40 }}>
          לא נמצאו מוצרים
        </div>
      ) : (
        <ProductList products={filteredProducts} />
      )}
    </>
  );
}

function HomePage() {
  const navigate = useNavigate();
  
  const handleCategorySelect = (c) => {
    navigate(`/${c.slug}`);
  };
  
  return (
    <>
      <Hero />
      <CategoryPuzzleGrid
        categories={categories}
        onSelect={handleCategorySelect}
      />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/:slug" element={<CategoryPage />} />
      <Route path="/:slug/:productName" element={<CategoryPage />} />
    </Routes>
  );
}

export default App;