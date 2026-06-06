'use client';

import { use, useEffect, useState } from 'react';
import { usePlayerId } from '@/lib/usePlayerId';
import { getPusherClient } from '@/lib/pusherClient';
import LobbyView from '@/components/LobbyView';
import ScoreBoard from '@/components/ScoreBoard';

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
  controlMode: 'host' | 'self';
  delegations: Record<string, string | null>;
  winner: string | null;
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
      .then((data: GameState) => setGameState({ ...data, delegations: data.delegations ?? {}, winner: data.winner ?? null }))
      .catch(() => setError('Failed to load game.'));

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`game-${id}`);

    channel.bind('player-joined', (data: { players: Player[]; hostPlayerId: string }) => {
      setGameState((prev) =>
        prev ? { ...prev, players: data.players, hostPlayerId: data.hostPlayerId } : prev
      );
    });

    channel.bind('game-started', (data: { players: Player[]; phase: 'playing'; controlMode: 'host' | 'self' }) => {
      setGameState((prev) =>
        prev ? { ...prev, players: data.players, phase: data.phase, controlMode: data.controlMode } : prev
      );
    });

    channel.bind('mode-changed', (data: { controlMode: 'host' | 'self' }) => {
      setGameState((prev) => (prev ? { ...prev, controlMode: data.controlMode } : prev));
    });

    channel.bind('score-update', (data: { playerId: string; score: number }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === data.playerId ? { ...p, score: data.score } : p
          ),
        };
      });
    });

    channel.bind('delegation-updated', (data: { playerId: string; delegatePlayerId: string | null }) => {
      setGameState((prev) =>
        prev
          ? { ...prev, delegations: { ...prev.delegations, [data.playerId]: data.delegatePlayerId } }
          : prev
      );
    });

    channel.bind('game-won', (data: { winnerId: string }) => {
      setGameState((prev) => (prev ? { ...prev, winner: data.winnerId } : prev));
    });

    channel.bind('game-reset', (data: { players: Player[] }) => {
      setGameState((prev) => (prev ? { ...prev, winner: null, players: data.players } : prev));
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

  async function handleStart(controlMode: 'host' | 'self') {
    setStarting(true);
    setError('');
    try {
      const res = await fetch(`/api/game/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, controlMode }),
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

  async function handleModeChange(mode: 'host' | 'self') {
    const res = await fetch(`/api/game/${id}/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, controlMode: mode }),
    });
    if (!res.ok) setError('Could not update control mode.');
  }

  async function handleScoreChange(targetPlayerId: string, delta: number) {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: id, playerId: targetPlayerId, requestingPlayerId: playerId, delta }),
    });
    if (!res.ok) setError('Score update failed.');
  }

  async function handlePlayAgain() {
    const res = await fetch(`/api/game/${id}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!res.ok) setError('Could not reset game.');
  }

  async function handleDelegate(playerId: string, delegatePlayerId: string | null) {
    const res = await fetch(`/api/game/${id}/delegation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, delegatePlayerId }),
    });
    if (!res.ok) setError('Could not update delegation.');
  }

  if (gameState.phase === 'playing') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-3xl font-bold">Lorcana Score Tracker</h1>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Game code</p>
          <p className="font-mono text-3xl font-bold tracking-widest">{id}</p>
        </div>
        {playerId === gameState.hostPlayerId && (
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => handleModeChange('self')}
              className={`rounded-lg px-4 py-1.5 font-medium transition-colors ${gameState.controlMode === 'self' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Players control own
            </button>
            <button
              onClick={() => handleModeChange('host')}
              className={`rounded-lg px-4 py-1.5 font-medium transition-colors ${gameState.controlMode === 'host' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Host controls all
            </button>
          </div>
        )}
        {gameState.winner && (
          <div className="w-full max-w-md rounded-2xl border border-amber-300 bg-amber-50 px-8 py-6 text-center shadow-lg">
            <p className="text-lg font-semibold text-amber-800">
              {gameState.players.find((p) => p.id === gameState.winner)?.name ?? 'Someone'} wins!
            </p>
            <p className="mt-1 text-sm text-amber-600">Reached 20 lore</p>
            {playerId === gameState.hostPlayerId ? (
              <button
                onClick={handlePlayAgain}
                className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Play Again
              </button>
            ) : (
              <p className="mt-4 text-sm text-amber-700">Waiting for host to start a new game…</p>
            )}
          </div>
        )}
        <ScoreBoard
          players={gameState.players}
          onScoreChange={handleScoreChange}
          localPlayerId={playerId}
          hostPlayerId={gameState.hostPlayerId}
          controlMode={gameState.controlMode}
          delegations={gameState.delegations}
          onDelegate={handleDelegate}
          locked={!!gameState.winner}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
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
