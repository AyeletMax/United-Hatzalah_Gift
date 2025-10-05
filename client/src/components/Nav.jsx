<<<<<<< HEAD
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
=======
import React from 'react'
import './Nav.css';
import CategoryPuzzleGrid from './CategoryPuzzleGrid.jsx';

const categories = [
  { id: 1, title: 'מוצרים חדשים', icon: '✨', description: 'המוצרים החדשים והמעודכנים ביותר שלנו' },
  { id: 2, title: 'מתנות', icon: '🎁', description: 'מתנות מיוחדות לכל אירוע ולכל גיל' },
  { id: 3, title: 'כלי בית', icon: '🏠', description: 'כלים ואביזרים שימושיים לבית' },
  { id: 4, title: 'אביזרים לרכב', icon: '🚗', description: 'אביזרים חכמים ושימושיים לרכב' },
  { id: 5, title: 'מוצרי קיץ', icon: '☀️', description: 'מוצרים מיוחדים לעונת הקיץ' },
  { id: 6, title: 'מוצרי חורף', icon: '❄️', description: 'מוצרים חמים ונעימים לחורף' },
  { id: 7, title: 'ביגוד קיץ וחורף', icon: '👕', description: 'ביגוד איכותי לכל עונות השנה' },
  { id: 8, title: 'אביזרי יח"צ', icon: '🌿', description: 'אביזרים לגינה ולחצר הבית' },
  { id: 9, title: 'תיקים', icon: '🎒', description: 'תיקים איכותיים לכל מטרה' },
>>>>>>> 7c882dbde7a63e5bc87bd806a0d5e11f08602b24
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
<<<<<<< HEAD
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
      
      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)} />}
    </nav>
=======
    <>
      <nav className="nav-root">
        <div className="nav-inner">
          {categories.map((cat) => (
            <a key={cat.id} href="#" className="nav-link" onMouseDown={(e)=>e.currentTarget.classList.add('active')} onMouseUp={(e)=>e.currentTarget.classList.remove('active')}>
              <span>{cat.title}</span>
              <span aria-hidden="true" className="nav-arrow">❯</span>
            </a>
          ))}
        </div>
      </nav>
      {/* הגריד יוצג בתחתית הדף */}
      <div className="category-grid-bottom">
        <CategoryPuzzleGrid categories={categories} />
      </div>
    </>
>>>>>>> 7c882dbde7a63e5bc87bd806a0d5e11f08602b24
  );
}


