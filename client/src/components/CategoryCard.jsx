import React from 'react'
import './CategoryCard.css';

export default function CategoryCard({ title, icon, description, link, onClick }) {
  return (
    <div className="uh-category-card" onClick={onClick}>
      <span className="uh-category-icon">{icon ?? '🎁'}</span>
      <span className="uh-category-title">{title}</span>
    </div>
  );
}


