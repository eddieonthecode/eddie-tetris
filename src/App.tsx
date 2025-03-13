import Board from "./components/board/board";

function App() {
  return (
    <main className="app w-screen h-screen flex flex-col items-center justify-center">
      {/* <h1 className="text-white text-3xl font-bold mb-4">Eddie Tetris</h1> */}
      <Board />
    </main>
  );
}

export default App;
