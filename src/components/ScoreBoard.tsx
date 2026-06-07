"use client";

import PlayerCard from "@/components/PlayerCard";
import MiniPlayerCard from "@/components/MiniPlayerCard";

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  avatarName: string | null;
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
  function canControl(player: Player) {
    return controlMode === 'host'
      ? localPlayerId === hostPlayerId
      : localPlayerId === player.id || delegations[player.id] === localPlayerId;
  }

  function fullCard(player: Player) {
    return (
      <PlayerCard
        key={player.id}
        name={player.name}
        score={player.score}
        color={player.color}
        avatarName={player.avatarName}
        onIncrement={() => onScoreChange(player.id, 1)}
        onDecrement={() => onScoreChange(player.id, -1)}
        disabled={!canControl(player) || locked}
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
  }

  const ownPlayer = players.find((p) => p.id === localPlayerId);
  const otherPlayers = players.filter((p) => p.id !== localPlayerId);

  return (
    <>
      {/* Tablet / desktop — uniform grid */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-6">
        {players.map((player) => fullCard(player))}
      </div>

      {/* Mobile — own card hero + compact others row */}
      <div className="flex flex-col gap-4 sm:hidden">
        {ownPlayer && fullCard(ownPlayer)}
        {otherPlayers.length > 0 && (
          <div className="flex gap-3">
            {otherPlayers.map((player) => (
              <MiniPlayerCard
                key={player.id}
                name={player.name}
                score={player.score}
                color={player.color}
                avatarName={player.avatarName}
                isHost={player.id === hostPlayerId}
                canControl={canControl(player)}
                locked={locked}
                onIncrement={() => onScoreChange(player.id, 1)}
                onDecrement={() => onScoreChange(player.id, -1)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
