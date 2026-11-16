/**
 * StatusMessage component
 * Displays temporary status/feedback messages
 */
import { useState, useEffect } from 'react';

export function StatusMessage({ message, type = 'info', onDismiss, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);

  if (!message || !isVisible) {
    return null;
  }

  const messageClass = `status-message status-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '!' : 'ℹ';

  return (
    <div className={messageClass} role="status" aria-live="polite">
      <span className="status-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="status-text">{message}</span>
      {onDismiss && (
        <button 
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className="status-dismiss"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default StatusMessage;
