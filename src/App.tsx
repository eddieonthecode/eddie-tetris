import { useRef, useState } from "react";
import Board from "./components/board/board";
import Modal from "./components/modal/modal";
import { Modes } from "./enums/mode";

function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showModalStart, setShowModalStart] = useState<boolean>(true);
  const [showModalResult, setShowModalResult] = useState<boolean>(false);
  const [mode, setMode] = useState<Modes>(Modes.EASY);
  const score = useRef<number>(0);

  function handleChangeModes(mode: Modes) {
    setMode(mode);
    setShowModalStart(false);
    setIsPlaying(true);
  }

  function getModeName() {
    switch (mode) {
      case Modes.EASY:
        return "Easy";
      case Modes.MEDIUM:
        return "Medium";
      case Modes.HARD:
        return "Hard";
      default:
        break;
    }

    return "";
  }

  return (
    <main className="app w-screen h-dvh flex flex-col items-center justify-center">
      {showModalStart && (
        <Modal title="Welcome to Eddie Tetris">
          <div className="flex w-full justify-center gap-x-4">
            <button
              className="btn"
              onClick={() => handleChangeModes(Modes.EASY)}
            >
              Easy
            </button>
            <button
              className="btn"
              onClick={() => handleChangeModes(Modes.MEDIUM)}
            >
              Medium
            </button>
            <button
              className="btn"
              onClick={() => handleChangeModes(Modes.HARD)}
            >
              Hard
            </button>
          </div>
        </Modal>
      )}
      {showModalResult && (
        <Modal
          title="Game over"
          okText="Restart"
          onOk={() => {
            setShowModalResult(false);
            setShowModalStart(true);
          }}
        >
          <div className="flex flex-col w-full items-center justify-center">
            <div
              className={
                "rounded-md px-4 py-2 text-white text-lg font-bold mb-4 " +
                getModeName()
              }
            >
              {getModeName()}
            </div>
            <h1 className="text-white text-xl">Your score: {score.current}</h1>
          </div>
        </Modal>
      )}
      <Board
        gameStart={!showModalStart && !showModalResult}
        isPlaying={isPlaying}
        mode={mode}
        onTogglePlaying={() => setIsPlaying((prev) => !prev)}
        onRestart={() => {
          setShowModalStart(true);
          setIsPlaying(false);
        }}
        onFinish={(s) => {
          score.current = s;
          setShowModalResult(true);
          setIsPlaying(false);
        }}
      />
    </main>
  );
}

export default App;
