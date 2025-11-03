import './Nav.css'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  const [visibleItems, setVisibleItems] = useState(items);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const navInnerRef = useRef(null);
  const itemRefs = useRef({});
  const overflowMenuRef = useRef(null);
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

  // Calculate which items fit and which should go to overflow menu
  useEffect(() => {
    const calculateOverflow = () => {
      if (!navInnerRef.current) return;
      
      const container = navInnerRef.current;
      const containerWidth = container.offsetWidth;
      
      // If container not ready yet, show all items
      if (containerWidth === 0) {
        setVisibleItems(items);
        setHiddenItems([]);
        return;
      }
      
      // Rough calculation for overflow button width (we'll refine this)
      const estimatedOverflowBtnWidth = 60;
      const containerPadding = 40; // 20px on each side
      const availableWidth = containerWidth - estimatedOverflowBtnWidth - containerPadding; // Account for overflow button and padding
      
      let visible = [];
      let hidden = [];
      let accumulatedWidth = 0;
      
      // Use a ref to temporarily measure items
      const tempDiv = document.createElement('div');
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      tempDiv.style.display = 'flex';
      tempDiv.style.gap = '28px';
      tempDiv.style.padding = '0';
      document.body.appendChild(tempDiv);
      
      items.forEach((item, index) => {
        // Create a temporary element to measure with same structure as real link
        const measureEl = document.createElement('div');
        measureEl.style.display = 'inline-flex';
        measureEl.style.alignItems = 'center';
        measureEl.style.gap = '10px';
        measureEl.style.padding = '8px 12px';
        measureEl.style.fontWeight = '800';
        
        // Get font size safely with fallback
        try {
          const computedStyle = window.getComputedStyle(navInnerRef.current);
          measureEl.style.fontSize = computedStyle.fontSize || '16px';
        } catch (e) {
          measureEl.style.fontSize = '16px';
        }
        
        if (item.path === '/') {
          const icon = document.createElement('div');
          icon.style.width = '20px';
          icon.style.height = '20px';
          measureEl.appendChild(icon);
        } else {
          const text = document.createElement('span');
          text.textContent = item.label;
          measureEl.appendChild(text);
          const arrow = document.createElement('span');
          arrow.textContent = '❯';
          measureEl.appendChild(arrow);
        }
        
        tempDiv.appendChild(measureEl);
        
        const itemWidth = measureEl.offsetWidth;
        // Add gap for items after the first one
        if (index > 0) {
          accumulatedWidth += 28; // gap between items
        }
        accumulatedWidth += itemWidth;
        
        // Check if this item should be hidden
        if (accumulatedWidth > availableWidth) {
          hidden.push(item);
        } else {
          visible.push(item);
        }
        
        tempDiv.removeChild(measureEl);
      });
      
      document.body.removeChild(tempDiv);
      
      // Safety check: if no items in either array, show all items
      if (visible.length === 0 && hidden.length === 0) {
        setVisibleItems(items);
        setHiddenItems([]);
      } else {
        setVisibleItems(visible);
        setHiddenItems(hidden);
      }
    };
    
    // Use double requestAnimationFrame to ensure DOM is fully ready
    let rafId1, rafId2;
    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        calculateOverflow();
      });
    });
    
    // Recalculate on window resize
    const handleResize = () => {
      calculateOverflow();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      if (rafId1) cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(event.target)) {
        setShowOverflowMenu(false);
      }
    };
    
    if (showOverflowMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOverflowMenu]);

  return (
    <nav className="nav-root">
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
        ref={navInnerRef}
        className={`nav-inner ${isOpen ? 'nav-open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((item, index) => {
          // Only render items that are supposed to be visible
          const isVisible = visibleItems.includes(item);
          if (!isVisible) return null;
          
          return (
            <Link 
              key={item.label} 
              ref={(el) => (itemRefs.current[`item-${index}`] = el)}
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
          );
        })}
        
        {/* Overflow Menu Button */}
        {hiddenItems.length > 0 && (
          <div ref={overflowMenuRef} className="nav-overflow-container">
            <button 
              className="nav-overflow-btn"
              onClick={() => setShowOverflowMenu(!showOverflowMenu)}
              aria-label="עוד אפשרויות"
            >
              <span>⋯</span>
            </button>
            
            {showOverflowMenu && (
              <div className="nav-overflow-menu">
                {hiddenItems.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    className="nav-overflow-link"
                    onClick={() => {
                      setShowOverflowMenu(false);
                      setIsOpen(false);
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
