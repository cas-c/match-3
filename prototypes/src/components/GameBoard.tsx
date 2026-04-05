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
  const [updated, setUpdated] = useState(0);
  const handleDragEnd: DragDropEventHandlers["onDragEnd"] = ({ operation }) => {
    console.log({ operation });

    if (!operation.source || !operation.target) return;
    let newGameBoard = gameBoard;
    // set the source to the target
    const sourceRowCoord = operation.source?.data.identity[0];
    const sourceCellCoord = operation.source?.data.identity[1];
    const sourceNewColor = operation.target?.data.color;
    newGameBoard[sourceRowCoord][sourceCellCoord] = sourceNewColor;

    // set the target to the source
    const targetRowCoord = operation.target?.data.identity[0];
    const targetCellCoord = operation.target?.data.identity[1];
    const targetNewColor = operation.source?.data.color;
    newGameBoard[targetRowCoord][targetCellCoord] = targetNewColor;

    console.log({
      gameBoard,
      newGameBoard,
      sourceRowCoord,
      sourceCellCoord,
      sourceNewColor,
      //
      targetRowCoord,
      targetCellCoord,
      targetNewColor,
    });
    setGameBoard(newGameBoard);
    setUpdated(updated + 1);
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
    </div>
  );
}
