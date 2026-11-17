/**
 * StatusMessage component
 * Accessible feedback messages for CRUD operations.
 */
import { useEffect, useState } from 'react';

export function StatusMessage({
  message,
  type = 'info',
  onDismiss,
  duration = 5000
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [message, type]);

  useEffect(() => {
    if (!message || duration <= 0) return undefined;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message || !isVisible) return null;

  const isError = type === 'error';
  const role = isError ? 'alert' : 'status';
  const live = isError ? 'assertive' : 'polite';
  const icon =
    type === 'success' ? '✓' :
    type === 'error' ? '✗' :
    type === 'warning' ? '!' : 'ℹ';

  return (
    <div
      className={`status-message status-${type}`}
      role={role}
      aria-live={live}
      aria-atomic="true"
    >
      <span className="status-icon" aria-hidden="true">{icon}</span>
      <span className="status-text">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className="status-dismiss"
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default StatusMessage;
