export default function CategoryCard({ title, color='#ffffff', icon, onClick }) {
  return (
    <button onClick={onClick} aria-label={title} style={{
      display: 'grid',
      placeItems: 'center',
      background: color,
      border: '1px solid rgba(0,0,0,.06)',
      borderRadius: 14,
      padding: 16,
      minHeight: 140,
      boxShadow: '0 6px 14px rgba(0,0,0,.06)',
      cursor: 'pointer',
      transition: 'transform .15s ease, box-shadow .15s ease, border-color .2s ease'
    }}
    onMouseOver={(e)=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 22px rgba(0,0,0,.10)'; e.currentTarget.style.borderColor='rgba(243,108,33,.35)'; }}
    onMouseOut={(e)=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 14px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor='rgba(0,0,0,.06)'; }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30 }}>{icon ?? '🎁'}</div>
        <div style={{ fontWeight: 800, marginTop: 8, color: 'var(--uh-navy)' }}>{title}</div>
      </div>
    </button>
  );
}


