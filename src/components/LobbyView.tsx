'use client';

import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface LobbyViewProps {
  gameCode: string;
  players: Player[];
  localPlayerId: string;
  hostPlayerId: string;
  onJoin: (name: string) => void;
  onStart: () => void;
  joining: boolean;
  starting: boolean;
}

export default function LobbyView({
  gameCode,
  players,
  localPlayerId,
  hostPlayerId,
  onJoin,
  onStart,
  joining,
  starting,
}: LobbyViewProps) {
  const [name, setName] = useState('');
  const isInLobby = players.some((p) => p.id === localPlayerId);
  const isHost = localPlayerId === hostPlayerId;
  const canStart = isHost && players.length >= 2;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onJoin(trimmed);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Lorcana Score Tracker</h1>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400">Game code</p>
        <p className="font-mono text-3xl font-bold tracking-widest">{gameCode}</p>
      </div>

      {!isInLobby ? (
        <form onSubmit={handleJoin} className="flex flex-col items-center gap-3">
          <p className="text-gray-500">Enter your name to join the lobby.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              autoFocus
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={joining || !name.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {joining ? 'Joining…' : 'Join'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2 w-64">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-medium flex-1">{p.name}</span>
                {p.id === hostPlayerId && (
                  <span className="text-xs text-gray-400">host</span>
                )}
              </div>
            ))}
            {players.length < 4 && (
              <p className="text-center text-sm text-gray-400">
                Waiting for players… ({players.length}/4)
              </p>
            )}
          </div>

          {isHost ? (
            <button
              onClick={onStart}
              disabled={!canStart || starting}
              className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {starting ? 'Starting…' : 'Start game'}
            </button>
          ) : (
            <p className="text-gray-500">Waiting for host to start the game…</p>
          )}
        </div>
      )}
    </main>
  );
}
