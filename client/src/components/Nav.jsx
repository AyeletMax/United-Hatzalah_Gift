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
];

export default function Nav() {
  return (
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
  );
}


