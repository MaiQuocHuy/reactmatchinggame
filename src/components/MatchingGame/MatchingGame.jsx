import { useState, useEffect, useRef, useCallback } from "react";
import useSound from "use-sound";
import { masterItems } from "../../mock/data";
import Header from "./Header";
import GameOverlay from "./GameOverlay";
import GameBoard from "./GameBoard";
import styles from "./MatchingGame.module.css";
import { shuffleArray } from "../../helpers/shuffle";

// Import sound files - supports both .mp3 and .wav formats
// Sound files are located in src/assets/sounds/
let selectSfx = "";
let matchSfx = "";
let errorSfx = "";

try {
  // Try .wav first, fallback to .mp3
  selectSfx = new URL("../../assets/sounds/select.wav", import.meta.url).href;
} catch {
  try {
    selectSfx = new URL("../../assets/sounds/select.mp3", import.meta.url).href;
  } catch {
    selectSfx = "";
  }
}

try {
  matchSfx = new URL("../../assets/sounds/match.mp3", import.meta.url).href;
} catch {
  try {
    matchSfx = new URL("../../assets/sounds/match.wav", import.meta.url).href;
  } catch {
    matchSfx = "";
  }
}

try {
  // Try .wav first, fallback to .mp3
  errorSfx = new URL("../../assets/sounds/error.wav", import.meta.url).href;
} catch {
  try {
    errorSfx = new URL("../../assets/sounds/error.mp3", import.meta.url).href;
  } catch {
    errorSfx = "";
  }
}

/**
 * MatchingGame Component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of items with {id, image, word} structure (default: masterItems from data.js)
 * @param {number} props.initialPairs - Number of image-word pairs to display (default: 5)
 * @param {number} props.timerLength - Game timer duration in seconds (default: 60)
 * @param {string} props.title - Game title to display (default: "Picture Match Fun!")
 * @returns {JSX.Element}
 */
export default function MatchingGame({
  data = masterItems,
  initialPairs = 5,
  timerLength = 60,
  title = "Picture Match Fun!",
}) {
  // State management
  const [deck, setDeck] = useState([]);
  const [imageCards, setImageCards] = useState([]);
  const [wordCards, setWordCards] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(timerLength);
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'verifying' | 'finished'
  const [selected, setSelected] = useState({});
  const [floatingScores, setFloatingScores] = useState([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0); // Track number of matched pairs
  const [isWin, setIsWin] = useState(false); // Track if player won (completed all matches)
  const [usedItemIds, setUsedItemIds] = useState([]); // Track IDs of items that have been matched

  // Refs
  const timerIntervalRef = useRef(null);
  const soundEnabledRef = useRef(false);

  // Sound hooks with graceful fallback
  const [playSelect] = useSound(selectSfx || "", {
    volume: 0.4,
    soundEnabled: soundEnabledRef.current,
  });
  const [playMatch] = useSound(matchSfx || "", {
    volume: 0.5,
    soundEnabled: soundEnabledRef.current,
  });
  const [playError] = useSound(errorSfx || "", {
    volume: 0.5,
    soundEnabled: soundEnabledRef.current,
  });

  // Initialize game
  const initializeGame = useCallback(() => {
    // Enable sound on user gesture
    soundEnabledRef.current = true;

    // Select random items
    const shuffledMaster = shuffleArray(data);
    const selectedItems = shuffledMaster.slice(0, initialPairs);
    setDeck(selectedItems);

    // Create image cards (shuffled)
    const shuffledImages = shuffleArray(
      selectedItems.map((item, idx) => ({
        id: idx,
        originalId: item.id,
        type: "image",
        content: item.word,
        image: item.image,
        matched: false,
        error: false,
        replacing: false,
        entering: false,
      }))
    );

    // Create word cards (shuffled independently)
    const shuffledWords = shuffleArray(
      selectedItems.map((item, idx) => ({
        id: idx + initialPairs,
        originalId: item.id,
        type: "word",
        content: item.word,
        matched: false,
        error: false,
        replacing: false,
        entering: false,
      }))
    );

    setImageCards(shuffledImages);
    setWordCards(shuffledWords);
    setScore(0);
    setTimer(timerLength);
    setSelected({});
    setFloatingScores([]);
    setMatchedPairsCount(0);
    setIsWin(false);
    setUsedItemIds(selectedItems.map((item) => item.id)); // Track initial items as used
    setGameState("playing");

    // Start timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          setIsWin(false); // Time ran out - player lost
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [data, initialPairs, timerLength]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Check for win condition whenever state changes
  useEffect(() => {
    if (gameState !== "playing") return;

    // Check if all items have been used and all cards are matched
    const allItemsUsed = usedItemIds.length >= data.length;
    const allCardsMatched =
      imageCards.length > 0 &&
      imageCards.every((c) => c.matched) &&
      wordCards.every((c) => c.matched);

    if (allItemsUsed && allCardsMatched) {
      // All items matched - player wins!
      setTimeout(() => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        setIsWin(true);
        setGameState("finished");
      }, 600);
    }
  }, [usedItemIds, imageCards, wordCards, gameState, data.length]);

  // Handle card selection
  const handleCardClick = (cardId, type) => {
    if (gameState !== "playing" && gameState !== "verifying") return;
    if (gameState === "verifying") return;

    const card =
      type === "image"
        ? imageCards.find((c) => c.id === cardId)
        : wordCards.find((c) => c.id === cardId);

    if (!card || card.matched) return;

    // Play select sound
    if (selectSfx) {
      playSelect();
    }

    if (type === "image") {
      // Toggle image selection
      if (selected.imageId === cardId) {
        setSelected({ ...selected, imageId: undefined });
      } else {
        setSelected({ ...selected, imageId: cardId });
        // Check for match if word is also selected
        if (selected.wordId !== undefined) {
          checkMatch(cardId, selected.wordId);
        }
      }
    } else {
      // Toggle word selection
      if (selected.wordId === cardId) {
        setSelected({ ...selected, wordId: undefined });
      } else {
        setSelected({ ...selected, wordId: cardId });
        // Check for match if image is also selected
        if (selected.imageId !== undefined) {
          checkMatch(selected.imageId, cardId);
        }
      }
    }
  };

  // Check if selected cards match
  const checkMatch = (imageId, wordId) => {
    setGameState("verifying");

    const imageCard = imageCards.find((c) => c.id === imageId);
    const wordCard = wordCards.find((c) => c.id === wordId);

    if (!imageCard || !wordCard) {
      setGameState("playing");
      return;
    }

    const isMatch = imageCard.originalId === wordCard.originalId;

    if (isMatch) {
      // Correct match!
      // const matchScore = 50 + Math.floor(timer / 2);
      const matchScore = 50;
      setScore((prev) => prev + matchScore);

      // Increment matched pairs count
      setMatchedPairsCount((prev) => prev + 1);

      // Play match sound
      if (matchSfx) {
        playMatch();
      }

      // Create floating score animation
      const floatingId = `${Date.now()}-${Math.random()}`;
      setFloatingScores((prev) => [
        ...prev,
        {
          id: floatingId,
          score: matchScore,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        },
      ]);

      // Remove floating score after animation
      setTimeout(() => {
        setFloatingScores((prev) => prev.filter((fs) => fs.id !== floatingId));
      }, 1500);

      // Immediately mark as matched
      setImageCards((prev) =>
        prev.map((c) => (c.id === imageId ? { ...c, matched: true } : c))
      );
      setWordCards((prev) =>
        prev.map((c) => (c.id === wordId ? { ...c, matched: true } : c))
      );

      // Clear selection
      setSelected({});

      // Replace matched cards after brief animation
      setTimeout(() => {
        replaceMatchedPair(imageCard.originalId);
      }, 250);

      // Shuffle positions AFTER replace animation completes (non-blocking)
      setTimeout(() => {
        requestAnimationFrame(() => {
          // Shuffle positions within each column
          setImageCards((prev) => {
            const shuffled = shuffleArray(prev);
            return shuffled;
          });
          setWordCards((prev) => {
            const shuffled = shuffleArray(prev);
            return shuffled;
          });
        });
      }, 550); // Wait for replace animation to complete (250ms + 300ms animation)

      // Return to playing state immediately
      setTimeout(() => setGameState("playing"), 300);
    } else {
      // Incorrect match
      if (errorSfx) {
        playError();
      }

      // Show error animation
      setImageCards((prev) =>
        prev.map((c) => (c.id === imageId ? { ...c, error: true } : c))
      );
      setWordCards((prev) =>
        prev.map((c) => (c.id === wordId ? { ...c, error: true } : c))
      );

      // Remove error state and selection after showing error
      setTimeout(() => {
        setImageCards((prev) =>
          prev.map((c) => (c.id === imageId ? { ...c, error: false } : c))
        );
        setWordCards((prev) =>
          prev.map((c) => (c.id === wordId ? { ...c, error: false } : c))
        );
        setSelected({});
        setGameState("playing");
      }, 800); // Increased to 800ms to give user more time to see the error
    }
  };

  // Replace matched pair with new items
  const replaceMatchedPair = useCallback(
    (matchedOriginalId) => {
      // Find new items that haven't been used yet
      const availableItems = data.filter(
        (item) => !usedItemIds.includes(item.id)
      );

      if (availableItems.length === 0) {
        // No more items to replace with
        return;
      }

      // Pick a random new item
      const newItem =
        availableItems[Math.floor(Math.random() * availableItems.length)];

      // Mark this item as used
      setUsedItemIds((prev) => [...prev, newItem.id]);

      // Add to deck (optimized - avoid filter)
      setDeck((prev) => {
        const filtered = prev.filter((item) => item.id !== matchedOriginalId);
        filtered.push(newItem);
        return filtered;
      });

      // Create new cards with simple ID generation
      const timestamp = Date.now();
      const newImageId = timestamp;
      const newWordId = timestamp + 1;

      const newImageCard = {
        id: newImageId,
        originalId: newItem.id,
        type: "image",
        content: newItem.word,
        image: newItem.image,
        matched: false,
        error: false,
        replacing: true,
        entering: false,
      };

      const newWordCard = {
        id: newWordId,
        originalId: newItem.id,
        type: "word",
        content: newItem.word,
        matched: false,
        error: false,
        replacing: true,
        entering: false,
      };

      // Replace cards (single operation per setState)
      setImageCards((prev) => {
        const index = prev.findIndex((c) => c.originalId === matchedOriginalId);
        if (index === -1) return prev;
        const newCards = [...prev];
        newCards[index] = newImageCard;
        return newCards;
      });

      setWordCards((prev) => {
        const index = prev.findIndex((c) => c.originalId === matchedOriginalId);
        if (index === -1) return prev;
        const newCards = [...prev];
        newCards[index] = newWordCard;
        return newCards;
      });

      // Remove replacing state and add entering animation after old card fades out
      setTimeout(() => {
        requestAnimationFrame(() => {
          setImageCards((prev) => {
            const index = prev.findIndex((c) => c.id === newImageId);
            if (index === -1) return prev;
            const newCards = [...prev];
            newCards[index] = {
              ...newCards[index],
              replacing: false,
              entering: true,
            };
            return newCards;
          });
          setWordCards((prev) => {
            const index = prev.findIndex((c) => c.id === newWordId);
            if (index === -1) return prev;
            const newCards = [...prev];
            newCards[index] = {
              ...newCards[index],
              replacing: false,
              entering: true,
            };
            return newCards;
          });
        });

        // Remove entering class after animation completes
        setTimeout(() => {
          requestAnimationFrame(() => {
            setImageCards((prev) => {
              const index = prev.findIndex((c) => c.id === newImageId);
              if (index === -1) return prev;
              const newCards = [...prev];
              newCards[index] = { ...newCards[index], entering: false };
              return newCards;
            });
            setWordCards((prev) => {
              const index = prev.findIndex((c) => c.id === newWordId);
              if (index === -1) return prev;
              const newCards = [...prev];
              newCards[index] = { ...newCards[index], entering: false };
              return newCards;
            });
          });
        }, 500); // Match animation duration
      }, 300);
    },
    [data, usedItemIds]
  );

  return (
    <div className={styles.gameContainer}>
      {/* White modal card containing game content */}
      {gameState === "idle" && (
        <GameOverlay type="start" title={title} onStart={initializeGame} />
      )}

      {gameState !== "idle" && (
        <>
          <div className={styles.gameContent}>
            <h1
              className={styles.title}
              style={{
                textAlign: "center",
              }}
            >
              {title}
            </h1>

            {/* Game Header - always visible */}
            <Header score={score} timer={timer} />

            {/* Game Board Container with relative positioning for overlay */}
            <div className={styles.gameBoardContainer}>
              {/* Game Over Overlay - shows inside game board */}
              {gameState === "finished" && (
                <GameOverlay
                  type="end"
                  score={score}
                  maxScore={data.length * 50}
                  matchedPairs={matchedPairsCount}
                  isWin={isWin}
                  onStart={initializeGame}
                />
              )}

              {/* Game Board - always visible to show behind overlay */}
              <GameBoard
                imageCards={imageCards}
                wordCards={wordCards}
                selected={selected}
                onCardClick={handleCardClick}
                disabled={gameState === "verifying" || gameState === "finished"}
              />
            </div>
          </div>
          {floatingScores.map((fs) => (
            <div
              key={fs.id}
              className={styles.floatingScore}
              style={{ left: fs.x, top: fs.y }}
              aria-live="polite"
            >
              +{fs.score}
            </div>
          ))}
        </>
      )}

      {/* Floating Scores */}
    </div>
  );
}
