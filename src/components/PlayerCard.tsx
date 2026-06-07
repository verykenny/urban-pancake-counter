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
  const colorGlow = `${color}66`;

  return (
    <div className={`player-card relative flex flex-col items-center gap-4 rounded-2xl border border-ink-border bg-ink-dark p-6 shadow-card ${className ?? ''}`}>
      {/* Top color accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: color }}
      />

      {/* Name + host badge */}
      <div className="flex items-center gap-2 mt-1">
        <Avatar avatarName={avatarName} color={color} size={48} />
        <h2 className="text-lg font-semibold text-star-white">{name}</h2>
        {isHost && (
          <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-gold">
            Host
          </span>
        )}
      </div>

      {/* Delegate status badge — display only */}
      {delegateName && (
        <span className="rounded-full border border-ink-border bg-ambient/30 px-3 py-0.5 text-xs text-star-silver">
          Delegated to {delegateName}
        </span>
      )}

      {/* Score */}
      <span
        className="text-[length:var(--score-size-hero)] sm:text-7xl font-extrabold tabular-nums leading-none"
        style={{ color, textShadow: `0 0 24px ${colorGlow}` }}
      >
        {score}
      </span>

      {/* Score controls */}
      <div className="flex gap-3">
        <button
          onClick={onDecrement}
          disabled={disabled || score === 0}
          className={`flex items-center justify-center rounded-xl border border-ink-border bg-ink-mid font-bold text-star-silver hover:bg-ink-border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isOwnCard ? 'h-20 w-28 text-3xl sm:h-16 sm:w-16 sm:text-2xl' : 'h-16 w-16 sm:h-14 sm:w-14 text-2xl'}`}
        >
          −
        </button>
        <button
          onClick={onIncrement}
          disabled={disabled}
          className={`flex items-center justify-center rounded-xl bg-gold font-bold text-ink-deep hover:bg-gold-bright hover:shadow-glow transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isOwnCard ? 'h-20 w-28 text-3xl sm:h-16 sm:w-16 sm:text-2xl' : 'h-16 w-16 sm:h-14 sm:w-14 text-2xl'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
