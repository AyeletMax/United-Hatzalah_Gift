import './Nav.css'
const items = [
  'מוצרים חדשים',
  'מתנות',
  'כלי בית',
  'אביזרים לרכב',
  'מוצרי קיץ',
  'מוצרי חורף',
  'ביגוד קיץ וחורף',
  'אביזרי יח"צ',
  'תיקים',
];

export default function Nav() {
  return (
    <nav className="nav-root">
      <div className="nav-inner">
        {items.map((label) => (
          <a key={label} href="#" className="nav-link" onMouseDown={(e)=>e.currentTarget.classList.add('active')} onMouseUp={(e)=>e.currentTarget.classList.remove('active')}>
            <span>{label}</span>
            <span aria-hidden="true" className="nav-arrow">❯</span>
          </a>
        ))}
      </div>
    </nav>
  );
}


