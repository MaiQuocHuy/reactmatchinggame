import { useEffect } from "react";
import styles from "./MatchingGame.module.css";

/**
 * GameNotification Component
 * Shows success/error notifications with pure CSS animations
 *
 * @param {Object} props - Component props
 * @param {string} props.type - 'success' or 'error'
 * @param {string} props.message - Notification message
 * @param {Function} props.onClose - Called when animation completes
 */
export default function GameNotification({ type, message, onClose }) {
  useEffect(() => {
    // Auto-dismiss after animation completes
    // Fade in (0.3s) + stay (1.2s) + fade out (0.3s) = 1.8s total
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === "success" ? "✅" : "❌";
  const notificationClass =
    type === "success" ? styles.notificationSuccess : styles.notificationError;

  return (
    <div
      className={`${styles.notification} ${notificationClass}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.notificationIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.notificationMessage}>{message}</span>
    </div>
  );
}
