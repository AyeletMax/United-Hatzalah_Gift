import React from 'react';
import CategoryCard from './CategoryCard.jsx';
import './CategoryGrid.css';

export default function CategoryPuzzleGrid({ categories = [], onSelect }) {
  // צבעים לסירוגין: לבן ואפור בהיר
  const unionBgColors = ['#fff', '#f8f9fa'];
  // קביעת className וצבע רקע
  const getPuzzleClass = (idx) => {
    const mod = idx % 4;
    if (mod === 0) return 'puzzle-top';
    if (mod === 1) return 'puzzle-right';
    if (mod === 2) return 'puzzle-bottom';
    if (mod === 3) return 'puzzle-left';
    return '';
  };
  return (
    <>
      <h2 className="uh-section-title">קטגוריות מתנות</h2>
      <div className="uh-category-grid">
        {categories.map((c, idx) => (
          <CategoryCard
            key={c.id}
            title={c.title}
            icon={c.icon}
            image={c.image}
            color={unionBgColors[idx % 2]}
            onClick={() => onSelect?.(c)}
            className={getPuzzleClass(idx)}
          />
        ))}
      </div>
    </>
  );
}