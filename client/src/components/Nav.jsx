import './Nav.css'
import './Nav-fixed.css'
import './Nav-mobile.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SearchBar from './SearchBar.jsx';
import MobileDrawer from './MobileDrawer';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const items = [
  { label: 'עמוד הבית', path: '/', onClick: scrollToTop },
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState(items);
  const [overflowItems, setOverflowItems] = useState([]);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isFilterPage = location.pathname === '/filter';

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 480) {
        setIsOpen(false);
      }
      calculateVisibleItems();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    calculateVisibleItems();
  }, [isMobile]);

  useEffect(() => {
    const timer = setTimeout(calculateVisibleItems, 100);
    return () => clearTimeout(timer);
  }, []);

  // סגירת תפריט העוד כשלוחצים מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overflowMenuOpen && !event.target.closest('.nav-overflow-container')) {
        setOverflowMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [overflowMenuOpen]);

  const calculateVisibleItems = () => {
    if (isMobile) {
      setVisibleItems(items);
      setOverflowItems([]);
      return;
    }

    // גישה פשוטה - בדיקה לפי רוחב המסך
    const screenWidth = window.innerWidth;
    let maxItems;
    
    if (screenWidth > 1400) {
      maxItems = items.length; // הכל נראה
    } else if (screenWidth > 1200) {
      maxItems = 9;
    } else if (screenWidth > 1000) {
      maxItems = 7;
    } else if (screenWidth > 900) {
      maxItems = 6;
    } else {
      maxItems = 5;
    }
    
    if (maxItems >= items.length) {
      setVisibleItems(items);
      setOverflowItems([]);
    } else {
      setVisibleItems(items.slice(0, maxItems));
      setOverflowItems(items.slice(maxItems));
    }
  };

  const handleSearch = (term) => {
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="nav-root">
      {/* כפתור המבורגר רק במובייל */}
      {isMobile && (
        <button
          className="nav-hamburger"
          onClick={() => setIsOpen(true)}
          aria-label="תפריט"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Drawer במובייל */}
      <MobileDrawer open={isOpen} items={items} onClose={() => setIsOpen(false)} />

      {/* תפריט רגיל רק בדסקטופ */}
      {!isMobile && (
        <div className="nav-inner" ref={navRef}>
          {visibleItems.map((item, index) => (
            item.path === '/' ? (
              <Link
                key={item.label}
                to={item.path}
                className="nav-link nav-home-btn"
                aria-label="עמוד הבית"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  
                  if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  } else {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  }
                }}
              >
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
              </Link>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                className="nav-link"
                onClick={() => setIsOpen(false)}
              onMouseDown={(e)=>e.currentTarget.classList.add('active')} 
              onMouseUp={(e)=>e.currentTarget.classList.remove('active')}
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className="nav-arrow">❯</span>
              </Link>
            )
          ))}
          
          {/* כפתור עוד (3 נקודות) */}
          {overflowItems.length > 0 && (
            <div
              className="nav-overflow-container"
              onMouseEnter={() => setOverflowMenuOpen(true)}
              onMouseLeave={() => setOverflowMenuOpen(false)}
            >
              <button
                className="nav-overflow-btn"
                aria-label="עוד אפשרויות"
                aria-haspopup="menu"
                aria-expanded={overflowMenuOpen}
                type="button"
              >
                ⋯
              </button>

              {overflowMenuOpen && (
                <div className="nav-overflow-menu">
                  {overflowItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="nav-overflow-link"
                      onClick={() => {
                        setOverflowMenuOpen(false);
                        if (item.path === '/') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      <span>{item.label}</span>
                      <span className="nav-arrow">❯</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* חיפוש וסינון - תמיד! */}
      <div className="nav-search-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <SearchBar onSearch={handleSearch} />
          <button
            className={`nav-filter-btn ${isFilterPage ? 'active' : ''}`}
            onClick={() => {
              if (isFilterPage) {
                navigate('/');
              } else {
                const currentPath = location.pathname;
                if (
                  currentPath !== '/' &&
                  currentPath !== '/search' &&
                  currentPath !== '/admin'
                ) {
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
          className="nav-admin-btn"
          onClick={() => navigate('/admin')}
          aria-label="כניסה למנהל"
          title="כניסה למנהל"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)} />}

    </nav>
  );
}
