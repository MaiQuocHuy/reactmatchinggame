import styles from "./MatchingGame.module.css";

/**
 * Card Component
 * Renders a single card (image or word)
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data
 * @param {number} props.card.id - Unique card ID
 * @param {string} props.card.type - 'image' or 'word'
 * @param {string} props.card.content - Card content (word for text, or word for alt text on images)
 * @param {string} props.card.image - Image URL (for image cards)
 * @param {boolean} props.card.matched - Whether card is matched
 * @param {boolean} props.card.error - Whether card is in error state
 * @param {boolean} props.card.replacing - Whether card is being replaced
 * @param {boolean} props.isSelected - Whether card is currently selected
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether card is disabled
 */
export default function Card({ card, isSelected, onClick, disabled }) {
  const cardClasses = [
    styles.card,
    card.type === "image" ? styles.cardImage : styles.cardWord,
    isSelected && styles.selected,
    card.matched && styles.matched,
    card.error && styles.error,
    card.replacing && styles.replacing,
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
        />
      ) : (
        <span className={styles.word}>{card.content}</span>
      )}
    </button>
  );
}
