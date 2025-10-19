import React, { useState, useEffect } from 'react';
import './ProductModal.css';

export default function ProductModal({ product, isOpen, onClose }) {
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [starRating, setStarRating] = useState(0);
  const [surveyResults, setSurveyResults] = useState(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userAlreadyAnswered, setUserAlreadyAnswered] = useState(false);
  
  if (!isOpen || !product) return null;

  const surveyQuestions = [
    { id: 1, text: "איך אתה מרגיש לגבי איכות המוצר?" },
    { id: 2, text: "איך אתה מרגיש לגבי המחיר?" },
    { id: 3, text: "איך אתה מרגיש לגבי זמן האספקה?" }
  ];
  
  const answerOptions = [
    { value: 5, label: "מרוצה מאוד" },
    { value: 4, label: "מרוצה" },
    { value: 3, label: "סביר" },
    { value: 2, label: "גרוע" },
    { value: 1, label: "גרוע מאוד" }
  ];
  
  // Check if user already answered and load results
  useEffect(() => {
    const checkUserResponse = async () => {
      const savedName = localStorage.getItem('userName');
      if (savedName) {
        const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
        if (userResponses[`${product.id}_${savedName}`]) {
          setUserAlreadyAnswered(true);
        }
      }
    };
    
    setSurveyResults({
      totalResponses: 47,
      averageRating: 4.2,
      questions: {
        1: { 5: 45, 4: 30, 3: 15, 2: 7, 1: 3 },
        2: { 5: 35, 4: 40, 3: 20, 2: 3, 1: 2 },
        3: { 5: 50, 4: 25, 3: 15, 2: 8, 1: 2 }
      }
    });
    
    checkUserResponse();
    setShowSurveyForm(false);
    setHasSubmitted(false);
  }, [product.id]);
  
  const handleAnswerChange = (questionId, value) => {
    setSurveyAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const submitSurvey = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('אנא מלא שם ומייל');
      return;
    }
    
    const surveyData = {
      productId: product.id,
      answers: surveyAnswers,
      rating: starRating,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage (in real app would be API call)
    localStorage.setItem('userName', userName.trim());
    const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
    userResponses[`${product.id}_${userName.trim()}`] = surveyData;
    localStorage.setItem('userSurveyResponses', JSON.stringify(userResponses));
    
    // Update results immediately
    setSurveyResults(prev => ({
      ...prev,
      totalResponses: prev.totalResponses + 1,
      averageRating: ((prev.averageRating * prev.totalResponses) + starRating) / (prev.totalResponses + 1)
    }));
    
    setHasSubmitted(true);
    setUserAlreadyAnswered(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
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
            
            <div className="survey-section">
              <div className="survey-header">
                <h3>סקר שביעות רצון</h3>
                {!userAlreadyAnswered && !hasSubmitted && (
                  <button 
                    className="toggle-survey-btn"
                    onClick={() => setShowSurveyForm(!showSurveyForm)}
                  >
                    {showSurveyForm ? 'חזור לתוצאות' : 'מלא סקר'}
                  </button>
                )}
              </div>
              
              {userAlreadyAnswered && !hasSubmitted ? (
                <div className="thank-you-message">
                  <h4>תודה שענית על הסקר!</h4>
                  <p>אנו מעריכים את המשוב שלך</p>
                </div>
              ) : hasSubmitted ? (
                <div className="thank-you-message">
                  <h4>תודה שענית על הסקר!</h4>
                  <p>המשוב שלך נשמר בהצלחה</p>
                </div>
              ) : showSurveyForm ? (
                <div className="survey-form">
                  <div className="user-info">
                    <input
                      type="text"
                      placeholder="השם שלך"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="user-input"
                    />
                    <input
                      type="email"
                      placeholder="המייל שלך"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="user-input"
                    />
                  </div>
                  
                  <h4>דרג את המוצר</h4>
                  {surveyQuestions.map(question => (
                    <div key={question.id} className="question">
                      <p>{question.text}</p>
                      <div className="answer-options">
                        {answerOptions.map(option => (
                          <label key={option.value} className="option">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option.value}
                              onChange={() => handleAnswerChange(question.id, option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="star-rating">
                    <p>דירוג כללי:</p>
                    <div className="stars">
                      {[1,2,3,4,5].map(star => (
                        <span
                          key={star}
                          className={`star ${star <= starRating ? 'filled' : ''}`}
                          onClick={() => setStarRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="submit-survey" onClick={submitSurvey}>
                    שלח דירוג
                  </button>
                </div>
              ) : (
                surveyResults && (
                <div className="survey-results">
                  <div className="results-summary">
                    <p><strong>{surveyResults.totalResponses}</strong> לקוחות דירגו את המוצר</p>
                    <p>דירוג ממוצע: <strong>{surveyResults.averageRating}/5</strong> {'★'.repeat(Math.round(surveyResults.averageRating))}</p>
                  </div>
                  
                  <div className="questions-results">
                    {surveyQuestions.map(question => (
                      <div key={question.id} className="question-result">
                        <h4>{question.text}</h4>
                        <div className="result-bars">
                          {answerOptions.map(option => {
                            const percentage = surveyResults.questions[question.id][option.value] || 0;
                            return (
                              <div key={option.value} className="result-bar">
                                <span className="option-label">{option.label}</span>
                                <div className="bar-container">
                                  <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                                  <span className="percentage">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}