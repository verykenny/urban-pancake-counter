'use client';

import { useState } from 'react';
import GameCode from './GameCode';
import Avatar from './Avatar';
import { INK_COLORS } from '@/lib/inkColors';

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  avatarName: string | null;
}

interface LobbyViewProps {
  gameCode: string;
  players: Player[];
  localPlayerId: string;
  hostPlayerId: string;
  onJoin: (name: string, avatarName: string | null) => void;
  onStart: (controlMode: 'host' | 'self', loreTarget: number) => void;
  onTransferHost: (newHostPlayerId: string) => void;
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
  onTransferHost,
  joining,
  starting,
}: LobbyViewProps) {
  const [name, setName] = useState('');
  const [champion, setChampion] = useState<string | null>(null);
  const [controlMode, setControlMode] = useState<'host' | 'self'>('self');
  const [loreTarget, setLoreTarget] = useState(20);
  const isInLobby = players.some((p) => p.id === localPlayerId);
  const isHost = localPlayerId === hostPlayerId;
  const canStart = isHost && players.length >= 2;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onJoin(trimmed, champion);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-ambient/20 blur-3xl" />
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-widest text-gold uppercase z-10 text-shadow-glow">
        Lorcana Lore Tracker
      </h1>

      {/* Game code */}
      <GameCode code={gameCode} />

      {!isInLobby ? (
        <form onSubmit={handleJoin} className="z-10 flex w-full max-w-xs flex-col items-center gap-3">
          <p className="text-star-silver text-sm">Enter your name to join the lobby.</p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              autoFocus
              className="w-full min-h-[44px] rounded-xl border border-ink-border bg-ink-mid px-4 py-2.5 text-star-white placeholder:text-star-dim focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={joining || !name.trim()}
              className="min-h-[44px] rounded-xl bg-gradient-to-r from-gold to-gold-bright px-5 py-2.5 font-bold text-ink-deep transition-all duration-200 hover:shadow-glow-strong disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining…' : 'Join'}
            </button>
          </div>

          <p className="mt-2 text-xs uppercase tracking-widest text-star-silver">Choose your ink</p>
          <div className="grid w-full grid-cols-6 gap-3">
            {INK_COLORS.map((ink) => (
              <button
                key={ink.key}
                type="button"
                onClick={() => setChampion((prev) => (prev === ink.key ? null : ink.key))}
                title={ink.label}
                className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-150 ${
                  champion === ink.key ? 'ring-2 ring-gold bg-ink-mid' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Avatar avatarName={ink.key} color={ink.hex} size={48} />
                <span className="text-[10px] text-star-dim">{ink.label}</span>
              </button>
            ))}
          </div>
        </form>
      ) : (
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2 w-64">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-ink-border bg-ink-mid px-4 py-3"
                style={{ borderLeftColor: p.color, borderLeftWidth: '3px' }}
              >
                <Avatar avatarName={p.avatarName} color={p.color} size={32} />
                <span className="font-medium flex-1 text-star-white">{p.name}</span>
                {p.id === hostPlayerId && (
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">host</span>
                )}
                {isHost && p.id !== localPlayerId && (
                  <button
                    type="button"
                    onClick={() => onTransferHost(p.id)}
                    className="text-xs text-star-dim hover:text-gold underline underline-offset-2 transition-colors duration-200"
                  >
                    Make host
                  </button>
                )}
              </div>
            ))}
            {players.length < 4 && (
              <p className="text-center text-sm text-star-silver animate-pulse">
                Waiting for players… ({players.length}/4)
              </p>
            )}
          </div>

          {isHost ? (
            <div className="flex flex-col items-center gap-4">
              {/* Pill-switcher control mode */}
              <div className="flex flex-col sm:flex-row bg-ink-mid rounded-xl p-1 gap-1 border border-ink-border">
                <button
                  type="button"
                  onClick={() => setControlMode('self')}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    controlMode === 'self'
                      ? 'bg-ink-border text-star-white shadow-sm'
                      : 'text-star-dim hover:text-star-silver'
                  }`}
                >
                  Players control own
                </button>
                <button
                  type="button"
                  onClick={() => setControlMode('host')}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    controlMode === 'host'
                      ? 'bg-ink-border text-star-white shadow-sm'
                      : 'text-star-dim hover:text-star-silver'
                  }`}
                >
                  Host controls all
                </button>
              </div>

              <label className="flex items-center gap-3 text-sm text-star-silver">
                Lore target
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={loreTarget}
                  onChange={(e) => setLoreTarget(Number(e.target.value))}
                  className="w-20 min-h-[44px] rounded-xl border border-ink-border bg-ink-mid px-3 py-2 text-center text-star-white focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-all duration-200"
                />
              </label>

              <button
                onClick={() => onStart(controlMode, loreTarget)}
                disabled={!canStart || starting}
                className="rounded-xl bg-gradient-to-r from-gold to-gold-bright px-8 py-3 font-bold text-ink-deep transition-all duration-200 hover:shadow-glow-strong disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starting ? 'Starting…' : 'Start game'}
              </button>
            </div>
          ) : (
            <p className="text-star-silver text-sm animate-pulse">Waiting for host to start the game…</p>
          )}
        </div>
      )}
    </main>
  );
}
