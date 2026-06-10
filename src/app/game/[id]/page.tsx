'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { usePlayerId } from '@/lib/usePlayerId';
import { useWakeLock } from '@/lib/useWakeLock';
import { vibrate } from '@/lib/haptics';
import { getPusherClient } from '@/lib/pusherClient';
import LobbyView from '@/components/LobbyView';
import ScoreBoard from '@/components/ScoreBoard';
import GameMenu from '@/components/GameMenu';

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  avatarName: string | null;
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
  // Hold the wake lock only during active play — releases in the lobby, in the
  // post-win idle state (phase stays 'playing' after a win, so gate on winner
  // too), and when leaving the route (the hook releases on `active` flipping
  // false via its effect cleanup).
  useWakeLock(gameState?.phase === 'playing' && !gameState?.winner);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [connectionState, setConnectionState] = useState('connected');
  const prevConn = useRef('connected');
  const prevWinner = useRef<string | null>(null);
  // Score taps are never applied optimistically: gameState holds server-confirmed
  // scores only, taps accumulate in pendingDeltas (state — drives the +/−N badge),
  // unsentDeltas holds the not-yet-POSTed portion, and inFlightBatches queues the
  // amounts awaiting their Pusher echo so the badge can be reconciled exactly.
  const [pendingDeltas, setPendingDeltas] = useState<Record<string, number>>({});
  const unsentDeltas = useRef<Record<string, number>>({});
  const inFlightBatches = useRef<Record<string, number[]>>({});
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const winner = gameState?.winner ?? null;
  useEffect(() => {
    if (winner && !prevWinner.current) {
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
    prevWinner.current = winner;
  }, [winner]);

  useEffect(() => {
    if (!error || !gameState) return;
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(''), 5000);
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error, gameState]);

  useEffect(() => {
    if (!id) return;

    // Any full-state resync makes queued taps unaccountable (their echo may have
    // already landed in the snapshot) — drop them so no stale badge survives.
    const clearPendingScoreState = () => {
      unsentDeltas.current = {};
      inFlightBatches.current = {};
      Object.values(debounceTimers.current).forEach(clearTimeout);
      debounceTimers.current = {};
      setPendingDeltas({});
    };

    fetch(`/api/game/${id}`)
      .then((r) => {
        if (!r.ok) {
          setError("This game has expired or doesn't exist.");
          return null;
        }
        return r.json();
      })
      .then((data: GameState | null) => {
        if (data) {
          clearPendingScoreState();
          setGameState({ ...data, delegations: data.delegations ?? {}, winner: data.winner ?? null, loreTarget: data.loreTarget ?? 20 });
        }
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
            if (data) {
              clearPendingScoreState();
              setGameState({ ...data, delegations: data.delegations ?? {}, winner: data.winner ?? null, loreTarget: data.loreTarget ?? 20 });
            }
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

    channel.bind('score-update', (data: { playerId: string; score: number; requestingPlayerId?: string }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === data.playerId ? { ...p, score: data.score } : p
          ),
        };
      });
      if (data.requestingPlayerId === playerId) {
        // Our own echo — retire the oldest in-flight batch. Both setState calls
        // land in one render so the card merges the badge instead of flashing.
        const batch = inFlightBatches.current[data.playerId]?.shift() ?? 0;
        if (batch !== 0) {
          setPendingDeltas((prev) => ({
            ...prev,
            [data.playerId]: (prev[data.playerId] ?? 0) - batch,
          }));
        }
      }
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
      clearPendingScoreState();
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
  }, [id, playerId]);

  async function handleJoin(name: string, avatarName: string | null) {
    setJoining(true);
    setError('');
    try {
      const res = await fetch(`/api/game/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, name, avatarName }),
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
        <p className="text-danger">{error}</p>
      </main>
    );
  }

  if (!gameState || !playerId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="text-fg-faint animate-pulse">Loading…</p>
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

  function handleScoreChange(targetPlayerId: string, delta: number) {
    // The − button disables at effective 0, but rapid taps can land before the
    // re-render; refs are always current, so re-check here.
    if (delta < 0) {
      const confirmed = gameState?.players.find((p) => p.id === targetPlayerId)?.score ?? 0;
      const inFlightSum = (inFlightBatches.current[targetPlayerId] ?? []).reduce((a, b) => a + b, 0);
      const pendingNow = (unsentDeltas.current[targetPlayerId] ?? 0) + inFlightSum;
      if (confirmed + pendingNow + delta < 0) return;
    }
    vibrate(10);
    unsentDeltas.current[targetPlayerId] = (unsentDeltas.current[targetPlayerId] ?? 0) + delta;
    setPendingDeltas((prev) => ({
      ...prev,
      [targetPlayerId]: (prev[targetPlayerId] ?? 0) + delta,
    }));
    clearTimeout(debounceTimers.current[targetPlayerId]);
    debounceTimers.current[targetPlayerId] = setTimeout(async () => {
      const totalDelta = unsentDeltas.current[targetPlayerId] ?? 0;
      unsentDeltas.current[targetPlayerId] = 0;
      if (totalDelta === 0) return;
      (inFlightBatches.current[targetPlayerId] ??= []).push(totalDelta);
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: id, playerId: targetPlayerId, requestingPlayerId: playerId, delta: totalDelta }),
      });
      if (!res.ok) {
        // No echo will come for this batch — remove it (by value, so an
        // out-of-order failure can't desync the FIFO) and roll the badge back.
        const queue = inFlightBatches.current[targetPlayerId];
        const idx = queue?.indexOf(totalDelta) ?? -1;
        if (queue && idx !== -1) {
          queue.splice(idx, 1);
          setPendingDeltas((prev) => ({
            ...prev,
            [targetPlayerId]: (prev[targetPlayerId] ?? 0) - totalDelta,
          }));
        }
        setError('Score update failed — tap +/− to retry.');
      }
    }, 400);
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
    <p role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-line bg-surface px-4 py-2 text-sm text-fg-muted animate-pulse">
      Reconnecting…
    </p>
  ) : null;

  const errorBanner = error ? (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl border border-danger/30 bg-surface px-4 py-2 text-sm text-danger"
    >
      <span>{error}</span>
      <button
        type="button"
        onClick={() => setError('')}
        aria-label="Dismiss error"
        className="flex h-11 w-11 -my-3 -mr-3 flex-shrink-0 items-center justify-center rounded opacity-60 transition-opacity duration-150 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  ) : null;

  if (gameState.phase === 'playing') {
    const winnerPlayer = gameState.players.find((p) => p.id === gameState.winner);

    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-4 sm:gap-8 sm:p-8">
        {/* Compact header — scores own the screen during play; the full code
            card (copy + QR) lives in the menu drawer */}
        <div className="w-full max-w-2xl flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={async () => {
              if (!navigator.clipboard) return;
              try {
                await navigator.clipboard.writeText(id);
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 1500);
              } catch { /* clipboard unavailable */ }
            }}
            className="flex items-center gap-3 rounded-xl border border-clay/30 bg-surface px-4 py-2.5 transition-opacity duration-150 active:opacity-70"
            aria-label={`Game code: ${id}. Tap to copy.`}
          >
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-fg-muted leading-none">Game code</p>
              <p className="font-mono text-base font-bold tracking-[0.2em] text-clay leading-tight mt-0.5">
                {codeCopied ? '✓ Copied' : id}
              </p>
            </div>
          </button>
          <p className="text-[10px] uppercase tracking-widest text-fg-faint pl-1">
            First to {gameState.loreTarget} lore
          </p>
        </div>

        {/* Secondary actions live in the menu (host control mode, players, future toggles) */}
        <GameMenu
          gameCode={id}
          isHost={playerId === gameState.hostPlayerId}
          controlMode={gameState.controlMode}
          onModeChange={handleModeChange}
          players={gameState.players}
          localPlayerId={playerId}
          delegations={gameState.delegations}
          onTransferHost={handleTransferHost}
          onDelegate={(delegatePlayerId) => handleDelegate(playerId, delegatePlayerId)}
        />

        {/* Winner overlay */}
        {gameState.winner && (
          <div className="relative w-full max-w-md rounded-2xl border border-clay/40 bg-clay-deep px-8 py-8 text-center overflow-hidden shadow-winner">
            <p role="status" className="font-[family-name:var(--font-display)] text-2xl font-bold text-clay text-shadow-glow-strong">
              {winnerPlayer?.name ?? 'Someone'} wins!
            </p>
            <p className="mt-1 text-sm text-fg-muted">Reached {gameState.loreTarget} lore</p>

            {playerId === gameState.hostPlayerId ? (
              <button
                onClick={handlePlayAgain}
                className="mt-6 rounded-xl bg-clay px-6 py-2.5 text-sm font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong hover:shadow-glow"
              >
                Play again
              </button>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-4">
                <p className="text-sm text-fg-muted">Waiting for host to start a new game.</p>
                <Link
                  href="/"
                  className="rounded-xl border border-line px-5 py-2 text-sm font-medium text-fg-muted transition-colors duration-200 hover:border-clay/40 hover:text-fg"
                >
                  Leave game
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Control mode indicator — mobile only; explains disabled +/− to non-host players */}
        {!gameState.winner && gameState.controlMode === 'host' && (
          <p className="sm:hidden rounded-full border border-line bg-raised px-3 py-0.5 text-xs text-fg-muted">
            {playerId === gameState.hostPlayerId ? 'You\'re scoring for everyone' : 'Host is scoring'}
          </p>
        )}

        <div className="flex w-full max-w-2xl flex-1 flex-col sm:flex-none">
          <ScoreBoard
            players={gameState.players}
            pendingDeltas={pendingDeltas}
            onScoreChange={handleScoreChange}
            localPlayerId={playerId}
            hostPlayerId={gameState.hostPlayerId}
            controlMode={gameState.controlMode}
            delegations={gameState.delegations}
            locked={!!gameState.winner}
          />
        </div>

        {errorBanner}
        {reconnectingBanner}
      </main>
    );
  }

  return (
    <>
      {errorBanner}
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
