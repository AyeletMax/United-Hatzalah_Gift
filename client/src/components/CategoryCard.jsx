import React from 'react';
import './CategoryCard.css';

export default function CategoryCard({ title, icon, onClick, size = 'medium' }) {
  return (
    <div className={`category-box ${size}`} onClick={onClick}>
      <div className="category-content">
        {icon && <span className="category-icon">{icon}</span>}
        <h3 className="category-title">{title}</h3>
      </div>
    </div>
  );
}