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
  localPlayerId: string;
  hostPlayerId: string;
  controlMode: 'host' | 'self';
  delegations: Record<string, string | null>;
  onDelegate: (playerId: string, delegatePlayerId: string | null) => void;
}

export default function ScoreBoard({ players, onScoreChange, localPlayerId, hostPlayerId, controlMode, delegations = {}, onDelegate }: ScoreBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {players.map((player) => {
        const canControl =
          controlMode === 'host'
            ? localPlayerId === hostPlayerId
            : localPlayerId === player.id ||
              delegations[player.id] === localPlayerId;
        return (
          <PlayerCard
            key={player.id}
            name={player.name}
            score={player.score}
            onIncrement={() => onScoreChange(player.id, 1)}
            onDecrement={() => onScoreChange(player.id, -1)}
            disabled={!canControl}
            isOwnCard={localPlayerId === player.id}
            canDelegate={controlMode === 'self'}
            currentDelegate={delegations[player.id] ?? null}
            delegateName={players.find((p) => p.id === delegations[player.id])?.name ?? null}
            otherPlayers={players.filter((p) => p.id !== player.id)}
            onDelegate={(delegatePlayerId) => onDelegate(player.id, delegatePlayerId)}
          />
        );
      })}
    </div>
  );
}
