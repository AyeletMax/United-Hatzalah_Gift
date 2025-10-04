import React from 'react';
import CategoryCard from './CategoryCard.jsx';
import './CategoryGrid.css';

export default function CategoryPuzzleGrid({ categories = [], onSelect }) {
  return (
    <section id="categories" className="uh-section">
      <h2 className="uh-section-title">קטגוריות מתנות</h2>
      <div className="uh-category-grid">
        {categories.map((c) => (
          <CategoryCard
            key={c.id}
            title={c.title}
            icon={c.icon}
            image={c.image}
            color={c.color}
            onClick={() => onSelect?.(c)}
          />
        ))}
      </div>
    </section>
  );
}