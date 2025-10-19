import React, { useState, useEffect } from 'react';
import './ProductModal.css';

export default function ProductModal({ product, isOpen, onClose }) {
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [starRating, setStarRating] = useState(0);
  const [surveyResults, setSurveyResults] = useState(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
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
  
  // Load survey results when modal opens
  useEffect(() => {
    if (!product?.id) return;
    
    // Load existing survey data or initialize
    const existingSurveyData = JSON.parse(localStorage.getItem(`surveyData_${product.id}`) || 'null');
    
    if (existingSurveyData) {
      setSurveyResults(existingSurveyData);
    } else {
      const initialData = {
        totalResponses: 47,
        averageRating: 4.2,
        totalRatingSum: 197.4, // 47 * 4.2
        questionCounts: {
          1: { 5: 21, 4: 14, 3: 7, 2: 3, 1: 2 },
          2: { 5: 16, 4: 19, 3: 9, 2: 2, 1: 1 },
          3: { 5: 24, 4: 12, 3: 7, 2: 3, 1: 1 }
        }
      };
      
      // Convert counts to percentages for display
      const questions = {};
      Object.keys(initialData.questionCounts).forEach(qId => {
        questions[qId] = {};
        Object.keys(initialData.questionCounts[qId]).forEach(option => {
          questions[qId][option] = Math.round((initialData.questionCounts[qId][option] / initialData.totalResponses) * 100);
        });
      });
      
      setSurveyResults({
        ...initialData,
        questions
      });
      
      localStorage.setItem(`surveyData_${product.id}`, JSON.stringify({
        ...initialData,
        questions
      }));
    }
    
    // Reset form states
    setShowSurveyForm(false);
    setShowUserForm(false);
    setUserAlreadyAnswered(false);
    setUserName('');
    setUserEmail('');
    setSurveyAnswers({});
    setStarRating(0);
  }, [product?.id]);
  
  const handleAnswerChange = (questionId, value) => {
    setSurveyAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const checkUserAndProceed = () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('אנא מלא שם ומייל');
      return;
    }
    
    // Check if this user (name + email) already rated this product
    const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
    const userKey = `${product.id}_${userName.trim()}_${userEmail.trim()}`;
    
    if (userResponses[userKey]) {
      setUserAlreadyAnswered(true);
      setShowUserForm(false);
    } else {
      setUserAlreadyAnswered(false);
      setShowUserForm(false);
      setShowSurveyForm(true);
    }
  };
  
  const submitSurvey = () => {
    // Check if all questions are answered
    if (Object.keys(surveyAnswers).length !== surveyQuestions.length) {
      alert('אנא ענה על כל השאלות');
      return;
    }
    
    // Check if star rating is selected
    if (starRating === 0) {
      alert('אנא בחר דירוג כוכבים');
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
    
    // Save to localStorage with name+email key
    const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
    const userKey = `${product.id}_${userName.trim()}_${userEmail.trim()}`;
    userResponses[userKey] = surveyData;
    localStorage.setItem('userSurveyResponses', JSON.stringify(userResponses));
    
    // Update results immediately with new answer data
    setSurveyResults(prev => {
      const newTotalResponses = prev.totalResponses + 1;
      const newTotalRatingSum = (prev.totalRatingSum || (prev.averageRating * prev.totalResponses)) + starRating;
      const newAverageRating = Number((newTotalRatingSum / newTotalResponses).toFixed(1));
      
      // Update question counts
      const newQuestionCounts = { ...prev.questionCounts };
      Object.keys(surveyAnswers).forEach(questionId => {
        const answer = surveyAnswers[questionId];
        if (!newQuestionCounts[questionId]) {
          newQuestionCounts[questionId] = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        }
        newQuestionCounts[questionId][answer] = (newQuestionCounts[questionId][answer] || 0) + 1;
      });
      
      // Convert counts to percentages for display
      const newQuestions = {};
      Object.keys(newQuestionCounts).forEach(qId => {
        newQuestions[qId] = {};
        Object.keys(newQuestionCounts[qId]).forEach(option => {
          newQuestions[qId][option] = Math.round((newQuestionCounts[qId][option] / newTotalResponses) * 100);
        });
      });
      
      const updatedResults = {
        totalResponses: newTotalResponses,
        averageRating: newAverageRating,
        totalRatingSum: newTotalRatingSum,
        questionCounts: newQuestionCounts,
        questions: newQuestions
      };
      
      // Save to localStorage
      localStorage.setItem(`surveyData_${product.id}`, JSON.stringify(updatedResults));
      
      return updatedResults;
    });
    
    setShowSurveyForm(false);
    alert('תודה על הדירוג!');
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
                {!showUserForm && !showSurveyForm && (
                  <button 
                    className="toggle-survey-btn"
                    onClick={() => setShowUserForm(true)}
                  >
                    מלא סקר
                  </button>
                )}
              </div>
              
              {/* תמיד להציג תוצאות */}
              {surveyResults && !showUserForm && !showSurveyForm && (
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
              )}
              
              {/* טופס הזנת שם ומייל */}
              {showUserForm && (
                <div className="user-form">
                  <h4>הזן את הפרטים שלך</h4>
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
                  <div className="form-buttons">
                    <button className="check-user-btn" onClick={checkUserAndProceed}>
                      המשך
                    </button>
                    <button className="cancel-btn" onClick={() => setShowUserForm(false)}>
                      ביטול
                    </button>
                  </div>
                </div>
              )}
              
              {/* הודעה שהמשתמש כבר דירג */}
              {userAlreadyAnswered && (
                <div className="thank-you-message">
                  <h4>כבר דירגת את המוצר הזה</h4>
                  <p>תודה שענית על הסקר! אנו מעריכים את המשוב שלך</p>
                  <button className="back-btn" onClick={() => {
                    setUserAlreadyAnswered(false);
                    setUserName('');
                    setUserEmail('');
                  }}>
                    חזור
                  </button>
                </div>
              )}
              
              {/* טופס הדירוג */}
              {showSurveyForm && (
                <div className="survey-form">
                  <div className="user-display">
                    <p><strong>שם:</strong> {userName}</p>
                    <p><strong>מייל:</strong> {userEmail}</p>
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
                  
                  <div className="form-buttons">
                    <button className="submit-survey" onClick={submitSurvey}>
                      שלח דירוג
                    </button>
                    <button className="cancel-btn" onClick={() => {
                      setShowSurveyForm(false);
                      setUserName('');
                      setUserEmail('');
                      setSurveyAnswers({});
                      setStarRating(0);
                    }}>
                      ביטול
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}