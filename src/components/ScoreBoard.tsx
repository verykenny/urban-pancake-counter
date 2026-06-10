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
  pendingDeltas: Record<string, number>;
  onScoreChange: (playerId: string, delta: number) => void;
  localPlayerId: string;
  hostPlayerId: string;
  controlMode: 'host' | 'self';
  delegations: Record<string, string | null>;
  locked?: boolean;
  loreTarget: number;
}

export default function ScoreBoard({ players, pendingDeltas, onScoreChange, localPlayerId, hostPlayerId, controlMode, delegations = {}, locked = false, loreTarget }: ScoreBoardProps) {
  function canControl(player: Player) {
    return controlMode === 'host'
      ? localPlayerId === hostPlayerId
      : localPlayerId === player.id || delegations[player.id] === localPlayerId;
  }

  function fullCard(player: Player, extraClass = '') {
    return (
      <PlayerCard
        key={player.id}
        className={extraClass}
        name={player.name}
        score={player.score}
        pendingDelta={pendingDeltas[player.id] ?? 0}
        color={player.color}
        avatarName={player.avatarName}
        onIncrement={() => onScoreChange(player.id, 1)}
        onDecrement={() => onScoreChange(player.id, -1)}
        disabled={!canControl(player) || locked}
        isOwnCard={localPlayerId === player.id}
        isHost={player.id === hostPlayerId}
        delegateName={players.find((p) => p.id === delegations[player.id])?.name ?? null}
        loreTarget={loreTarget}
      />
    );
  }

  const ownPlayer = players.find((p) => p.id === localPlayerId);
  const otherPlayers = players.filter((p) => p.id !== localPlayerId);

  const opponentCards = otherPlayers.map((player) => (
    <MiniPlayerCard
      key={player.id}
      name={player.name}
      score={player.score}
      pendingDelta={pendingDeltas[player.id] ?? 0}
      color={player.color}
      avatarName={player.avatarName}
      isHost={player.id === hostPlayerId}
      canControl={canControl(player)}
      locked={locked}
      onIncrement={() => onScoreChange(player.id, 1)}
      onDecrement={() => onScoreChange(player.id, -1)}
      loreTarget={loreTarget}
    />
  ));

  return (
    <div className="score-board flex flex-1 flex-col">
      {/* Tablet / desktop (and narrow landscape via globals.css) — uniform grid */}
      <div className="score-grid hidden sm:grid sm:grid-cols-2 gap-6">
        {players.map((player) => fullCard(player))}
      </div>

      {/* Mobile portrait — own card hero (~60%) + opponents row (~40%) */}
      {ownPlayer ? (
        <div className="score-stack flex flex-1 flex-col gap-4 sm:hidden">
          {/* flex-1 (not h-full): the height chain above is indefinite
              (min-h-[100dvh] + flex-1), so percentage heights collapse */}
          <div className="score-panel flex flex-col min-h-0 flex-[3]">
            {fullCard(ownPlayer, 'min-h-0 flex-1 justify-center')}
          </div>
          {opponentCards.length > 0 && (
            <div className="opponents-row flex min-h-0 flex-[2] gap-3 overflow-x-auto snap-x snap-mandatory">
              {opponentCards}
            </div>
          )}
        </div>
      ) : (
        /* Local player not yet in players[] (stale mid-join) — uniform grid fallback */
        <div className="score-stack grid grid-cols-1 gap-4 sm:hidden">
          {players.map((player) => fullCard(player))}
        </div>
      )}
    </div>
  );
}
