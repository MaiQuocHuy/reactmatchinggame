import Card from "./Card";
import styles from "./MatchingGame.module.css";

/**
 * GameBoard Component
 * Renders the two grids of cards (emojis and words)
 * @param {Object} props - Component props
 * @param {Array} props.emojiCards - Array of emoji card objects
 * @param {Array} props.wordCards - Array of word card objects
 * @param {Object} props.selected - Currently selected cards {imageId, wordId}
 * @param {Function} props.onCardClick - Card click handler
 * @param {boolean} props.disabled - Whether cards are disabled
 */
export default function GameBoard({
  emojiCards,
  wordCards,
  selected,
  onCardClick,
  disabled,
}) {
  return (
    <main className={styles.gameBoard}>
      {/* Emoji Grid */}
      <div className={styles.gridImages} role="group" aria-label="Emoji cards">
        {emojiCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selected.imageId === card.id}
            onClick={() => onCardClick(card.id, "emoji")}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Word Grid */}
      <div className={styles.gridWords} role="group" aria-label="Word cards">
        {wordCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selected.wordId === card.id}
            onClick={() => onCardClick(card.id, "word")}
            disabled={disabled}
          />
        ))}
      </div>
    </main>
  );
}
