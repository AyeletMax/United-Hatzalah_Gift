import React from 'react';
import './ProductModal.css';

export default function ProductModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const reviews = [
    { name: "דוד כהן", rating: 5, comment: "מוצר מעולה! איכות גבוהה ומשלוח מהיר" },
    { name: "שרה לוי", rating: 4, comment: "מאוד מרוצה מהרכישה, ממליצה בחום" },
    { name: "יוסי אברהם", rating: 5, comment: "בדיוק מה שחיפשתי, שירות מצוין" }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>×</button>
        
        <div className="modal-body">
          <div className="product-image-section">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="modal-product-image" />
            ) : (
              <div className="modal-product-placeholder">📦</div>
            )}
          </div>
          
          <div className="product-details-section">
            <h2 className="modal-product-title">{product.name}</h2>
            
            {product.unit_price_incl_vat && (
              <div className="modal-product-price">₪{product.unit_price_incl_vat}</div>
            )}
            
            <div className="product-details">
              <div className="detail-item">
                <h3>פרטים על המוצר</h3>
                <p>{product.description || "מוצר איכותי ומומלץ מבית יונייטד הצלה"}</p>
              </div>
              
              <div className="detail-item">
                <h3>מחיר ליח' כולל מע"מ</h3>
                <p className="price-detail">₪{product.unit_price_incl_vat || "לא צוין"}</p>
              </div>
              
              <div className="detail-item">
                <h3>זמן אספקה</h3>
                <p>3-5 ימי עסקים</p>
              </div>
              
              <div className="detail-item">
                <h3>שם מזמין אחרון</h3>
                <p>דוד כהן - ירושלים</p>
              </div>
            </div>
            
            <div className="product-reviews">
              <h3>המלצות לקוחות</h3>
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">{review.name}</span>
                      <div className="rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}