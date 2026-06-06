'use client';

import { use, useEffect, useState } from 'react';
import { usePlayerId } from '@/lib/usePlayerId';
import { getPusherClient } from '@/lib/pusherClient';
import LobbyView from '@/components/LobbyView';

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface GameState {
  players: Player[];
  hostPlayerId: string;
  phase: 'lobby' | 'playing';
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playerId = usePlayerId();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/game/${id}`)
      .then((r) => r.json())
      .then((data: GameState) => setGameState(data))
      .catch(() => setError('Failed to load game.'));

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`game-${id}`);

    channel.bind('player-joined', (data: { players: Player[]; hostPlayerId: string }) => {
      setGameState((prev) =>
        prev ? { ...prev, players: data.players, hostPlayerId: data.hostPlayerId } : prev
      );
    });

    channel.bind('game-started', (data: { players: Player[]; phase: 'playing' }) => {
      setGameState((prev) => (prev ? { ...prev, players: data.players, phase: data.phase } : prev));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`game-${id}`);
    };
  }, [id]);

  async function handleJoin(name: string) {
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`/api/game/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, name }),
      });
      if (!res.ok) {
        const { error: err } = (await res.json()) as { error: string };
        setError(err === 'full' ? 'Game is full.' : 'Could not join. Try again.');
        return;
      }
      const data = (await res.json()) as GameState;
      setGameState(data);
    } finally {
      setJoining(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    setError('');
    try {
      const res = await fetch(`/api/game/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      if (!res.ok) setError('Could not start game.');
    } finally {
      setStarting(false);
    }
  }

  if (error && !gameState) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!gameState || !playerId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  if (gameState.phase === 'playing') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-gray-500">Game in progress — scoreboard coming soon.</p>
      </main>
    );
  }

  return (
    <>
      {error && <p className="fixed top-4 left-1/2 -translate-x-1/2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}
      <LobbyView
        gameCode={id}
        players={gameState.players}
        localPlayerId={playerId}
        hostPlayerId={gameState.hostPlayerId}
        onJoin={handleJoin}
        onStart={handleStart}
        joining={joining}
        starting={starting}
      />
    </>
  );
}
