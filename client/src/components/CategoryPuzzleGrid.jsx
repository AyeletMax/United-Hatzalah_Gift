import React from 'react'
import CategoryCard from './CategoryCard.jsx';

export default function CategoryPuzzleGrid({ categories = [], onSelect }) {
  return (
    <section id="categories" style={{ padding: '40px 0 80px', background: 'none' }}>
      <h2 className="section-title" style={{ color: 'var(--uh-orange)', textAlign: 'center', fontWeight: 900, fontSize: 32, marginBottom: 32 }}>קטגוריות מתנות</h2>
      <div className="uh-category-grid">
        {categories.map((c) => (
          <CategoryCard 
            key={c.id} 
            title={c.title} 
            icon={c.icon} 
            description={c.description}
            color={c.color}
            onClick={() => onSelect?.(c)} 
          />
        ))}
      </div>
    </section>
  );
}


