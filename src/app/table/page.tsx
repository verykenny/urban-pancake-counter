'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useWakeLock } from '@/lib/useWakeLock';
import { vibrate } from '@/lib/haptics';
import { inkLabel } from '@/lib/inkColors';
import { buildTablePlayers, type TablePlayer } from '@/lib/tableMode';
import TableSetup from '@/components/TableSetup';
import TableBoard from '@/components/TableBoard';

export default function TablePage() {
  const [phase, setPhase] = useState<'setup' | 'playing'>('setup');
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [loreTarget, setLoreTarget] = useState(20);

  // The winner is derived from the scores — no separate state to keep in sync.
  // Play again zeros the scores, which clears the win automatically.
  const winnerPlayer = players.find((p) => p.score >= loreTarget) ?? null;
  const winnerId = winnerPlayer?.id ?? null;

  // Hold the wake lock only during active play — releases in setup and after a win.
  useWakeLock(phase === 'playing' && !winnerId);

  // Celebrate once on the null → winner transition.
  const prevWinner = useRef<string | null>(null);
  useEffect(() => {
    if (winnerId && !prevWinner.current) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.4 },
          colors: ['#d08458', '#e29a6e', '#ece5db'],
        });
      }
      vibrate([60, 40, 60]);
    }
    prevWinner.current = winnerId;
  }, [winnerId]);

  function handleStart(count: number, target: number) {
    setLoreTarget(target);
    setPlayers(buildTablePlayers(count));
    setPhase('playing');
  }

  function handleScoreChange(id: string, delta: number) {
    if (winnerId) return;
    // Functional update so rapid taps in one batch compose instead of colliding
    // on a stale snapshot.
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, score: Math.min(loreTarget, Math.max(0, p.score + delta)) } : p
      )
    );
    vibrate(10);
  }

  function handlePlayAgain() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  }

  function handleNewGame() {
    setPlayers([]);
    setPhase('setup');
  }

  if (phase === 'setup') {
    return <TableSetup onStart={handleStart} />;
  }

  return (
    <main className="flex min-h-[100dvh] flex-col p-2">
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-[10px] uppercase tracking-widest text-fg-faint">
          First to {loreTarget} lore
        </p>
        <Link
          href="/"
          className="min-h-[44px] inline-flex items-center text-xs text-fg-faint hover:text-clay underline underline-offset-2 transition-colors duration-200"
        >
          Exit
        </Link>
      </div>

      <TableBoard
        players={players}
        loreTarget={loreTarget}
        locked={!!winnerId}
        onScoreChange={handleScoreChange}
      />

      {winnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-deep/70 p-6">
          <div className="relative w-full max-w-md rounded-2xl border border-clay/40 bg-clay-deep px-8 py-8 text-center overflow-hidden shadow-winner">
            <p
              role="status"
              className="font-[family-name:var(--font-display)] text-2xl font-bold text-clay text-shadow-glow-strong"
            >
              {inkLabel(winnerPlayer?.avatarName ?? null)} wins!
            </p>
            <p className="mt-1 text-sm text-fg-muted">Reached {loreTarget} lore</p>

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                onClick={handlePlayAgain}
                className="rounded-xl bg-clay px-6 py-2.5 text-sm font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong hover:shadow-glow"
              >
                Play again
              </button>
              <div className="flex gap-5">
                <button
                  onClick={handleNewGame}
                  className="text-sm text-fg-muted hover:text-fg underline underline-offset-2 transition-colors duration-200"
                >
                  New game
                </button>
                <Link
                  href="/"
                  className="text-sm text-fg-muted hover:text-fg underline underline-offset-2 transition-colors duration-200"
                >
                  Exit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
