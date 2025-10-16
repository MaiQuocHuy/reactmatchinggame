import styles from "./MatchingGame.module.css";

/**
 * GameOverlay component for the matching game
 * @param {Object} props
 * @param {string} props.type - Overlay type ("start" | "end")
 * @param {string} props.title - Overlay title
 * @param {number} props.score - Final score (for end screen)
 * @param {number} props.maxScore - Maximum possible score (for end screen)
 * @param {number} props.matchedPairs - Number of matched pairs (for end screen)
 * @param {number} props.totalPairs - Total number of pairs in the game (for end screen)
 * @param {boolean} props.isWin - Whether the player won (completed all matches) or lost (time ran out)
 * @param {Function} props.onStart - Callback when start button clicked
 * @returns {JSX.Element}
 */
export default function GameOverlay({
  type,
  title,
  score,
  maxScore,
  matchedPairs,
  totalPairs,
  isWin,
  onStart,
}) {
  if (type === "start") {
    return (
      <div className={styles.startGame}>
        <div className={styles.overlayHeader}>
          <h1 className={styles.title}>{title || "Picture Match Fun!"}</h1>
          <h2 className={styles.modalTitle}>Ready to Play?</h2>
        </div>

        <button className={styles.startButton} onClick={onStart}>
          Start Game
        </button>
      </div>
    );
  }

  if (type === "end") {
    const scorePercentage =
      maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Determine result message
    const resultMessage = isWin
      ? "You Win!"
      : matchedPairs === 0
      ? "Failed - Try Again!"
      : "Time's Up!";

    const resultEmoji = isWin ? "🎉" : matchedPairs === 0 ? "😔" : "⏰";

    return (
      <div className={styles.gameOverOverlay}>
        <div className={styles.gameOverContent}>
          <div className={styles.gameOverHeader}>
            <span className={styles.partyEmoji}>{resultEmoji}</span>
            <h2
              className={`${styles.gameOverTitle} ${
                isWin ? styles.win : styles.lose
              }`}
            >
              {resultMessage}
            </h2>
            <span className={styles.partyEmoji}>{resultEmoji}</span>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.matchedStats}>
              <span className={styles.matchedLabel}>Matched Pairs</span>
              <span className={styles.matchedValue}>
                {matchedPairs || 0} / {totalPairs}
              </span>
            </div>

            <div className={styles.scoreStats}>
              <span className={styles.scoreLabel}>Your Score</span>
              <div className={styles.scoreComparison}>
                <span className={styles.userScore}>{score}</span>
                <span className={styles.scoreDivider}>/</span>
                <span className={styles.maxScore}>{maxScore}</span>
              </div>
              <div className={styles.scorePercentage}>
                {scorePercentage}% Complete
              </div>
            </div>
          </div>

          <button className={styles.playAgainButton} onClick={onStart}>
            {isWin ? "Play Again" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
