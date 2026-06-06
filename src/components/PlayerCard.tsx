"use client";

import { useState } from "react";

interface OtherPlayer {
  id: string;
  name: string;
}

interface PlayerCardProps {
  name: string;
  score: number;
  color: string;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  isOwnCard?: boolean;
  isHost?: boolean;
  canTransferHost?: boolean;
  onTransferHost?: () => void;
  canDelegate?: boolean;
  currentDelegate: string | null;
  delegateName: string | null;
  otherPlayers: OtherPlayer[];
  onDelegate: (delegatePlayerId: string | null) => void;
}

export default function PlayerCard({
  name,
  score,
  color,
  onIncrement,
  onDecrement,
  disabled,
  isOwnCard,
  isHost,
  canTransferHost,
  onTransferHost,
  canDelegate,
  currentDelegate,
  delegateName,
  otherPlayers,
  onDelegate,
}: PlayerCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handlePick(delegateId: string | null) {
    onDelegate(delegateId);
    setPickerOpen(false);
  }

  // Build a translucent glow from the player's color hex
  const colorGlow = `${color}66`; // ~40% opacity

  return (
    <div
      className="relative flex flex-col items-center gap-4 rounded-2xl border border-ink-border bg-ink-dark p-6 overflow-hidden"
      style={{ boxShadow: '0 4px 32px rgba(74,44,138,0.35), inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      {/* Top color accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: color }}
      />

      {/* Name + host badge */}
      <div className="flex items-center gap-2 mt-1">
        <h2 className="text-lg font-semibold text-star-white">{name}</h2>
        {isHost && (
          <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-gold">
            Host
          </span>
        )}
      </div>

      {/* Delegate badge */}
      {delegateName && (
        <span className="rounded-full border border-ink-border bg-purple-900/30 px-3 py-0.5 text-xs text-star-silver">
          Delegated to {delegateName}
        </span>
      )}

      {/* Score */}
      <span
        className="text-7xl font-extrabold tabular-nums"
        style={{ color, textShadow: `0 0 24px ${colorGlow}` }}
      >
        {score}
      </span>

      {/* Score controls */}
      <div className="flex gap-3">
        <button
          onClick={onDecrement}
          disabled={disabled || score === 0}
          className="rounded-xl border border-ink-border bg-ink-mid px-5 py-2.5 text-lg font-bold text-star-silver hover:bg-ink-border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <button
          onClick={onIncrement}
          disabled={disabled}
          className="rounded-xl bg-gold px-5 py-2.5 text-lg font-bold text-ink-deep hover:bg-gold-bright hover:shadow-[0_0_14px_rgba(212,164,42,0.4)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Transfer host */}
      {canTransferHost && (
        <button
          onClick={onTransferHost}
          className="text-xs text-star-dim hover:text-gold underline underline-offset-2 transition-colors duration-200"
        >
          Make host
        </button>
      )}

      {/* Delegate control */}
      {isOwnCard && canDelegate && (
        <div className="relative">
          <button
            onClick={() => setPickerOpen((o) => !o)}
            className="text-xs text-star-dim hover:text-star-silver underline underline-offset-2 transition-colors duration-200"
          >
            {currentDelegate ? `Delegated → ${delegateName}` : 'Delegate control'}
          </button>

          {pickerOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 min-w-max rounded-xl border border-ink-border bg-ink-dark shadow-xl">
              <ul className="py-1">
                {otherPlayers.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handlePick(p.id)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 hover:bg-ink-mid ${
                        currentDelegate === p.id ? 'font-semibold text-gold' : 'text-star-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => handlePick(null)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors duration-150 hover:bg-ink-mid ${
                      !currentDelegate ? 'font-semibold text-star-silver' : 'text-star-dim'
                    }`}
                  >
                    None
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
