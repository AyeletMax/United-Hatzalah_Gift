import CategoryCard from './CategoryCard.jsx';
import './CategoryPuzzleGrid.css';

export default function CategoryPuzzleGrid({ categories = [], onSelect }) {
  return (
    <section id="categories" className="container" style={{ padding: '40px 0 80px' }}>
      <h2 className="section-title">קטגוריות מתנות</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16
      }}>
        {categories.map((c) => (
          <CategoryCard key={c.id} title={c.title} icon={c.icon} color={c.color}
                        onClick={() => onSelect?.(c)} />
        ))}
      </div>
    </section>
  );
}


