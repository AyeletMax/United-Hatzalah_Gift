import React from 'react';
import './CategoryCard.css';

export default function CategoryCard({ title, icon, onClick, image, className = '', color = '#fff' }) {
  // קביעת path של הפאזל לפי className
  const puzzlePaths = {
    'puzzle-top': 'M20,0 Q50,30 80,0 L100,20 Q70,50 100,80 L80,100 Q50,70 20,100 L0,80 Q30,50 0,20 Z',
    'puzzle-right': 'M0,20 Q30,50 0,80 L20,100 Q50,70 80,100 L100,80 Q70,50 100,20 L80,0 Q50,30 20,0 Z',
    'puzzle-bottom': 'M20,0 Q50,30 80,0 L100,20 Q70,50 100,80 L80,100 Q50,70 20,100 L0,80 Q30,50 0,20 Z',
    'puzzle-left': 'M0,20 Q30,50 0,80 L20,100 Q50,70 80,100 L100,80 Q70,50 100,20 L80,0 Q50,30 20,0 Z',
    '': 'M10,0 L90,0 Q100,0 100,10 L100,90 Q100,100 90,100 L10,100 Q0,100 0,90 L0,10 Q0,0 10,0 Z',
  };
  const path = puzzlePaths[className] || puzzlePaths[''];
  // צבע רקע לאייקון (כתום בהיר)
  const iconBg = '#ffecb3';
  return (
    <div className={`uh-category-card ${className}`} onClick={onClick} style={{background: 'none', boxShadow: 'none', height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
      <svg viewBox="0 0 100 100" width="100%" height="160" style={{display: 'block', filter: 'drop-shadow(0 4px 16px #ff980033)'}}>
        <path d={path} fill="#fff" stroke="#ff9800" strokeWidth="2" />
        <foreignObject x="0" y="0" width="100" height="100">
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
            {icon && <div className="uh-card-icon-bg" style={{background: iconBg}}><span className="uh-card-icon">{icon}</span></div>}
            <div className="uh-card-title">{title}</div>
          </div>
        </foreignObject>
      </svg>
      <button className="uh-card-btn" style={{marginTop: '8px'}}>לצפייה</button>
    </div>
  );
}