import Card from "./Card";
import styles from "./MatchingGame.module.css";

/**
 * GameBoard Component
 * Renders the two grids of cards (images and words)
 * @param {Object} props - Component props
 * @param {Array} props.imageCards - Array of image card objects
 * @param {Array} props.wordCards - Array of word card objects
 * @param {Object} props.selected - Currently selected cards {imageId, wordId}
 * @param {Function} props.onCardClick - Card click handler
 * @param {boolean} props.disabled - Whether cards are disabled
 */
export default function GameBoard({
  imageCards,
  wordCards,
  selected,
  onCardClick,
  disabled,
}) {
  return (
    <main className={styles.gameBoard}>
      {/* Image Grid */}
      <div className={styles.gridImages} role="group" aria-label="Image cards">
        {imageCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isSelected={selected.imageId === card.id}
            onClick={() => onCardClick(card.id, "image")}
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
