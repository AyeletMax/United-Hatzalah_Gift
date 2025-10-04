import React from 'react';
import './CategoryCard.css';

export default function CategoryCard({ title, icon, onClick, image }) {
  return (
    <div className="uh-category-card" onClick={onClick}>
      <div className="uh-card-background">
        {image && <img src={image} alt="" className="uh-card-bg-image" />}
        <div className="uh-card-overlay"></div>
      </div>
      <div className="uh-card-content">
        <h3 className="uh-card-title">{title}</h3>
        <button className="uh-card-btn">לצפייה</button>
      </div>
    </div>
  );
}