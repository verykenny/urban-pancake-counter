"use client";

interface PlayerCardProps {
  name: string;
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function PlayerCard({ name, score, onIncrement, onDecrement }: PlayerCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold">{name}</h2>
      <span className="text-6xl font-bold">{score}</span>
      <div className="flex gap-3">
        <button onClick={onDecrement} className="rounded-lg bg-gray-100 px-4 py-2 text-lg font-bold hover:bg-gray-200">−</button>
        <button onClick={onIncrement} className="rounded-lg bg-indigo-600 px-4 py-2 text-lg font-bold text-white hover:bg-indigo-700">+</button>
      </div>
    </div>
  );
}
