import './Nav.css'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import SearchBar from './SearchBar.jsx';

const items = [
  { label: 'עמוד הבית', path: '/' },
  { label: 'מוצרים חדשים', path: '/מוצרים-חדשים' },
  { label: 'מתנות', path: '/מתנות' },
  { label: 'כלי בית', path: '/כלי-בית' },
  { label: 'אביזרים לרכב', path: '/לרכב' },
  { label: 'מוצרי קיץ', path: '/מוצרי-קיץ' },
  { label: 'מוצרי חורף', path: '/מוצרי-חורף' },
  { label: 'ביגוד קיץ וחורף', path: '/טקסטיל-וביגוד' },
  { label: 'אביזרי יח"צ', path: '/אביזרי-יחץ' },
  { label: 'תיקים', path: '/תיקים' },
  { label: 'יודאיקה', path: '/יודאיקה' },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFilterPage = location.pathname === '/filter';

  const handleSearch = (term) => {
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate('/');
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsOpen(false), 500);
    setHoverTimeout(timeout);
  };

  return (
    <nav className="nav-root">
      <div className="nav-search-wrapper">
        <SearchBar onSearch={handleSearch} />
        <button 
          className={`nav-filter-btn ${isFilterPage ? 'active' : ''}`}
          onClick={() => {
            if (isFilterPage) {
              navigate('/');
            } else {
              // אם נמצאים בקטגוריה, עבור לסינון עם הקטגוריה
              const currentPath = location.pathname;
              if (currentPath !== '/' && currentPath !== '/search' && currentPath !== '/admin') {
                const categorySlug = currentPath.split('/')[1];
                navigate(`/filter?category=${categorySlug}`);
              } else {
                navigate('/filter');
              }
            }
          }}
        >
          {isFilterPage ? 'סגור סינון' : 'סינון'}
        </button>
      </div>
      <button 
        className="nav-hamburger" 
        onMouseEnter={handleMouseEnter}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-label="תפריט"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div 
        className={`nav-inner ${isOpen ? 'nav-open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((item) => (
          <Link 
            key={item.label} 
            to={item.path} 
            className={`nav-link ${item.path === '/' ? 'nav-home-btn' : ''}`}
            aria-label={item.path === '/' ? 'עמוד הבית' : undefined}
            onClick={() => {
              setIsOpen(false);
              if (item.path === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onMouseDown={(e)=>e.currentTarget.classList.add('active')} 
            onMouseUp={(e)=>e.currentTarget.classList.remove('active')}
          >
            {item.path === '/' ? (
              <svg
                className="nav-home-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M12 3.172l7 6.222V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4H11v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9.394l7-6.222zm0-2.121L2.293 9.293a1 1 0 1 0 1.414 1.414L12 2.414l8.293 8.293a1 1 0 0 0 1.414-1.414L12 1.05z"/>
              </svg>
            ) : (
              <span>{item.label}</span>
            )}
            {item.path !== '/' && (
              <span aria-hidden="true" className="nav-arrow">❯</span>
            )}
          </Link>
        ))}
      </div>
      
      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)} />}
    </nav>
  );
}
