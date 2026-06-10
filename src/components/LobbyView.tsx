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
  const takenInks = new Set(players.map((p) => p.avatarName));
  const selectedInk = champion && !takenInks.has(champion) ? champion : null;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onJoin(trimmed, selectedInk);
  }

  function handleLoreTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    if (!Number.isNaN(raw)) setLoreTarget(raw);
  }

  function handleLoreTargetBlur() {
    setLoreTarget((v) => Math.min(200, Math.max(1, v || 1)));
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-glow/12 blur-3xl" />
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-widest text-clay uppercase z-10 text-shadow-glow">
        Lorcana Lore Tracker
      </h1>

      {/* Game code */}
      <GameCode code={gameCode} />

      {!isInLobby ? (
        <form onSubmit={handleJoin} className="z-10 flex w-full max-w-xs flex-col items-center gap-3">
          <p className="text-fg-muted text-sm">Enter your name to join the lobby.</p>

          <p className="mt-2 text-xs uppercase tracking-widest text-fg-muted">Choose your ink</p>
          <div className="grid w-full grid-cols-6 gap-3">
            {INK_COLORS.map((ink) => {
              const taken = takenInks.has(ink.key);
              return (
                <button
                  key={ink.key}
                  type="button"
                  disabled={taken}
                  onClick={() => setChampion((prev) => (prev === ink.key ? null : ink.key))}
                  title={taken ? `${ink.label} (taken)` : ink.label}
                  aria-pressed={selectedInk === ink.key}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-150 ${
                    selectedInk === ink.key
                      ? 'ring-2 ring-clay bg-raised'
                      : taken
                        ? 'opacity-30 cursor-not-allowed'
                        : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Avatar avatarName={ink.key} color={ink.hex} size={48} />
                  <span className="text-[10px] text-fg-faint">{ink.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={20}
              autoFocus
              className="w-full min-h-[44px] rounded-xl border border-line bg-raised px-4 py-2.5 text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay/60 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={joining || !name.trim()}
              className="min-h-[44px] rounded-xl bg-clay px-5 py-2.5 font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining…' : 'Join'}
            </button>
          </div>
        </form>
      ) : (
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2 w-64">
            {players.map((p) => (
              <div
                key={p.id}
                className="relative flex items-center gap-3 rounded-xl border border-line bg-raised px-4 py-3 overflow-hidden"
              >
                {/* Top color accent strip — matches PlayerCard pattern */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                  style={{ background: p.color }}
                />
                <Avatar avatarName={p.avatarName} color={p.color} size={32} />
                <span className="font-medium flex-1 text-fg">{p.name}</span>
                {p.id === hostPlayerId && (
                  <span className="text-xs font-bold uppercase tracking-widest text-clay">host</span>
                )}
                {isHost && p.id !== localPlayerId && (
                  <button
                    type="button"
                    onClick={() => onTransferHost(p.id)}
                    className="min-h-[44px] inline-flex items-center text-xs text-fg-faint hover:text-clay underline underline-offset-2 transition-colors duration-200"
                  >
                    Make host
                  </button>
                )}
              </div>
            ))}
            {players.length < 4 && (
              <p className="text-center text-sm text-fg-muted">
                Waiting for players… ({players.length}/4)
              </p>
            )}
          </div>

          {isHost ? (
            <div className="flex flex-col items-center gap-4">
              {/* Pill-switcher control mode */}
              <div className="flex flex-col sm:flex-row bg-raised rounded-xl p-1 gap-1 border border-line">
                <button
                  type="button"
                  onClick={() => setControlMode('self')}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    controlMode === 'self'
                      ? 'bg-line text-fg shadow-sm'
                      : 'text-fg-faint hover:text-fg-muted'
                  }`}
                >
                  Players control own
                </button>
                <button
                  type="button"
                  onClick={() => setControlMode('host')}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    controlMode === 'host'
                      ? 'bg-line text-fg shadow-sm'
                      : 'text-fg-faint hover:text-fg-muted'
                  }`}
                >
                  Host controls all
                </button>
              </div>

              <label className="flex items-center gap-3 text-sm text-fg-muted">
                Lore target
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={loreTarget}
                  onChange={handleLoreTargetChange}
                  onBlur={handleLoreTargetBlur}
                  className="w-20 min-h-[44px] rounded-xl border border-line bg-raised px-3 py-2 text-center text-fg focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay/60 transition-all duration-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                {loreTarget === 20 && (
                  <span className="text-xs text-fg-faint">(standard)</span>
                )}
              </label>

              <button
                onClick={() => onStart(controlMode, loreTarget)}
                disabled={!canStart || starting}
                className="rounded-xl bg-clay px-8 py-3 font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starting ? 'Starting…' : 'Start game'}
              </button>
            </div>
          ) : (
            <p className="text-fg-muted text-sm">Waiting for host to start the game…</p>
          )}
        </div>
      )}
    </main>
  );
}
