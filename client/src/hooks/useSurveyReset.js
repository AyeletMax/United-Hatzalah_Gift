import { useState } from 'react';

export const useSurveyReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [productToReset, setProductToReset] = useState(null);

  const resetProductSurvey = async (productId, e) => {
    e?.stopPropagation();
    setProductToReset(productId);
    setShowResetConfirm(true);
  };

  const handleResetConfirm = async () => {
    if (!productToReset) {
      console.error('אין מוצר לאיפוס');
      return;
    }
    
    setIsResetting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!baseUrl) {
        window.showToast?.('אין חיבור לשרת - לא ניתן לאפס סקרים', 'error');
        return;
      }
      
      const apiUrl = baseUrl.includes("localhost")
        ? baseUrl
        : baseUrl.includes("onrender.com")
        ? baseUrl
        : `${baseUrl}.onrender.com`;
      
      // איפוס רק בבסיס הנתונים
      const response = await fetch(`${apiUrl}/api/survey/reset/${productToReset}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const deletedCount = result.deletedCount || 0;
        const message = deletedCount > 0 
          ? `נמחקו ${deletedCount} סקרים מבסיס הנתונים`
          : 'אין סקרים למוצר זה לאיפוס';
        
        const toastType = deletedCount === 0 ? 'info' : 'success';
        window.showToast?.(message, toastType, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        window.showToast?.(errorData.error || 'שגיאה באיפוס הסקר', 'error');
      }
      
    } catch (error) {
      console.error('שגיאה באיפוס הסקר:', error);
      window.showToast?.('שגיאה בחיבור לשרת - בדוק חיבור לאינטרנט', 'error');
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
      setProductToReset(null);
    }
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
    setProductToReset(null);
  };

  return {
    isResetting,
    showResetConfirm,
    resetProductSurvey,
    handleResetConfirm,
    handleResetCancel
  };
};