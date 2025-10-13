import MatchingGame from "./components/MatchingGame/MatchingGame";
import "./App.css";

function App() {
  return <MatchingGame initialPairs={5} timerLength={60} />;
}

export default App;
