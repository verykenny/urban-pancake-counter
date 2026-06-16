'use client';

import PlayerCard from './PlayerCard';
import { inkLabel } from '@/lib/inkColors';
import type { TablePlayer } from '@/lib/tableMode';

interface TableBoardProps {
  players: TablePlayer[];
  loreTarget: number;
  locked: boolean;
  onScoreChange: (id: string, delta: number) => void;
}

export default function TableBoard({ players, loreTarget, locked, onScoreChange }: TableBoardProps) {
  function cell(player: TablePlayer, rotated: boolean) {
    return (
      <div className={`table-card flex min-h-0 flex-1 p-2 ${rotated ? 'rotate-180' : ''}`}>
        <PlayerCard
          name={inkLabel(player.avatarName)}
          score={player.score}
          pendingDelta={0}
          color={player.color}
          avatarName={player.avatarName}
          onIncrement={() => onScoreChange(player.id, 1)}
          onDecrement={() => onScoreChange(player.id, -1)}
          disabled={locked}
          delegateName={null}
          loreTarget={loreTarget}
          instant
          className="min-h-0 flex-1 justify-center"
        />
      </div>
    );
  }

  // Players sit on up to two sides — the far side (top) is rotated 180°, the near
  // side (bottom) is upright. Each side is an equal vertical band.
  function arrangement() {
    if (players.length === 2) {
      return (
        <>
          {cell(players[0], true)}
          {cell(players[1], false)}
        </>
      );
    }
    if (players.length === 3) {
      return (
        <>
          {cell(players[0], true)}
          <div className="flex min-h-0 flex-1">
            {cell(players[1], false)}
            {cell(players[2], false)}
          </div>
        </>
      );
    }
    // 4 players — two per side
    return (
      <>
        <div className="flex min-h-0 flex-1">
          {cell(players[0], true)}
          {cell(players[1], true)}
        </div>
        <div className="flex min-h-0 flex-1">
          {cell(players[2], false)}
          {cell(players[3], false)}
        </div>
      </>
    );
  }

  return <div className="table-board flex min-h-0 flex-1 flex-col">{arrangement()}</div>;
}
