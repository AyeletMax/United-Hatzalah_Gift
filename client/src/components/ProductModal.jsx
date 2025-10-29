import React, { useState, useEffect } from 'react';
import './ProductModal.css';

// כבה סקר בענן עד שהשרת יעבוד
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : null;

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
  
  // Load survey results
  useEffect(() => {
    if (!product?.id || !API_URL) return;
    
    const loadSurveyResults = async () => {
      try {
        const response = await fetch(`${API_URL}/api/surveys/product/${product.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length > 0) {
          const totalResponses = data.length;
          const totalRating = data.reduce((sum, item) => sum + (item.rating || 0), 0);
          const averageRating = totalResponses > 0 ? (totalRating / totalResponses).toFixed(1) : 0;
          
          // חישוב אחוזים אמיתיים לפי הדירוגים
          const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          data.forEach(item => {
            if (item.rating >= 1 && item.rating <= 5) {
              ratingCounts[item.rating]++;
            }
          });
          
          // חישוב אחוזים
          const percentages = {};
          for (let rating = 1; rating <= 5; rating++) {
            percentages[rating] = totalResponses > 0 ? Math.round((ratingCounts[rating] / totalResponses) * 100) : 0;
          }
          
          setSurveyResults({
            totalResponses,
            averageRating: parseFloat(averageRating),
            questions: {
              1: percentages,
              2: percentages,
              3: percentages
            }
          });
        } else {
          const emptyPercentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          setSurveyResults({
            totalResponses: 0,
            averageRating: 0,
            questions: {
              1: emptyPercentages,
              2: emptyPercentages,
              3: emptyPercentages
            }
          });
        }
      } catch (error) {
        console.warn('Survey service unavailable:', error.message);
        // Set empty results silently - don't show error to user
        const emptyPercentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        setSurveyResults({
          totalResponses: 0,
          averageRating: 0,
          questions: {
            1: emptyPercentages,
            2: emptyPercentages,
            3: emptyPercentages
          }
        });
      }
    };
    
    loadSurveyResults();
    
    // Only auto-refresh if survey service is working
    let interval;
    if (API_URL && API_URL.includes('localhost')) {
      interval = setInterval(loadSurveyResults, 5000);
    }
    
    // Reset form states
    setShowSurveyForm(false);
    setShowUserForm(false);
    setUserAlreadyAnswered(false);
    setUserName('');
    setUserEmail('');
    setSurveyAnswers({});
    setStarRating(0);
    setShowResults(false);
    
    return () => {
      if (interval) clearInterval(interval);
    };
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

  const checkUserAndProceed = async () => {
    const missingFields = [];
    if (!userName.trim()) missingFields.push('שם');
    if (!userEmail.trim()) missingFields.push('מייל');
    
    if (missingFields.length > 0) {
      showMessage(`אנא מלא את השדות: ${missingFields.join(', ')}`, 'warning');
      return;
    }
    
    if (!API_URL) {
      // אם אין שרת, עבור ישר לסקר
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
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/surveys/check/${product.id}/${encodeURIComponent(userName.trim())}/${encodeURIComponent(userEmail.trim())}`);
      const data = await response.json();
      
      if (data.hasResponded) {
        setUserAlreadyAnswered(true);
        setShowUserForm(false);
      } else {
        setUserAlreadyAnswered(false);
        setShowUserForm(false);
        setShowSurveyForm(true);
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
    } catch (error) {
      console.warn('Survey service unavailable, using local storage');
      // Fallback to localStorage check
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
    }
  };
  
  const submitSurvey = async () => {
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
      // שמירה מקומית בלבד
      const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
      const userKey = `${product.id}_${userName.trim()}_${userEmail.trim()}`;
      userResponses[userKey] = {
        productId: product.id,
        answers: surveyAnswers,
        rating: starRating,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userSurveyResponses', JSON.stringify(userResponses));
      
      setShowSurveyForm(false);
      showMessage('תודה רבה על הדירוג! המשוב שלך חשוב לנו', 'success');
      if (window.showToast) {
        window.showToast('הדירוג נשמר בהצלחה! תודה על המשוב', 'success', 4000);
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          user_name: userName.trim(),
          user_email: userEmail.trim(),
          rating: starRating
        })
      });
      
      if (response.status === 409) {
        showMessage('כבר דירגת את המוצר הזה קודם לכן', 'info');
        setUserAlreadyAnswered(true);
        setShowSurveyForm(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('שגיאה בשמירת הדירוג');
      }
      
      // Save to localStorage as backup
      const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
      const userKey = `${product.id}_${userName.trim()}_${userEmail.trim()}`;
      userResponses[userKey] = {
        productId: product.id,
        answers: surveyAnswers,
        rating: starRating,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userSurveyResponses', JSON.stringify(userResponses));
      
      // Update results immediately
      setSurveyResults(prev => {
        const newTotalResponses = prev.totalResponses + 1;
        const newTotalRating = (prev.averageRating * prev.totalResponses) + starRating;
        const newAverageRating = parseFloat((newTotalRating / newTotalResponses).toFixed(1));
        
        return {
          totalResponses: newTotalResponses,
          averageRating: newAverageRating,
          questions: prev.questions
        };
      });
      
      setShowSurveyForm(false);
      showMessage('תודה רבה על הדירוג! המשוב שלך חשוב לנו', 'success');
      console.log('Trying to show toast:', window.showToast);
      if (window.showToast) {
        window.showToast('הדירוג נשמר בהצלחה! תודה על המשוב', 'success', 4000);
      } else {
        console.log('showToast not available');
      }
      
      // Reload survey results to show real-time update
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_URL}/api/surveys/product/${product.id}`);
          const data = await response.json();
          
          if (data.length > 0) {
            const totalResponses = data.length;
            const totalRating = data.reduce((sum, item) => sum + (item.rating || 0), 0);
            const averageRating = totalResponses > 0 ? (totalRating / totalResponses).toFixed(1) : 0;
            
            // חישוב אחוזים מעודכנים
            const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.forEach(item => {
              if (item.rating >= 1 && item.rating <= 5) {
                ratingCounts[item.rating]++;
              }
            });
            
            const percentages = {};
            for (let rating = 1; rating <= 5; rating++) {
              percentages[rating] = totalResponses > 0 ? Math.round((ratingCounts[rating] / totalResponses) * 100) : 0;
            }
            
            setSurveyResults({
              totalResponses,
              averageRating: parseFloat(averageRating),
              questions: {
                1: percentages,
                2: percentages,
                3: percentages
              }
            });
          }
        } catch (error) {
          console.error('Error reloading results:', error);
        }
      }, 500);
      
    } catch (error) {
      console.warn('Survey service unavailable, saving locally');
      // Save to localStorage as fallback
      const userResponses = JSON.parse(localStorage.getItem('userSurveyResponses') || '{}');
      const userKey = `${product.id}_${userName.trim()}_${userEmail.trim()}`;
      userResponses[userKey] = {
        productId: product.id,
        answers: surveyAnswers,
        rating: starRating,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userSurveyResponses', JSON.stringify(userResponses));
      
      setShowSurveyForm(false);
      showMessage('תודה רבה על הדירוג! המשוב שלך חשוב לנו', 'success');
      if (window.showToast) {
        window.showToast('הדירוג נשמר בהצלחה! תודה על המשוב', 'success', 4000);
      }
    }
  };

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
          
          <h2 className="modal-product-title">{product.name}</h2>
          
          {product.unit_price_incl_vat && (
            <div className="modal-product-price">₪{product.unit_price_incl_vat}</div>
          )}
          
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
          
          {API_URL && (
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
                      onClick={() => {
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
              {surveyResults && !showUserForm && !showSurveyForm && showResults && (
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
          )}
        </div>
      </div>
    </div>
  );
}