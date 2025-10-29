import React, { useState, useCallback } from 'react';
import Toast from './Toast';

let toastId = 0;

const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Make addToast available globally
  React.useEffect(() => {
    window.showToast = addToast;
    console.log('ToastManager loaded, showToast available');
    return () => {
      delete window.showToast;
    };
  }, [addToast]);

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastManager;