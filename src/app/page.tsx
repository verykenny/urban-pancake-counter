'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-widest text-clay uppercase">
        Lorcana Lore Tracker
      </h1>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="rounded-xl bg-clay px-6 py-3 font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create game
      </button>

      <p className="text-xs text-fg-faint tracking-wider">or join with a code</p>

      <form onSubmit={handleJoin} className="flex w-full max-w-xs flex-col items-center gap-3">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Game code"
            maxLength={6}
            className="w-full min-h-[44px] rounded-xl border border-line bg-raised px-4 py-2.5 uppercase text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay/60 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] rounded-xl border border-clay px-5 py-2.5 font-semibold text-clay hover:bg-clay/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Join
          </button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>

      <div className="flex w-full max-w-xs flex-col items-center gap-2 border-t border-line pt-6">
        <Link
          href="/table"
          className="min-h-[44px] inline-flex items-center rounded-xl border border-clay px-5 py-2.5 font-semibold text-clay hover:bg-clay/10 transition-all duration-200"
        >
          Table mode
        </Link>
        <p className="text-xs text-fg-faint tracking-wider text-center">
          One phone on the table — everyone scores from it
        </p>
      </div>
    </main>
  );
}
