'use client';

import { use, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { usePlayerId } from '@/lib/usePlayerId';
import { getPusherClient } from '@/lib/pusherClient';
import LobbyView from '@/components/LobbyView';
import ScoreBoard from '@/components/ScoreBoard';
import GameCode from '@/components/GameCode';

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
  loreTarget: number;
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playerId = usePlayerId();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [connectionState, setConnectionState] = useState('connected');
  const prevConn = useRef('connected');
  const prevWinner = useRef<string | null>(null);

  const winner = gameState?.winner ?? null;
  useEffect(() => {
    if (winner && !prevWinner.current) {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#d4a42a', '#f0c040', '#ede8ff'],
      });
    }
    prevWinner.current = winner;
  }, [winner]);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/game/${id}`)
      .then((r) => {
        if (!r.ok) {
          setError("This game has expired or doesn't exist.");
          return null;
        }
        return r.json();
      })
      .then((data: GameState | null) => {
        if (data) setGameState({ ...data, delegations: data.delegations ?? {}, winner: data.winner ?? null, loreTarget: data.loreTarget ?? 20 });
      })
      .catch(() => setError('Failed to load game.'));

    const pusher = getPusherClient();
    prevConn.current = pusher.connection.state;

    const handleConnState = (s: { previous: string; current: string }) => {
      setConnectionState(s.current);
      const wasDown = ['unavailable', 'disconnected', 'connecting'].includes(prevConn.current);
      if (s.current === 'connected' && wasDown) {
        fetch(`/api/game/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data: GameState | null) => {
            if (data) setGameState({ ...data, delegations: data.delegations ?? {}, winner: data.winner ?? null, loreTarget: data.loreTarget ?? 20 });
          })
          .catch(() => {});
      }
      prevConn.current = s.current;
    };
    pusher.connection.bind('state_change', handleConnState);

    const channel = pusher.subscribe(`game-${id}`);

    channel.bind('player-joined', (data: { players: Player[]; hostPlayerId: string }) => {
      setGameState((prev) =>
        prev ? { ...prev, players: data.players, hostPlayerId: data.hostPlayerId } : prev
      );
    });

    channel.bind('game-started', (data: { players: Player[]; phase: 'playing'; controlMode: 'host' | 'self'; loreTarget: number }) => {
      setGameState((prev) =>
        prev ? { ...prev, players: data.players, phase: data.phase, controlMode: data.controlMode, loreTarget: data.loreTarget ?? prev.loreTarget } : prev
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

    channel.bind('host-transferred', (data: { hostPlayerId: string }) => {
      setGameState((prev) => (prev ? { ...prev, hostPlayerId: data.hostPlayerId } : prev));
    });

    return () => {
      pusher.connection.unbind('state_change', handleConnState);
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

  async function handleStart(controlMode: 'host' | 'self', loreTarget: number) {
    setStarting(true);
    setError('');
    try {
      const res = await fetch(`/api/game/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, controlMode, loreTarget }),
      });
      if (!res.ok) setError('Could not start game.');
    } finally {
      setStarting(false);
    }
  }

  if (error && !gameState) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-error">{error}</p>
      </main>
    );
  }

  if (!gameState || !playerId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-star-dim animate-pulse">Loading…</p>
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

  async function handleTransferHost(newHostPlayerId: string) {
    const res = await fetch(`/api/game/${id}/host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, newHostPlayerId }),
    });
    if (!res.ok) setError('Could not transfer host.');
  }

  async function handleDelegate(targetPlayerId: string, delegatePlayerId: string | null) {
    const res = await fetch(`/api/game/${id}/delegation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: targetPlayerId, delegatePlayerId }),
    });
    if (!res.ok) setError('Could not update delegation.');
  }

  const reconnecting = connectionState === 'unavailable' || connectionState === 'disconnected';
  const reconnectingBanner = reconnecting ? (
    <p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-ink-border bg-ink-dark px-4 py-2 text-sm text-star-silver animate-pulse">
      Reconnecting…
    </p>
  ) : null;

  if (gameState.phase === 'playing') {
    const winnerPlayer = gameState.players.find((p) => p.id === gameState.winner);

    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-purple-900/20 blur-3xl" />
        </div>

        <h1
          className="z-10 font-[family-name:var(--font-display)] text-3xl font-bold tracking-widest text-gold uppercase"
          style={{ textShadow: '0 0 24px rgba(212,164,42,0.45)' }}
        >
          Lorcana Lore Tracker
        </h1>

        {/* Game code */}
        <GameCode code={id} />
        <p className="z-10 -mt-4 text-xs uppercase tracking-widest text-star-dim">
          First to {gameState.loreTarget} lore
        </p>

        {/* Control mode toggle (host only) */}
        {playerId === gameState.hostPlayerId && (
          <div className="z-10 flex flex-col sm:flex-row bg-ink-mid rounded-xl p-1 gap-1 border border-ink-border">
            <button
              onClick={() => handleModeChange('self')}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                gameState.controlMode === 'self'
                  ? 'bg-ink-border text-star-white shadow-sm'
                  : 'text-star-dim hover:text-star-silver'
              }`}
            >
              Players control own
            </button>
            <button
              onClick={() => handleModeChange('host')}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                gameState.controlMode === 'host'
                  ? 'bg-ink-border text-star-white shadow-sm'
                  : 'text-star-dim hover:text-star-silver'
              }`}
            >
              Host controls all
            </button>
          </div>
        )}

        {/* Winner overlay */}
        {gameState.winner && (
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border border-gold/40 bg-gold-bg px-8 py-8 text-center overflow-hidden"
            style={{ boxShadow: '0 0 48px rgba(212,164,42,0.25)' }}
          >
            {/* Animated pulse ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-gold/25 animate-pulse" />

            <p
              className="font-[family-name:var(--font-display)] text-2xl font-bold text-gold"
              style={{ textShadow: '0 0 20px rgba(212,164,42,0.5)' }}
            >
              {winnerPlayer?.name ?? 'Someone'} wins!
            </p>
            <p className="mt-1 text-sm text-star-silver">Reached {gameState.loreTarget} lore</p>

            {playerId === gameState.hostPlayerId ? (
              <button
                onClick={handlePlayAgain}
                className="mt-6 rounded-xl bg-gradient-to-r from-gold to-gold-bright px-6 py-2.5 text-sm font-bold text-ink-deep transition-all duration-200 hover:shadow-[0_0_18px_rgba(212,164,42,0.5)]"
              >
                Play Again
              </button>
            ) : (
              <p className="mt-4 text-sm text-star-dim animate-pulse">Waiting for host to start a new game…</p>
            )}
          </div>
        )}

        <div className="z-10 w-full max-w-2xl">
          <ScoreBoard
            players={gameState.players}
            onScoreChange={handleScoreChange}
            localPlayerId={playerId}
            hostPlayerId={gameState.hostPlayerId}
            controlMode={gameState.controlMode}
            delegations={gameState.delegations}
            onTransferHost={handleTransferHost}
            onDelegate={handleDelegate}
            locked={!!gameState.winner}
          />
        </div>

        {error && (
          <p className="z-10 fixed top-4 left-1/2 -translate-x-1/2 rounded-xl border border-error/30 bg-ink-dark px-4 py-2 text-sm text-error">
            {error}
          </p>
        )}
        {reconnectingBanner}
      </main>
    );
  }

  return (
    <>
      {error && (
        <p className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-error/30 bg-ink-dark px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <LobbyView
        gameCode={id}
        players={gameState.players}
        localPlayerId={playerId}
        hostPlayerId={gameState.hostPlayerId}
        onJoin={handleJoin}
        onStart={handleStart}
        onTransferHost={handleTransferHost}
        joining={joining}
        starting={starting}
      />
      {reconnectingBanner}
    </>
  );
}
