import { useState, useEffect, useRef, useCallback } from "react";
import useSound from "use-sound";
import { masterItems } from "../../mock/data";
import Header from "./Header";
import GameOverlay from "./GameOverlay";
import GameBoard from "./GameBoard";
import GameNotification from "./GameNotification";
import styles from "./MatchingGame.module.css";

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
 *
 * A fully-featured matching game with emoji-word pairs.
 * Features: timer, score calculation, sound effects, animations, accessibility
 *
 * @param {Object} props - Component props
 * @param {number} props.initialPairs - Number of emoji-word pairs to display (default: 5)
 * @param {number} props.timerLength - Game timer duration in seconds (default: 60)
 */
export default function MatchingGame({ initialPairs = 5, timerLength = 60 }) {
  // State management
  const [deck, setDeck] = useState([]);
  const [emojiCards, setEmojiCards] = useState([]);
  const [wordCards, setWordCards] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(timerLength);
  const [gameState, setGameState] = useState("idle"); // 'idle' | 'playing' | 'verifying' | 'finished'
  const [selected, setSelected] = useState({});
  const [floatingScores, setFloatingScores] = useState([]);
  const [notification, setNotification] = useState(null); // {type: 'success' | 'error', message: string}
  const [matchedPairsCount, setMatchedPairsCount] = useState(0); // Track number of matched pairs

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

  // Shuffle helper function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    // Enable sound on user gesture
    soundEnabledRef.current = true;

    // Select random items
    const shuffledMaster = shuffleArray(masterItems);
    const selectedItems = shuffledMaster.slice(0, initialPairs);
    setDeck(selectedItems);

    // Create emoji cards (shuffled)
    const shuffledEmojis = shuffleArray(
      selectedItems.map((item, idx) => ({
        id: idx,
        originalId: item.id,
        type: "emoji",
        content: item.emoji,
        matched: false,
        error: false,
        replacing: false,
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
      }))
    );

    setEmojiCards(shuffledEmojis);
    setWordCards(shuffledWords);
    setScore(0);
    setTimer(timerLength);
    setSelected({});
    setFloatingScores([]);
    setMatchedPairsCount(0);
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
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialPairs, timerLength]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle card selection
  const handleCardClick = (cardId, type) => {
    if (gameState !== "playing" && gameState !== "verifying") return;
    if (gameState === "verifying") return;

    const card =
      type === "emoji"
        ? emojiCards.find((c) => c.id === cardId)
        : wordCards.find((c) => c.id === cardId);

    if (!card || card.matched) return;

    // Play select sound
    if (selectSfx) {
      playSelect();
    }

    if (type === "emoji") {
      // Toggle emoji selection
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
        // Check for match if emoji is also selected
        if (selected.imageId !== undefined) {
          checkMatch(selected.imageId, cardId);
        }
      }
    }
  };

  // Check if selected cards match
  const checkMatch = (emojiId, wordId) => {
    setGameState("verifying");

    const emojiCard = emojiCards.find((c) => c.id === emojiId);
    const wordCard = wordCards.find((c) => c.id === wordId);

    if (!emojiCard || !wordCard) {
      setGameState("playing");
      return;
    }

    const isMatch = emojiCard.originalId === wordCard.originalId;

    if (isMatch) {
      // Correct match!
      const matchScore = 50 + Math.floor(timer / 2);
      setScore((prev) => prev + matchScore);

      // Increment matched pairs count
      setMatchedPairsCount((prev) => prev + 1);

      // Show success notification
      setNotification({ type: "success", message: "Correct!" });

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
      setEmojiCards((prev) =>
        prev.map((c) => (c.id === emojiId ? { ...c, matched: true } : c))
      );
      setWordCards((prev) =>
        prev.map((c) => (c.id === wordId ? { ...c, matched: true } : c))
      );

      // Clear selection
      setSelected({});

      // Check if game is complete
      const allMatched =
        emojiCards.every((c) => c.id === emojiId || c.matched) &&
        wordCards.every((c) => c.id === wordId || c.matched);

      if (allMatched) {
        setTimeout(() => {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          setGameState("finished");
        }, 600);
      } else {
        // Replace matched cards after brief animation and shuffle positions within columns
        setTimeout(() => {
          replaceMatchedPair(emojiCard.originalId);
          // Shuffle positions within each column
          setEmojiCards((prev) => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          });
          setWordCards((prev) => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          });
        }, 250);
      }

      // Return to playing state immediately
      setTimeout(() => setGameState("playing"), 300);
    } else {
      // Incorrect match
      // Show error notification
      setNotification({ type: "error", message: "Try again!" });

      if (errorSfx) {
        playError();
      }

      // Show error animation
      setEmojiCards((prev) =>
        prev.map((c) => (c.id === emojiId ? { ...c, error: true } : c))
      );
      setWordCards((prev) =>
        prev.map((c) => (c.id === wordId ? { ...c, error: true } : c))
      );

      // Remove error state and selection after showing error
      setTimeout(() => {
        setEmojiCards((prev) =>
          prev.map((c) => (c.id === emojiId ? { ...c, error: false } : c))
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
  const replaceMatchedPair = (matchedOriginalId) => {
    // Find new items not in current deck
    const currentIds = deck.map((item) => item.id);
    const availableItems = masterItems.filter(
      (item) => !currentIds.includes(item.id)
    );

    if (availableItems.length === 0) {
      // No more items to replace with
      return;
    }

    // Pick a random new item
    const newItem =
      availableItems[Math.floor(Math.random() * availableItems.length)];

    // Add to deck
    setDeck((prev) => [
      ...prev.filter((item) => item.id !== matchedOriginalId),
      newItem,
    ]);

    // Create new cards
    const newEmojiId =
      Math.max(...emojiCards.map((c) => c.id), ...wordCards.map((c) => c.id)) +
      1;
    const newWordId = newEmojiId + 1;

    const newEmojiCard = {
      id: newEmojiId,
      originalId: newItem.id,
      type: "emoji",
      content: newItem.emoji,
      matched: false,
      error: false,
      replacing: true,
    };

    const newWordCard = {
      id: newWordId,
      originalId: newItem.id,
      type: "word",
      content: newItem.word,
      matched: false,
      error: false,
      replacing: true,
    };

    // Replace cards
    setEmojiCards((prev) =>
      prev.map((c) => (c.originalId === matchedOriginalId ? newEmojiCard : c))
    );
    setWordCards((prev) =>
      prev.map((c) => (c.originalId === matchedOriginalId ? newWordCard : c))
    );

    // Remove replacing state after animation
    setTimeout(() => {
      setEmojiCards((prev) =>
        prev.map((c) => (c.id === newEmojiId ? { ...c, replacing: false } : c))
      );
      setWordCards((prev) =>
        prev.map((c) => (c.id === newWordId ? { ...c, replacing: false } : c))
      );
    }, 500);
  };

  return (
    <div className={styles.gameContainer}>
      {/* White modal card containing game content */}
      {gameState === "idle" && (
        <GameOverlay type="start" onStart={initializeGame} />
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
              Picture Match Fun!
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
                  matchedPairs={matchedPairsCount}
                  onStart={initializeGame}
                />
              )}

              {/* Game Board - always visible to show behind overlay */}
              <GameBoard
                emojiCards={emojiCards}
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
