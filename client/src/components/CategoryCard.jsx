import React, { useEffect, useRef, useState } from 'react';
import './CategoryCard.css';

export default function CategoryCard({ title, icon, onClick, size = 'medium', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className={`category-box ${size} ${isVisible ? 'animate-in' : 'animate-out'}`} 
      onClick={onClick}
    >
      <div className="category-content">
        <h3 className="category-title">{title}</h3>
      </div>
    </div>
  );
}