import React from 'react';
import { motion } from 'framer-motion';
import '../styles/toast.css';

const Toast = ({ message, type = 'error', onClose, onMouseEnter, onMouseLeave, onFocus, onBlur }) => {
  const handleKeyDown = (e) => {
    // Allow dismissing the toast via keyboard
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`toast-item ${type}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex="0"
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast-content">
        <span className="toast-icon" aria-hidden="true">
          {type === 'error' ? '⚠️' : '✅'}
        </span>
        <p className="toast-message">{message}</p>
      </div>
      <button 
        className="toast-close" 
        aria-label="Close notification"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        &times;
      </button>
    </motion.div>
  );
};

export default Toast;