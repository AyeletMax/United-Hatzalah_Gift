import React, { useState, useEffect } from 'react';
import './ProductModal.css';

const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) return null;
  
  const apiUrl = baseUrl.includes("localhost")
    ? baseUrl
    : baseUrl.includes("onrender.com")
    ? baseUrl
    : `${baseUrl}.onrender.com`;
  
  return apiUrl;
};

const API_URL = getApiUrl();

export default function ProductModal({ product, isOpen, onClose }) {
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [starRating, setStarRating] = useState(0);
  const [surveyResults, setSurveyResults] = useState(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAlreadyAnswered, setUserAlreadyAnswered] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  const [showResults, setShowResults] = useState(false);
  
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
  
  // Reset form states only
  useEffect(() => {
    setShowSurveyForm(false);
    setShowUserForm(false);
    setUserAlreadyAnswered(false);
    setUserName('');
    setUserEmail('');
    setSurveyAnswers({});
    setStarRating(0);
    setShowResults(false);
    setSurveyResults(null);
  }, [product?.id]);
  
  const handleAnswerChange = (questionId, value) => {
    setSurveyAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const calculateSurveyResults = (productResponses) => {
    if (productResponses.length === 0) {
      return {
        totalResponses: 0,
        averageRating: 0,
        questions: {
          1: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          2: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      };
    }

    const totalResponses = productResponses.length;
    const totalRating = productResponses.reduce((sum, item) => sum + (item.rating || 0), 0);
    const averageRating = totalResponses > 0 ? (totalRating / totalResponses).toFixed(1) : 0;
    
    const questionResults = {};
    surveyQuestions.forEach(question => {
      const answerCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      productResponses.forEach(item => {
        if (item.answers && item.answers[question.id]) {
          const answer = item.answers[question.id];
          if (answer >= 1 && answer <= 5) {
            answerCounts[answer]++;
          }
        }
      });
      
      const percentages = {};
      for (let answer = 1; answer <= 5; answer++) {
        percentages[answer] = totalResponses > 0 ? Math.round((answerCounts[answer] / totalResponses) * 100) : 0;
      }
      questionResults[question.id] = percentages;
    });
    
    return {
      totalResponses,
      averageRating: parseFloat(averageRating),
      questions: questionResults
    };
  };

  const loadSurveyResults = async () => {
    try {
      if (!API_URL) {
        console.warn('אין חיבור לשרת - לא ניתן לטעון תוצאות סקר');
        setSurveyResults(calculateSurveyResults([]));
        return;
      }
      
      // טען רק מבסיס הנתונים
      const response = await fetch(`${API_URL}/api/survey/product/${product.id}`);
      if (response.ok) {
        const serverResponses = await response.json();
        // המר את תגובות השרת לפורמט הנדרש
        const convertedResponses = serverResponses.map(sr => {
          let answers = { 1: sr.rating, 2: sr.rating, 3: sr.rating }; // ברירת מחדל
          
          // אם יש תשובות שמורות, השתמש בהן
          if (sr.answers) {
            try {
              const parsedAnswers = typeof sr.answers === 'string' ? JSON.parse(sr.answers) : sr.answers;
              answers = parsedAnswers;
            } catch (e) {
              console.warn('שגיאה בפרסור תשובות:', e);
            }
          }
          
          return {
            productId: sr.product_id,
            rating: sr.rating,
            userName: sr.user_name,
            userEmail: sr.user_email,
            timestamp: sr.created_at,
            answers: answers
          };
        });
        
        const results = calculateSurveyResults(convertedResponses);
        setSurveyResults(results);
      } else {
        console.error('שגיאה בטעינת נתונים מהשרת');
        setSurveyResults(calculateSurveyResults([]));
      }
    } catch (error) {
      console.error('שגיאה בטעינת תוצאות הסקר:', error);
      setSurveyResults(calculateSurveyResults([]));
    }
  };

  const checkUserAndProceed = async () => {
    const missingFields = [];
    if (!userName.trim()) missingFields.push('שם');
    if (!userEmail.trim()) missingFields.push('מייל');
    
    if (missingFields.length > 0) {
      showMessage(`אנא מלא את השדות: ${missingFields.join(', ')}`, 'warning');
      return;
    }
    
    if (!API_URL) {
      showMessage('אין חיבור לשרת - לא ניתן לבדוק סקרים', 'error');
      return;
    }
    
    try {
      // בדיקה רק בבסיס הנתונים
      const response = await fetch(`${API_URL}/api/survey/check/${product.id}/${encodeURIComponent(userName.trim())}/${encodeURIComponent(userEmail.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasResponded) {
          setUserAlreadyAnswered(true);
          setShowUserForm(false);
          return;
        }
      }
      
      // אם לא נמצא דירוג - המשך לסקר
      setUserAlreadyAnswered(false);
      setShowUserForm(false);
      setShowSurveyForm(true);
      
    } catch (error) {
      console.error('שגיאה בבדיקת משתמש:', error);
      showMessage('שגיאה בבדיקת הנתונים - בדוק חיבור לאינטרנט', 'error');
    }
  };
  
  const submitSurvey = async () => {
    try {
      // בדיקת שאלות חסרות
      const unansweredQuestions = [];
      surveyQuestions.forEach(question => {
        if (!surveyAnswers[question.id]) {
          unansweredQuestions.push(question.text);
        }
      });
      
      if (unansweredQuestions.length > 0) {
        showMessage(`אנא ענה על השאלות הבאות:\n${unansweredQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`, 'warning');
        return;
      }
      
      // בדיקת דירוג כוכבים
      if (starRating === 0) {
        showMessage('אנא בחר דירוג כוכבים (מ 1 עד 5 כוכבים)', 'warning');
        return;
      }

      if (!API_URL) {
        showMessage('אין חיבור לשרת - לא ניתן לשמור סקר', 'error');
        return;
      }
      
      // שמירה רק בבסיס הנתונים
      const response = await fetch(`${API_URL}/api/survey`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          product_id: product.id,
          user_name: userName.trim(),
          user_email: userEmail.trim(),
          rating: starRating,
          answers: surveyAnswers
        })
      });
      
      if (response.ok) {
        // סיום מוצלח
        setShowSurveyForm(false);
        setShowResults(true);
        await loadSurveyResults();
        
        showMessage('תודה רבה על הדירוג!', 'success');
        
        if (window.showToast) {
          window.showToast('הדירוג נשמר בבסיס הנתונים!', 'success', 4000);
        }
      } else if (response.status === 409) {
        showMessage('כבר דירגת את המוצר הזה', 'info');
        setUserAlreadyAnswered(true);
        setShowSurveyForm(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage(errorData.error || 'שגיאה בשמירת הסקר', 'error');
      }
      
    } catch (error) {
      console.error('שגיאה בשליחת הסקר:', error);
      showMessage('שגיאה בחיבור לשרת - בדוק חיבור לאינטרנט', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>×</button>
        
        <div className="modal-body">
          <div className="modal-main-content">
            <div className="product-image-section">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="modal-product-image" />
              ) : (
                <div className="modal-product-placeholder">📦</div>
              )}
            </div>
            
            <div className="product-info-section">
              <h2 className="modal-product-title">{product.name}</h2>
              
              <div className="product-details">
            <div className="detail-item">
              <h3>פרטים על המוצר</h3>
              <p>{product.description || "לא צוין תיאור"}</p>
            </div>
            
            <div className="detail-item">
              <h3>מחיר ליח' כולל מע"מ</h3>
              <p className="price-detail">₪{product.unit_price_incl_vat || "לא צוין"}</p>
            </div>
            
            <div className="detail-item">
              <h3>זמן אספקה</h3>
              <p>{product.delivery_time_days ? `${product.delivery_time_days} ימי עסקים` : "לא צוין"}</p>
            </div>
            
            <div className="detail-item">
              <h3>שם מזמין אחרון</h3>
              <p>{product.last_ordered_by_name || product.last_buyer || "לא צוין"}</p>
            </div>
            
            <div className="detail-item">
              <h3>מותג</h3>
              <p>{product.displayed_by || product.brand || "לא צוין"}</p>
            </div>
              </div>
            </div>
          </div>
          
          <div className="survey-section">
              <div className="survey-header">
                <h3>סקר שביעות רצון</h3>
                {!showUserForm && !showSurveyForm && (
                  <div className="survey-buttons">
                    <button 
                      className="toggle-survey-btn"
                      onClick={() => {
                        setShowUserForm(true);
                        setTimeout(() => {
                          const modalContent = document.querySelector('.modal-content');
                          if (modalContent) {
                            modalContent.scrollTo({
                              top: modalContent.scrollHeight,
                              behavior: 'smooth'
                            });
                          }
                        }, 100);
                      }}
                    >
                      מלא סקר
                    </button>
                    <button 
                      className="toggle-results-btn"
                      onClick={async () => {
                        if (!showResults) {
                          await loadSurveyResults();
                        }
                        setShowResults(!showResults);
                        if (!showResults) {
                          setTimeout(() => {
                            const modalContent = document.querySelector('.modal-content');
                            if (modalContent) {
                              modalContent.scrollTo({
                                top: modalContent.scrollHeight,
                                behavior: 'smooth'
                              });
                            }
                          }, 100);
                        }
                      }}
                    >
                      {showResults ? 'הסתר תוצאות' : 'צפה בתוצאות הסקר'}
                    </button>
                  </div>
                )}
              </div>
              

              
              {/* תוצאות הסקר - רק כשלוחצים על המלצות */}
              {showResults && !showUserForm && !showSurveyForm && (
                <div className="survey-results">
                  {surveyResults && surveyResults.totalResponses > 0 ? (
                    <>
                      <div className="results-summary">
                        <p><strong>{surveyResults.totalResponses}</strong> לקוחות דירגו את המוצר</p>
                        <p>דירוג ממוצע: <strong>{surveyResults.averageRating}/5</strong> {'★'.repeat(Math.round(surveyResults.averageRating))}</p>
                      </div>
                      
                      <div className="questions-results">
                        <div className="results-grid">
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
                    </>
                  ) : (
                    <div className="no-results">
                      <p>עדיין לא נשלחו דירוגים למוצר הזה</p>
                      <p>היה הראשון לדרג!</p>
                    </div>
                  )}
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
                  {/* הודעות */}
                  {message && (
                    <div className={`message ${messageType}`}>
                      {message}
                    </div>
                  )}
                  
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
                  <div className="questions-grid">
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
                  </div>
                  
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
                  
                  {/* הודעות */}
                  {message && (
                    <div className={`message ${messageType}`}>
                      {message}
                    </div>
                  )}
                  
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
  );
}