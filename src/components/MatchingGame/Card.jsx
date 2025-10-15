import { memo } from "react";
import styles from "./MatchingGame.module.css";

/**
 * Card component for the matching game
 * @param {Object} props - Component props
 * @param {Object} props.card - Card object with {id, type, content, image, matched, error, replacing, entering}
 * @param {boolean} props.isSelected - Whether the card is currently selected
 * @param {Function} props.onClick - Click handler for the card
 * @param {boolean} props.disabled - Whether the card is disabled
 * @returns {JSX.Element}
 */
function Card({ card, isSelected, onClick, disabled }) {
  const cardClasses = [
    styles.card,
    card.type === "image" ? styles.cardImage : styles.cardWord,
    isSelected && styles.selected,
    card.matched && styles.matched,
    card.error && styles.error,
    card.replacing && styles.replacing,
    card.entering && styles.entering,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={cardClasses}
      onClick={onClick}
      disabled={disabled || card.matched}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${card.type} card: ${card.content}`}
    >
      {card.type === "image" ? (
        <img
          src={card.image}
          alt={card.content}
          className={styles.cardImageElement}
          aria-hidden="true"
          loading="eager"
          decoding="async"
        />
      ) : (
        <span className={styles.word}>{card.content}</span>
      )}
    </button>
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-render when props actually change
export default memo(Card);
