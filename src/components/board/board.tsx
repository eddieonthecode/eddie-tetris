import { useEffect, useRef, useState } from "react";
import "./board.scss";
import { Blocks } from "../../models/block";
import { Colors } from "../../models/color";
import { Moves } from "../../enums/move";
import Arrow from "/arrow.svg";
import Score from "../score/score";

type Props = {
  isPlaying: boolean;
  gameStart: boolean;
  onTogglePlaying: () => void;
  onRestart: () => void;
  onFinish: (score: number) => void;
};

let width = 12;
let height = 18;
let dropTime = 500;

const INITIAL_BOARD = Array.from({ length: height }, () =>
  Array(width).fill(null)
);

const INITIAL_POSITION = {
  x: 0,
  y: 0,
};

function getInitialBoard() {
  return [...INITIAL_BOARD.map((row) => [...row])];
}

export default function Board(_: Props) {
  const [board, setBoard] = useState<string[][]>(getInitialBoard());
  const [activeBlock, setActiveBlock] = useState<number[][]>([]);
  const [color, setColor] = useState<string>();
  const [score, setScore] = useState<number>(0);
  const intervalTimerId = useRef<number>(undefined);
  const positionRef = useRef(INITIAL_POSITION);
  const [position, setPosition] = useState(INITIAL_POSITION);
  let displayBoard = [...board.map((row) => [...row])];
  let displayBoardRef = useRef<string[][]>([]);

  // Draw current active block
  activeBlock.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col && displayBoard[rowIndex + position.y]) {
        displayBoard[rowIndex + position.y][colIndex + position.x] = color!;
      }
    });
  });

  // Update ref
  useEffect(() => {
    positionRef.current = position;
    displayBoardRef.current = displayBoard;
  }, [position]);

  useEffect(() => {
    if (_.gameStart) {
      // Reset states
      setBoard(getInitialBoard());
      setScore(0);
    }
  }, [_.gameStart]);

  useEffect(() => {
    createNewBlock();
  }, [board]);

  useEffect(() => {
    if (_.isPlaying) {
      dropBlock();
    } else {
      // Stop drop block
      clearInterval(intervalTimerId.current);
    }
  }, [activeBlock, _.isPlaying]);

  /**
   * Drop block
   */
  function dropBlock() {
    clearInterval(intervalTimerId.current);
    intervalTimerId.current = setInterval(() => {
      let valid = handleMove(Moves.BOTTOM);
      if (!valid) {
        clearInterval(intervalTimerId.current);

        // Check game lose
        if (positionRef.current.y <= 0) {
          setScore((prev) => {
            _.onFinish(prev);
            return prev;
          });
        } else {
          // Append a block to board
          let newBoard = displayBoardRef.current.filter((row) =>
            row.some((col) => col === null)
          );
          let newScore = displayBoardRef.current.length - newBoard.length;
          newBoard.unshift(
            ...Array.from({ length: newScore }, () => Array(width).fill(null))
          );
          setBoard(newBoard);
          setScore((prev) => prev + newScore * 10);
        }
      }
    }, dropTime);
  }

  /**
   * Create a new block
   */
  function createNewBlock() {
    let newBlock = [...Blocks[Math.floor(Math.random() * Blocks.length)]];
    let rotateNum = Math.round(Math.random() * 3);
    let rotatedBlock = rotateBlock(newBlock, rotateNum);

    setActiveBlock(rotatedBlock);
    setPosition({
      x: Math.floor(width / 2 - rotatedBlock[0].length / 2),
      y: -rotatedBlock.length,
    });
    setColor(Colors[Math.floor(Math.random() * Colors.length)]);
  }

  /**
   * Rotate block
   */
  function rotateBlock(block: number[][], time: number) {
    let prevBlock = [...block];
    let result = [...block];

    for (let i = 0; i < time; i++) {
      let rotatedBlock = Array.from({ length: prevBlock[0].length }, () =>
        Array(prevBlock.length).fill(0)
      );

      prevBlock.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          rotatedBlock[colIndex][prevBlock.length - 1 - rowIndex] = col;
        });
      });

      prevBlock = rotatedBlock;
      result = rotatedBlock;
    }

    return result;
  }

  /**
   * Handle move
   */
  function handleMove(move: Moves): boolean {
    let block = [...activeBlock];
    let newX = positionRef.current.x;
    let newY = positionRef.current.y;
    let calc = false;

    if (move === Moves.TOP) {
      block = rotateBlock(block, 1);
    }

    let valid = block.every((row, rowIndex) => {
      return row.every((col, colIndex) => {
        let y = positionRef.current.y + rowIndex,
          x = positionRef.current.x + colIndex;
        if (!col) return true;

        switch (move) {
          case Moves.LEFT:
            if (!calc) {
              newX--;
              calc = true;
            }

            x--;

            if (x < 0) return false;
            break;
          case Moves.RIGHT:
            if (!calc) {
              newX++;
              calc = true;
            }

            x++;

            if (x >= width) return false;
            break;
          case Moves.BOTTOM:
            if (!calc) {
              newY++;
              calc = true;
            }

            y++;

            if (y >= height) return false;
            break;
          case Moves.TOP:
            if (x < 0 || x >= width || y >= height) return false;
            break;
          default:
            break;
        }

        return !board[y] || !board[y][x];
      });
    });

    // Execute movement if valid
    if (valid) {
      if (move === Moves.TOP) {
        setActiveBlock(block);
      } else {
        setPosition({ x: newX, y: newY });
      }
    }

    return valid;
  }

  return (
    <div
      className="board border-2 border-solid border-white rounded-md flex flex-col"
      style={{}}
    >
      <Score
        isPlaying={_.isPlaying}
        onTogglePlaying={_.onTogglePlaying}
        onRestart={_.onRestart}
        score={score}
      />
      <div className="board__container basis-[62.5%] border-b-2 border-solid border-white flex flex-col">
        {displayBoard.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="board__row flex"
            style={{ flexBasis: `${100 / height}%` }}
          >
            {row.map((col, colIndex) => (
              <div
                key={colIndex}
                className="board__col rounded-sm"
                style={{
                  flexBasis: `${100 / width}%`,
                  backgroundColor: col,
                  border: col ? "1px solid rgba(0, 0, 0, 0.4)" : "none",
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className="board__control basis-[25%] relative flex flex-col items-center justify-center">
        <button
          className="btn board__btn relative z-10 w-1/6 h-1/3 mb-4"
          onClick={() => handleMove(Moves.TOP)}
        >
          <img
            src={Arrow}
            alt="arrow"
            className="w-full h-full object-contain -rotate-90"
          />
        </button>
        <div className="absolute w-2/3 h-3/5 mb-1 flex justify-between">
          <button
            className="btn board__btn w-1/4 h-full"
            onClick={() => handleMove(Moves.LEFT)}
          >
            <img
              src={Arrow}
              alt="arrow"
              className="w-full h-full object-contain rotate-180"
            />
          </button>
          <button
            className="btn board__btn w-1/4 h-full"
            onClick={() => handleMove(Moves.RIGHT)}
          >
            <img
              src={Arrow}
              alt="arrow"
              className="w-full h-full object-contain"
            />
          </button>
        </div>
        <button
          className="btn board__btn relative z-10 w-1/6 h-1/3"
          onClick={() => handleMove(Moves.BOTTOM)}
        >
          <img
            src={Arrow}
            alt="arrow"
            className="w-full h-full object-contain rotate-90"
          />
        </button>
      </div>
    </div>
  );
}
