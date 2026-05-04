"use client";

import {
  DragDropEventHandlers,
  DragDropProvider,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import clsx from "clsx";
import { useEffect, useState } from "react";

const initialGameBoard = [
  // each index item is a row
  [
    // each item in the row is a cell
    "red",
    "blue",
    "green",
  ],
  ["blue", "red", "green"],
  ["green", "blue", "red"],
];

const findMatches = (
  origin: number[],
  gameBoard: string[][],
  originColor: string,
  direction: "horizontal" | "vertical",
) => {
  // ex. start at 2,2 in a 3,3 -- we need to check: 1,2 & 2,1 & 2,3 & 3,2
  const numberOfRows = gameBoard.length;
  const numberOfColumns = gameBoard[0].length;
  // cells to clear

  const x = origin[0];
  const y = origin[1];

  if (direction === "vertical") {
    const verticalMatches: number[][] = [];
    // check upward if we aren't at the top
    if (x > 0) {
      let upX = x - 1;
      while (upX >= 0) {
        const checking = gameBoard[upX][y];
        if (checking === originColor) {
          verticalMatches.push([upX, y]);
          upX--;
        } else {
          break;
        }
      }
    }
    // check down if we aren't at the bottom
    if (x < numberOfRows) {
      let downX = x + 1;
      while (downX < numberOfRows) {
        const checking = gameBoard[downX][y];
        if (checking === originColor) {
          verticalMatches.push([downX, y]);
          downX++;
        } else {
          break;
        }
      }
    }
    return [origin, ...verticalMatches];
  } else {
    const horizontalMatches: number[][] = [];

    // check left if we aren't at the left
    if (y > 0) {
      let upY = y - 1;
      while (upY >= 0) {
        const checking = gameBoard[x][upY];
        if (checking === originColor) {
          horizontalMatches.push([x, upY]);
          upY--;
        } else {
          break;
        }
      }
    }

    // check right if we aren't at the right
    if (y < numberOfColumns - 1) {
      let rightY = y + 1;
      while (rightY < numberOfColumns) {
        const checking = gameBoard[x][rightY];
        if (checking === originColor) {
          horizontalMatches.push([x, rightY]);
          rightY++;
        } else {
          break;
        }
      }
    }

    return [origin, ...horizontalMatches];
  }
};

const calculateAcceptable = (coordinates: number[], identity: number[]) => {
  // same row
  if (coordinates[0] === identity[0]) {
    // adjacent cell horizontally
    if (
      coordinates[1] === identity[1] + 1 ||
      coordinates[1] === identity[1] - 1
    ) {
      return true;
    }
  }

  // row above or below
  if (
    coordinates[0] === identity[0] + 1 ||
    coordinates[0] === identity[0] - 1
  ) {
    // same horizontal index
    if (coordinates[1] === identity[1]) {
      return true;
    }
  }

  return false;
};

function Cell({
  color = "black",
  identity,
}: {
  color: string;
  identity: number[];
}) {
  const { ref: draggableRef, isDragging } = useDraggable({
    id: `${identity[0]},${identity[1]}-drag`,
    data: {
      identity,
      color,
    },
  });

  const { isDropTarget, ref: droppableRef } = useDroppable({
    id: `${identity[0]},${identity[1]}-drop`,
    accept: (source) => {
      const coordinates = source.data.identity as number[];
      return calculateAcceptable(coordinates, identity);
    },
    data: {
      identity,
      color,
    },
  });

  return (
    <div ref={droppableRef}>
      <div
        ref={draggableRef}
        className={clsx(
          "w-25 h-25",
          "border-2",
          `bg-${color}-500`,
          // "bg-red-500",
          // "bg-blue-500",
          // "bg-green-500",
          isDragging && "opacity-50",
        )}
      >
        <div className="my-auto mx-auto select-none">
          {isDragging ? "dragging" : isDropTarget ? "dropping here" : color}
        </div>
      </div>
    </div>
  );
}

export function GameBoard() {
  const [gameBoard, setGameBoard] =
    useState<typeof initialGameBoard>(initialGameBoard);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const handleDragEnd: DragDropEventHandlers["onDragEnd"] = ({ operation }) => {
    if (!operation.source || !operation.target) return;

    const sourceOriginalColor = operation.source?.data.color;
    const targetOriginalColor = operation.target?.data.color;
    const targetNewColor = sourceOriginalColor;
    const sourceNewColor = targetOriginalColor;

    const newGameBoard = gameBoard.map((row) => [...row]);

    // set the source to the target
    const sourceRowCoord = operation.source?.data.identity[0];
    const sourceCellCoord = operation.source?.data.identity[1];

    // set the target to the source
    const targetRowCoord = operation.target?.data.identity[0];
    const targetCellCoord = operation.target?.data.identity[1];

    newGameBoard[sourceRowCoord][sourceCellCoord] = sourceNewColor;
    newGameBoard[targetRowCoord][targetCellCoord] = targetNewColor;

    const verticalMatchesForTarget = findMatches(
      [targetRowCoord, targetCellCoord],
      newGameBoard,
      targetNewColor,
      "vertical",
    );
    const horizontalMatchesForTarget = findMatches(
      [targetRowCoord, targetCellCoord],
      newGameBoard,
      targetNewColor,
      "horizontal",
    );

    const verticalMatchesForSource = findMatches(
      [sourceRowCoord, sourceCellCoord],
      newGameBoard,
      sourceNewColor,
      "vertical",
    );

    const horizontalMatchesForSource = findMatches(
      [sourceRowCoord, sourceCellCoord],
      newGameBoard,
      sourceNewColor,
      "horizontal",
    );

    if (
      horizontalMatchesForSource.length < 3 &&
      verticalMatchesForSource.length < 3 &&
      horizontalMatchesForTarget.length < 3 &&
      verticalMatchesForTarget.length < 3
    ) {
      return;
    }

    setGameBoard(newGameBoard);

    const clearAndFillAndCheckAgain = (
      cellsForClearing: number[][],
      boardToClear: string[][],
    ) => {
      const clearedBoard = boardToClear.map((row) => [...row]);
      cellsForClearing.forEach((cell) => {
        clearedBoard[cell[0]][cell[1]] = "black";
      });

      setUserPoints((p) => p + cellsForClearing.length);
      setGameBoard(clearedBoard);

      setTimeout(() => {
        const filledBoard = clearedBoard.map((row) => [...row]);
        cellsForClearing.forEach((cell) => {
          const randomSeed = Math.floor(Math.random() * 10);
          filledBoard[cell[0]][cell[1]] =
            randomSeed % 2 ? (randomSeed > 5 ? "red" : "green") : "blue";
        });

        setGameBoard(filledBoard);

        const newCellsToClear: number[][] = [];
        cellsForClearing.forEach((cell) => {
          const newMatchesH = findMatches(
            [cell[0], cell[1]],
            filledBoard,
            filledBoard[cell[0]][cell[1]],
            "horizontal",
          );

          const newMatchesV = findMatches(
            [cell[0], cell[1]],
            filledBoard,
            filledBoard[cell[0]][cell[1]],
            "vertical",
          );

          if (newMatchesH.length > 2) {
            newCellsToClear.push(
              ...newMatchesH.filter(
                (h) =>
                  !newCellsToClear.find(
                    (h2) => h[0] === h2[0] && h[1] === h2[1],
                  ),
              ),
            );
          }
          if (newMatchesV.length > 2) {
            newCellsToClear.push(
              ...newMatchesV.filter(
                (v) =>
                  !newCellsToClear.find(
                    (v2) => v[0] === v2[0] && v[1] === v2[1],
                  ),
              ),
            );
          }

          if (newMatchesH.length < 3 && newMatchesV.length < 3) {
            console.log("287: no new matches found");
            return;
          } else {
            console.log(
              "found new matches.  i guess we should do something about it?",
              {
                newMatchesH,
                newMatchesV,
                newCellsToClear,
              },
            );

            setTimeout(() => {
              clearAndFillAndCheckAgain(newCellsToClear, filledBoard);
            }, 1000);
          }
        });
      }, 1000);
    };

    setTimeout(() => {
      let cellsToClear = [];
      if (horizontalMatchesForSource.length > 2) {
        console.log("horizontalMatchesForSource", horizontalMatchesForSource);
        cellsToClear.push(...horizontalMatchesForSource);
      }
      if (verticalMatchesForSource.length > 2) {
        console.log("verticalMatchesForSource", verticalMatchesForSource);
        cellsToClear.push(...verticalMatchesForSource);
      }
      if (horizontalMatchesForTarget.length > 2) {
        console.log("horizontalMatchesForTarget", horizontalMatchesForTarget);
        cellsToClear.push(...horizontalMatchesForTarget);
      }
      if (verticalMatchesForTarget.length > 2) {
        console.log("verticalMatchesForTarget", verticalMatchesForTarget);
        cellsToClear.push(...verticalMatchesForTarget);
      }

      clearAndFillAndCheckAgain(cellsToClear, newGameBoard);
    }, 1000);
  };

  return (
    <div className="w-75 h-75 bg-white min-h-full min-w-full">
      <DragDropProvider onDragEnd={handleDragEnd}>
        {gameBoard.map((row, rowIndex) => {
          return (
            <div className="flex flex-row" key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <Cell
                  key={`row-${rowIndex}-cell-${cellIndex}-${cell}`}
                  color={cell}
                  identity={[rowIndex, cellIndex]}
                />
              ))}
            </div>
          );
        })}
      </DragDropProvider>
      <div>
        <span>points: {userPoints}</span>
      </div>
    </div>
  );
}
