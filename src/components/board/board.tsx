import { useEffect, useRef, useState } from "react";
import "./board.scss";
import { Blocks, HardBlocks, MediumBlocks } from "../../models/block";
import { Colors } from "../../models/color";
import { Moves } from "../../enums/move";
import Arrow from "/arrow.svg";
import Score from "../score/score";
import { Modes } from "../../enums/mode";

type Props = {
  isPlaying: boolean;
  gameStart: boolean;
  onTogglePlaying: () => void;
  onRestart: () => void;
  onFinish: (score: number) => void;
  mode: Modes;
};

let width = 12;
let height = 22;
const DROP_TIME = {
  easy: 500,
  medium: 350,
  hard: 200,
};

const MILE_STONE = {
  medium: 15,
  hard: 30,
};

const MEDIUM_BLOCK_FREQUENCY = 5;
const HARD_BLOCK_FREQUENCY = 10;

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
  const [dropTime, setDropTime] = useState(DROP_TIME.easy);
  const blockCount = useRef<number>(0);
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
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowUp":
        handleMove(Moves.TOP);
        break;
      case "ArrowDown":
        handleMove(Moves.BOTTOM);
        break;
      case "ArrowLeft":
        handleMove(Moves.LEFT);
        break;
      case "ArrowRight":
        handleMove(Moves.RIGHT);
        break;
    }
  }

  useEffect(() => {
    if (_.gameStart) {
      // Reset states
      setBoard(getInitialBoard());
      setScore(0);
      setDropTime(DROP_TIME.easy);
      blockCount.current = 0;
    }
  }, [_.gameStart]);

  useEffect(() => {
    blockCount.current++;

    // Decrease droptime
    if (blockCount.current === MILE_STONE.medium) {
      setDropTime(DROP_TIME.medium);
    }

    if (blockCount.current === MILE_STONE.hard) {
      setDropTime(DROP_TIME.hard);
    }

    createNewBlock();
  }, [board]);

  useEffect(() => {
    if (_.isPlaying) {
      dropBlock();
    } else {
      // Stop drop block
      stopDropBlock();
    }

    // Clean up
    return stopDropBlock;
  }, [dropTime, activeBlock, _.isPlaying]);

  function stopDropBlock() {
    clearInterval(intervalTimerId.current);
  }

  /**
   * Drop block
   */
  function dropBlock() {
    stopDropBlock();
    intervalTimerId.current = setInterval(() => {
      let valid = handleMove(Moves.BOTTOM);
      if (!valid) {
        stopDropBlock();

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

          let bonus = newScore <= 1 ? 0 : ((newScore % 10) - 1) * 5;
          setScore((prev) => prev + newScore * 10 + bonus);
        }
      }
    }, dropTime);
  }

  /**
   * Create a new block
   */
  function createNewBlock() {
    let blocks = Blocks;
    let isHardBlock =
      blockCount.current % HARD_BLOCK_FREQUENCY === 0 && _.mode === Modes.HARD;

    if (
      _.mode === Modes.MEDIUM &&
      blockCount.current % MEDIUM_BLOCK_FREQUENCY === 0
    ) {
      blocks = MediumBlocks;
    }

    if (isHardBlock) {
      blocks = HardBlocks;
    }

    let newBlock = [...blocks[Math.floor(Math.random() * blocks.length)]];
    let rotateNum = isHardBlock ? 0 : Math.round(Math.random() * 3);
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
    let prevBlock = [...block.map((row) => [...row])];
    let result = prevBlock;

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
    if (!_.isPlaying) return false;

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
    <div className="board border-2 border-solid border-white rounded-md flex flex-col">
      <Score
        isPlaying={_.isPlaying}
        onTogglePlaying={_.onTogglePlaying}
        onRestart={_.onRestart}
        score={score}
      />
      <div className="board__container basis-[70%] border-b-2 border-solid border-white flex flex-col">
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
      <div className="board__control basis-[20%] relative flex flex-col items-center justify-center min-h-0">
        <button
          className="btn board__btn relative z-10 w-1/4 h-1/3 mb-4"
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
          className="btn board__btn relative z-10 w-1/4 h-1/3"
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
