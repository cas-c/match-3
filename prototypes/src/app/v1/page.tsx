import { GameBoard } from "@/components/GameBoard";

export default function v1() {
  return (
    <div className="min-w-screen min-h-screen dark:bg-purple-800/50 flex">
      <div className="self-center mx-auto">
        <GameBoard />
      </div>
    </div>
  );
}
