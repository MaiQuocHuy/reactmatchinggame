import styles from "./MatchingGame.module.css";

/**
 * GameOverlay Component
 * Displays start screen or game over screen
 * @param {Object} props - Component props
 * @param {string} props.type - Type of overlay: 'start' or 'end'
 * @param {number} props.score - Final score (for end screen)
 * @param {number} props.matchedPairs - Number of matched pairs (for end screen)
 * @param {Function} props.onStart - Callback when start button clicked
 */
export default function GameOverlay({ type, score, matchedPairs, onStart }) {
  if (type === "start") {
    return (
      <div className={styles.startGame}>
        <div className={styles.overlayHeader}>
          <h1 className={styles.title}>Picture Match Fun!</h1>
          <h2 className={styles.modalTitle}>Ready to Play?</h2>
        </div>

        <button className={styles.startButton} onClick={onStart}>
          Start Game
        </button>
      </div>
    );
  }

  if (type === "end") {
    return (
      <div className={styles.gameOverOverlay}>
        <div className={styles.gameOverContent}>
          <div className={styles.gameOverHeader}>
            <span className={styles.partyEmoji}>🎊</span>
            <h2 className={styles.gameOverTitle}>Time's Up!</h2>
            <span className={styles.partyEmoji}>🎊</span>
          </div>
          <p className={styles.gameOverMessage}>
            <span className={styles.matchedText}>You matched</span>{" "}
            {matchedPairs || 0} pairs!{" "}
            <span className={styles.finalScoreText}>Final Score: {score}</span>
          </p>
          <button className={styles.playAgainButton} onClick={onStart}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
