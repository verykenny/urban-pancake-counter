'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import { INK_COLORS } from '@/lib/inkColors';

interface TableSetupProps {
  onStart: (count: number, loreTarget: number) => void;
}

const COUNTS = [2, 3, 4];

export default function TableSetup({ onStart }: TableSetupProps) {
  const [count, setCount] = useState(2);
  const [loreTarget, setLoreTarget] = useState(20);

  function handleLoreTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    if (!Number.isNaN(raw)) setLoreTarget(raw);
  }

  function handleLoreTargetBlur() {
    setLoreTarget((v) => Math.min(200, Math.max(1, v || 1)));
  }

  const preview = INK_COLORS.slice(0, count);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-widest text-clay uppercase">
        Table Mode
      </h1>
      <p className="-mt-4 max-w-xs text-center text-sm text-fg-muted">
        Lay the phone flat in the middle of the table — every player gets their own card and you
        score for everyone.
      </p>

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-widest text-fg-muted">Players</p>
        <div className="flex gap-1 rounded-xl border border-line bg-raised p-1">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              aria-pressed={count === n}
              className={`min-h-[44px] w-16 rounded-lg text-base font-bold tabular-nums transition-all duration-200 ${
                count === n ? 'bg-line text-fg shadow-sm' : 'text-fg-faint hover:text-fg-muted'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-assigned colors/icons — no names */}
      <div className="flex items-center justify-center gap-4">
        {preview.map((ink) => (
          <div key={ink.key} className="flex flex-col items-center gap-1">
            <Avatar avatarName={ink.key} color={ink.hex} size={48} />
            <span className="text-[10px] text-fg-faint">{ink.label}</span>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 text-sm text-fg-muted">
        Lore target
        <input
          type="number"
          min={1}
          max={200}
          value={loreTarget}
          onChange={handleLoreTargetChange}
          onBlur={handleLoreTargetBlur}
          className="w-20 min-h-[44px] rounded-xl border border-line bg-raised px-3 py-2 text-center text-fg focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay/60 transition-all duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {loreTarget === 20 && <span className="text-xs text-fg-faint">(standard)</span>}
      </label>

      <button
        onClick={() => onStart(count, loreTarget)}
        className="rounded-xl bg-clay px-8 py-3 font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong hover:shadow-glow"
      >
        Start game
      </button>
    </main>
  );
}
