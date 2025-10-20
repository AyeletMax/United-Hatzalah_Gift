import CategoryCard from './CategoryCard.jsx';
import './CategoryPuzzleGrid.css';

export default function CategoryPuzzleGrid({ categories = [], onSelect }) {
  const sizes = ['medium', 'small', 'small', 'large', 'winter-tall', 'medium', 'small', 'extra-wide', 'medium', 'small'];
  
  return (
    <section id="categories">
      <h2 className="section-title" style={{ textAlign: 'center', margin: '40px 0 20px' }}>קטגוריות מתנות</h2>
      <div className="puzzle-grid">
        {categories.map((c, index) => (
          <CategoryCard 
            key={c.id} 
            title={c.title} 
            icon={c.icon}
            color={c.color}
            size={sizes[index]}
            delay={index * 100}
            onClick={() => onSelect?.(c)} 
          />
        ))}
      </div>
    </section>
  );
}