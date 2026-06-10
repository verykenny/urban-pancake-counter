"use client";

import Avatar from "@/components/Avatar";

interface PlayerCardProps {
  name: string;
  score: number;
  color: string;
  avatarName: string | null;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
  disabled?: boolean;
  isOwnCard?: boolean;
  isHost?: boolean;
  delegateName: string | null;
}

export default function PlayerCard({
  name,
  score,
  color,
  avatarName,
  onIncrement,
  onDecrement,
  className,
  disabled,
  isOwnCard,
  isHost,
  delegateName,
}: PlayerCardProps) {
  const colorGlow = `${color}40`;

  return (
    <div className={`player-card relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card ${className ?? ''}`}>
      {/* Top color accent strip — clipped by the card's rounded corners (overflow-hidden) */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: color }}
      />

      {/* Name + host badge */}
      <div className="flex items-center gap-2 mt-1">
        <Avatar avatarName={avatarName} color={color} size={48} />
        <h2 className="text-lg font-semibold text-fg">{name}</h2>
        {isHost && (
          <span className="rounded-full bg-clay/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-clay">
            Host
          </span>
        )}
      </div>

      {/* Delegate status badge — display only */}
      {delegateName && (
        <span className="rounded-full border border-line bg-glow/30 px-3 py-0.5 text-xs text-fg-muted">
          Delegated to {delegateName}
        </span>
      )}

      {/* Score */}
      <span
        className="text-[length:var(--score-size-hero)] sm:text-7xl font-extrabold tabular-nums leading-none"
        style={{ color, textShadow: `0 0 16px ${colorGlow}` }}
      >
        {score}
      </span>

      {/* Score controls */}
      <div className="flex gap-3">
        <button
          onClick={onDecrement}
          disabled={disabled || score === 0}
          aria-label={`Remove lore for ${name}`}
          className={`flex items-center justify-center rounded-xl border border-line bg-raised font-bold text-fg-muted hover:bg-line transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isOwnCard ? 'h-20 w-28 text-3xl sm:h-16 sm:w-16 sm:text-2xl' : 'h-16 w-16 sm:h-14 sm:w-14 text-2xl'}`}
        >
          −
        </button>
        <button
          onClick={onIncrement}
          disabled={disabled}
          aria-label={`Add lore for ${name}`}
          className={`flex items-center justify-center rounded-xl bg-clay font-bold text-base-deep hover:bg-clay-strong transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isOwnCard ? 'h-20 w-28 text-3xl sm:h-16 sm:w-16 sm:text-2xl' : 'h-16 w-16 sm:h-14 sm:w-14 text-2xl'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
