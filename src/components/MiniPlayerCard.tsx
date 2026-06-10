"use client";

import Avatar from "@/components/Avatar";
import { useScoreReveal } from "@/lib/useScoreReveal";

interface MiniPlayerCardProps {
  name: string;
  score: number;
  pendingDelta: number;
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
  pendingDelta,
  color,
  avatarName,
  isHost,
  canControl,
  locked,
  onIncrement,
  onDecrement,
}: MiniPlayerCardProps) {
  const colorGlow = `${color}40`;
  const { displayedScore, badge, popKey } = useScoreReveal(score, pendingDelta);

  return (
    <div className="opponent-card relative flex flex-1 min-w-0 snap-center flex-col items-center justify-center gap-1 rounded-xl border border-line bg-surface p-3 overflow-hidden">
      {/* Top color accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: color }}
      />

      <Avatar avatarName={avatarName} color={color} size={28} />

      <span className="max-w-full truncate text-xs font-medium text-fg-muted">{name}</span>

      {isHost && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-clay">Host</span>
      )}

      <div className="flex h-5 items-center">
        {badge && (
          <span
            className={`rounded-full border border-line bg-raised px-2 py-px text-xs font-bold tabular-nums ${badge.merging ? 'motion-safe:animate-delta-merge' : ''}`}
            style={{ color }}
          >
            {badge.value > 0 ? `+${badge.value}` : badge.value}
          </span>
        )}
      </div>

      <span
        key={popKey}
        className={`text-[length:var(--score-size-mini)] font-extrabold tabular-nums leading-none ${popKey > 0 ? 'motion-safe:animate-score-pop' : ''}`}
        style={{ color, textShadow: `0 0 12px ${colorGlow}` }}
      >
        {displayedScore}
      </span>

      {canControl && (
        <div className="flex gap-1.5">
          <button
            onClick={onDecrement}
            disabled={locked || score + pendingDelta <= 0}
            aria-label={`Remove lore for ${name}`}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-raised text-lg font-bold text-fg-muted hover:bg-line transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <button
            onClick={onIncrement}
            disabled={locked}
            aria-label={`Add lore for ${name}`}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-clay text-lg font-bold text-base-deep hover:bg-clay-strong transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
