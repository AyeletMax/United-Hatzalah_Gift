import './Nav.css'
import { Link } from 'react-router-dom';
import { useState } from 'react';

const items = [
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

  return (
    <nav className="nav-root">
      <button 
        className="nav-hamburger" 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        aria-label="תפריט"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div 
        className={`nav-inner ${isOpen ? 'nav-open' : ''}`}
        onMouseLeave={() => setIsOpen(false)}
      >
        {items.map((item) => (
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
        ))}
      </div>
      
      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)} onMouseEnter={() => setIsOpen(false)} />}
    </nav>
  );
}
