import styles from "./MatchingGame.module.css";

/**
 * Header Component
 * Displays the game score and timer
 * @param {Object} props - Component props
 * @param {number} props.score - Current game score
 * @param {number} props.timer - Remaining time in seconds
 */
export default function Header({ score, timer }) {
  return (
    <header className={styles.header}>
      <div
        className={styles.scoreDisplay}
        role="status"
        aria-live="polite"
        aria-label={`Score: ${score}`}
      >
        <span className={styles.label}>Score:</span>
        <span className={styles.value}>{score}</span>
      </div>
      <div
        className={styles.timerDisplay}
        role="timer"
        aria-live="polite"
        aria-label={`Time remaining: ${timer} seconds`}
      >
        <span className={styles.label}>⏱️ Time:</span>
        <span className={styles.value}>{timer}s</span>
      </div>
    </header>
  );
}
