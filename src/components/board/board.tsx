import { useEffect, useRef, useState } from "react";
import "./board.scss";
import { Blocks } from "../../models/block";
import { Colors } from "../../models/color";
import { Moves } from "../../enums/move";

let sizeProportion = "18/30";
let width = 12;
let height = 18;
let dropTime = 500;

const INITIAL_BOARD = Array.from({ length: height }, () =>
  Array(width).fill(null)
);

export default function Board() {
  const [board, setBoard] = useState<string[][]>(INITIAL_BOARD);

  const [activeBlock, setActiveBlock] = useState<number[][]>([]);
  const [color, setColor] = useState<string>();
  const intervalTimerId = useRef<number>(undefined);
  const positionRef = useRef({
    x: 0,
    y: 0,
  });
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
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
    console.log(board);
    createNewBlock();
  }, [board]);

  useEffect(() => {
    dropBlock();
  }, [activeBlock]);

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
          alert("You lose. Press ok to restart !!!");
          setBoard(INITIAL_BOARD);
        } else {
          // Append a block to board
          let newBoard = displayBoardRef.current.filter((row) =>
            row.some((col) => col === null)
          );
          let score = displayBoardRef.current.length - newBoard.length;
          newBoard.unshift(
            ...Array.from({ length: score }, () => Array(width).fill(null))
          );
          console.log(newBoard);
          setBoard(newBoard);
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
      style={{
        aspectRatio: sizeProportion,
        width: `calc(min(calc(100vh * ${sizeProportion} - 10px), 100vw))`,
      }}
    >
      <div className="board__container border-b-2 border-solid border-white flex flex-col">
        {displayBoard.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="board__row flex"
            style={{ flexBasis: `${100 / height}%` }}
          >
            {row.map((col, colIndex) => (
              <div
                key={colIndex}
                className="board__col"
                style={{
                  flexBasis: `${100 / width}%`,
                  backgroundColor: col,
                  border: col ? "2px solid rgba(255, 255, 255, 0.2)" : "none",
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className="board__control flex-1 flex flex-col items-center justify-center">
        <button
          className="board__btn w-1/12 h-1/3 mb-1"
          onClick={() => handleMove(Moves.TOP)}
        >
          ⬆️
        </button>
        <div className="w-1/2 h-1/5 mb-1 flex justify-between">
          <button
            className="board__btn w-1/3 h-full"
            onClick={() => handleMove(Moves.LEFT)}
          >
            ⬅️
          </button>
          <button
            className="board__btn w-1/3 h-full"
            onClick={() => handleMove(Moves.RIGHT)}
          >
            ➡️
          </button>
        </div>
        <button
          className="board__btn w-1/12 h-1/3"
          onClick={() => handleMove(Moves.BOTTOM)}
        >
          ⬇️
        </button>
      </div>
    </div>
  );
}
