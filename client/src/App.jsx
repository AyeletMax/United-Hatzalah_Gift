import "./App.css";
import "./theme.css";
import "./responsive.css";

import Hero from "./components/Hero.jsx";
import CategoryPuzzleGrid from "./components/CategoryPuzzleGrid.jsx";
import kitchenImg from "./assets/כלי בית.png";
import carImg from "./assets/אביזרים לרכב.png";
import clothesImg from "./assets/טקסטיל וביגוד.png";
import giftsImg from "./assets/מתנות.png";
import newProductsImg from "./assets/מוצרים חדשים.png";
import judaicaImg from "./assets/judaica.png";
import bagsImg from "./assets/bags.png";
import winterImg from "./assets/winter.png";
import summerImg from "./assets/summer.png";
import outdoorImg from "./assets/outdoor.png";
import ProductList from "./components/ProductList.jsx";
import FilterPage from "./components/FilterPage.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { useProducts } from "./components/ProductsContext.jsx";
import { Routes, Route, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductModal from "./components/ProductModal.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import ToastManager from "./components/ToastManager.jsx";

const categories = [
  { id: 1, key: "car", title: "לרכב", slug: "לרכב", icon: "🚗", color: "#fff2e9", image: carImg },
  { id: 2, key: "textile", title: "טקסטיל וביגוד", slug: "טקסטיל-וביגוד", icon: "👕", color: "#e9f0ff", image: clothesImg },
  { id: 3, key: "home", title: "כלי בית", slug: "כלי-בית", icon: "🍽️", color: "#f1f7ff", image: kitchenImg },
  { id: 4, key: "judaica", title: "יודאיקה", slug: "יודאיקה", icon: "🕯️", color: "#fff7f0", image: judaicaImg },
  { id: 8, key: "winter", title: "מוצרי חורף", slug: "מוצרי-חורף", icon: "❄️", color: "#e9f5ff", image: winterImg },
  { id: 6, key: "gifts", title: "מתנות", slug: "מתנות", icon: "🎁", color: "#ffe9f0", image: giftsImg },
  { id: 7, key: "summer", title: "מוצרי קיץ", slug: "מוצרי-קיץ", icon: "☀️", color: "#fff4e9", image: summerImg },
  { id: 9, key: "outdoor", title: 'אביזרי יח"צ', slug: "אביזרי-יחץ", icon: "🏕️", color: "#f0ffe9", image: outdoorImg },
  { id: 10, key: "bags", title: "תיקים", slug: "תיקים", icon: "👜", color: "#f9e9ff", image: bagsImg },
  { id: 5, key: "new", title: "מוצרים חדשים", slug: "מוצרים-חדשים", icon: "✨", color: "#fff9e9", image: newProductsImg },
];

function CategoryPage() {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { slug, productName } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const filteredProducts = category
    ? products.filter((p) => String(p.category_id) === String(category.id))
        .filter((product, index, self) => 
          index === self.findIndex(p => p.name === product.name && p.unit_price_incl_vat === product.unit_price_incl_vat)
        )
    : [];
  
  const selectedProduct = productName 
    ? filteredProducts.find(p => {
        // נסה למצוא לפי ID אם productName הוא מספר
        if (!isNaN(productName)) {
          return p.id === parseInt(productName);
        }
        // אחרת נסה למצוא לפי שם
        return p.name.replace(/\s+/g, '-') === productName;
      })
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
      <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 20 }}>
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
      ).filter((product, index, self) => 
        index === self.findIndex(p => p.name === product.name && p.unit_price_incl_vat === product.unit_price_incl_vat)
      )
    : [];
  
  return (
    <>
      <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 20 }}>
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
    <>
      <Nav />
      <main style={{ paddingTop: '40px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/filter" element={<FilterPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/:slug" element={<CategoryPage />} />
          <Route path="/:slug/:productName" element={<CategoryPage />} />
        </Routes>
      </main>
      <Footer />
      <ToastManager />
    </>
  );
}

export default App;