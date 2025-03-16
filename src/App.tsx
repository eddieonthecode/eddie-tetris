import { useRef, useState } from "react";
import Board from "./components/board/board";
import Modal from "./components/modal/modal";

function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showModalStart, setShowModalStart] = useState<boolean>(true);
  const [showModalResult, setShowModalResult] = useState<boolean>(false);
  const score = useRef<number>(0);

  return (
    <main className="app w-screen h-dvh flex flex-col items-center justify-center">
      {showModalStart && (
        <Modal
          title="Welcome to Eddie Tetris"
          okText="Start"
          onOk={() => {
            setShowModalStart(false);
            setIsPlaying(true);
          }}
        />
      )}
      {showModalResult && (
        <Modal
          title="Game over"
          okText="Restart"
          onOk={() => {
            setShowModalResult(false);
            setIsPlaying(true);
          }}
        >
          <h1 className="text-white text-xl">Your score: {score.current}</h1>
        </Modal>
      )}
      <Board
        gameStart={!showModalStart && !showModalResult}
        isPlaying={isPlaying}
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
