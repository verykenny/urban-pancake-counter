"use client";

import Avatar from "@/components/Avatar";

interface MiniPlayerCardProps {
  name: string;
  score: number;
  color: string;
  avatarName: string | null;
  isHost?: boolean;
  canControl?: boolean;
  locked?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function MiniPlayerCard({
  name,
  score,
  color,
  avatarName,
  isHost,
  canControl,
  locked,
  onIncrement,
  onDecrement,
}: MiniPlayerCardProps) {
  const colorGlow = `${color}66`;

  return (
    <div className="opponent-card relative flex flex-1 min-w-0 flex-col items-center gap-1 rounded-xl border border-ink-border bg-ink-dark p-3 overflow-hidden">
      {/* Top color accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: color }}
      />

      <Avatar avatarName={avatarName} color={color} size={28} />

      <span className="max-w-full truncate text-xs font-medium text-star-silver">{name}</span>

      {isHost && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Host</span>
      )}

      <span
        className="text-3xl font-extrabold tabular-nums"
        style={{ color, textShadow: `0 0 12px ${colorGlow}` }}
      >
        {score}
      </span>

      {canControl && (
        <div className="flex gap-1.5">
          <button
            onClick={onDecrement}
            disabled={locked || score === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-border bg-ink-mid text-lg font-bold text-star-silver hover:bg-ink-border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <button
            onClick={onIncrement}
            disabled={locked}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-lg font-bold text-ink-deep hover:bg-gold-bright transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
