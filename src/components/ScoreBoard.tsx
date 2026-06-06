"use client";

import PlayerCard from "@/components/PlayerCard";

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface ScoreBoardProps {
  players: Player[];
  onScoreChange: (playerId: string, delta: number) => void;
  localPlayerId: string;
  hostPlayerId: string;
  controlMode: 'host' | 'self';
  delegations: Record<string, string | null>;
  onDelegate: (playerId: string, delegatePlayerId: string | null) => void;
  onTransferHost: (newHostPlayerId: string) => void;
  locked?: boolean;
}

export default function ScoreBoard({ players, onScoreChange, localPlayerId, hostPlayerId, controlMode, delegations = {}, onDelegate, onTransferHost, locked = false }: ScoreBoardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            color={player.color}
            onIncrement={() => onScoreChange(player.id, 1)}
            onDecrement={() => onScoreChange(player.id, -1)}
            disabled={!canControl || locked}
            isOwnCard={localPlayerId === player.id}
            isHost={player.id === hostPlayerId}
            canTransferHost={localPlayerId === hostPlayerId && player.id !== localPlayerId}
            onTransferHost={() => onTransferHost(player.id)}
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
