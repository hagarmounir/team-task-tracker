import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState({ isOpen: false, message: '', onConfirm: null });
      }
    });
  }, []);

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, message: '', onConfirm: null });
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        pointerEvents: 'none' // Let clicks pass through empty space
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            pointerEvents: 'auto',
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                       toast.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                       'rgba(99, 102, 241, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '250px',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer'
          }} onClick={() => removeToast(toast.id)}>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '16px' }}>Please Confirm</h3>
            <p className="text-muted" style={{ marginBottom: '24px', lineHeight: 1.5 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-ghost" onClick={closeConfirm} style={{ padding: '8px 24px' }}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmState.onConfirm} style={{ padding: '8px 24px', background: 'var(--accent-danger)', color: 'white' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Keyframe Injection for Toast Animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
