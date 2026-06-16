'use client';

import type { CSSProperties } from 'react';
import PlayerCard from './PlayerCard';
import MiniPlayerCard from './MiniPlayerCard';
import { inkLabel } from '@/lib/inkColors';
import type { TablePlayer } from '@/lib/tableMode';

// Each two-up cell is its own query container, so the mini score scales to the
// cell (cqi) rather than the viewport (vw) — in a half-width band a vw-relative
// score reads oversized. Set inline because the build's CSS pipeline strips
// container-query units from the global stylesheet. The custom-property key
// needs the cast TS doesn't model on CSSProperties.
const miniCellStyle = {
  containerType: 'inline-size',
  '--score-size-mini': 'clamp(2rem, 26cqi, 3.5rem)',
} as CSSProperties;

interface TableBoardProps {
  players: TablePlayer[];
  loreTarget: number;
  locked: boolean;
  onScoreChange: (id: string, delta: number) => void;
}

export default function TableBoard({ players, loreTarget, locked, onScoreChange }: TableBoardProps) {
  // A card that owns its whole band runs full-width as the hero PlayerCard. Two
  // cards sharing a band can't fit two heroes across a phone, so they drop to the
  // compact MiniPlayerCard (which carries min-w-0 and sub-44px-safe controls).
  function heroCell(player: TablePlayer, rotated: boolean) {
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

  function miniCell(player: TablePlayer, rotated: boolean) {
    return (
      <div
        style={miniCellStyle}
        className={`table-card flex min-h-0 min-w-0 flex-1 p-2 ${rotated ? 'rotate-180' : ''}`}
      >
        <MiniPlayerCard
          name={inkLabel(player.avatarName)}
          score={player.score}
          pendingDelta={0}
          color={player.color}
          avatarName={player.avatarName}
          canControl
          locked={locked}
          onIncrement={() => onScoreChange(player.id, 1)}
          onDecrement={() => onScoreChange(player.id, -1)}
          loreTarget={loreTarget}
          instant
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
          {heroCell(players[0], true)}
          {heroCell(players[1], false)}
        </>
      );
    }
    if (players.length === 3) {
      return (
        <>
          {heroCell(players[0], true)}
          <div className="flex min-h-0 flex-1">
            {miniCell(players[1], false)}
            {miniCell(players[2], false)}
          </div>
        </>
      );
    }
    // 4 players — two per side
    return (
      <>
        <div className="flex min-h-0 flex-1">
          {miniCell(players[0], true)}
          {miniCell(players[1], true)}
        </div>
        <div className="flex min-h-0 flex-1">
          {miniCell(players[2], false)}
          {miniCell(players[3], false)}
        </div>
      </>
    );
  }

  return <div className="table-board flex min-h-0 flex-1 flex-col">{arrangement()}</div>;
}
