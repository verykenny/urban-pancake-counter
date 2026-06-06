'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/game', { method: 'POST' });
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
      <h1 className="text-4xl font-bold">Lorcana Score Tracker</h1>
      <p className="text-gray-500">Create a new game or enter a code to join.</p>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Create game
      </button>
      <div className="flex items-center gap-4">
        <hr className="w-24 border-gray-300" />
        <span className="text-sm text-gray-400">or join with a code</span>
        <hr className="w-24 border-gray-300" />
      </div>
      <form onSubmit={handleJoin} className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Game code"
            maxLength={6}
            className="rounded-lg border border-gray-300 px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Join
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
