import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id].timerId);
      delete toastTimers.current[id];
    }
  }, []);

  const startTimer = useCallback((id, duration) => {
    if (toastTimers.current[id]?.timerId) {
      clearTimeout(toastTimers.current[id].timerId);
    }

    const timerId = setTimeout(() => removeToast(id), duration);
    toastTimers.current[id] = {
      timerId,
      startedAt: Date.now(),
      remainingTime: duration,
    };
  }, [removeToast]);

  const pauseToast = useCallback((id) => {
    const info = toastTimers.current[id];
    if (info && info.timerId) {
      clearTimeout(info.timerId);
      const elapsed = Date.now() - info.startedAt;
      info.remainingTime = Math.max(0, info.remainingTime - elapsed);
      info.timerId = null;
    }
  }, []);

  const resumeToast = useCallback((id) => {
    const info = toastTimers.current[id];
    if (info && info.remainingTime > 0 && !info.timerId) {
      startTimer(id, info.remainingTime);
    } else if (info && info.remainingTime <= 0) {
      removeToast(id);
    }
  }, [startTimer, removeToast]);

  const showToast = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    startTimer(id, duration);
  }, [startTimer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
              onFocus={() => pauseToast(toast.id)}
              onBlur={() => resumeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};