'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerId } from '@/lib/usePlayerId';

export default function Home() {
  const router = useRouter();
  const playerId = usePlayerId();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const { code } = (await res.json()) as { code: string };
      router.push(`/game/${code}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError('Enter a valid 6-character game code.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch(`/api/game/${code}`);
    if (res.ok) {
      router.push(`/game/${code}`);
    } else {
      setError('Game not found. Check the code and try again.');
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-ambient/12 blur-3xl" />
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-widest text-gold uppercase z-10 text-shadow-glow">
        Lorcana Lore Tracker
      </h1>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="z-10 rounded-xl bg-gold px-6 py-3 font-bold text-ink-deep transition-all duration-200 hover:bg-gold-bright hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create game
      </button>

      <p className="z-10 text-xs text-star-dim tracking-wider">or join with a code</p>

      <form onSubmit={handleJoin} className="z-10 flex w-full max-w-xs flex-col items-center gap-3">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Game code"
            maxLength={6}
            className="w-full min-h-[44px] rounded-xl border border-ink-border bg-ink-mid px-4 py-2.5 uppercase text-star-white placeholder:text-star-dim focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-xl border border-gold px-5 py-2.5 font-semibold text-gold hover:bg-gold/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </form>
    </main>
  );
}
