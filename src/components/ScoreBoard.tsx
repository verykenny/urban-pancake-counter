"use client";

import PlayerCard from "@/components/PlayerCard";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface ScoreBoardProps {
  players: Player[];
  onScoreChange: (playerId: string, delta: number) => void;
}

export default function ScoreBoard({ players, onScoreChange }: ScoreBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          name={player.name}
          score={player.score}
          onIncrement={() => onScoreChange(player.id, 1)}
          onDecrement={() => onScoreChange(player.id, -1)}
        />
      ))}
    </div>
  );
}
