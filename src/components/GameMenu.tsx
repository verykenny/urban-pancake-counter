'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { hapticsEnabled, hapticsSupported, setHapticsEnabled, vibrate } from '@/lib/haptics';
import GameCode from '@/components/GameCode';
import Avatar from '@/components/Avatar';

interface Player {
  id: string;
  name: string;
  color: string;
  avatarName: string | null;
}

interface GameMenuProps {
  gameCode: string;
  isHost: boolean;
  controlMode: 'host' | 'self';
  onModeChange: (mode: 'host' | 'self') => void;
  players: Player[];
  localPlayerId: string;
  delegations: Record<string, string | null>;
  onTransferHost: (newHostPlayerId: string) => void;
  onDelegate: (delegatePlayerId: string | null) => void;
}

export default function GameMenu({
  gameCode,
  isHost,
  controlMode,
  onModeChange,
  players,
  localPlayerId,
  delegations,
  onTransferHost,
  onDelegate,
}: GameMenuProps) {
  const [open, setOpen] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(hapticsEnabled);
  const [confirmTransferTarget, setConfirmTransferTarget] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  function handleClose() {
    setOpen(false);
    setConfirmTransferTarget(null);
  }

  const otherPlayers = players.filter((p) => p.id !== localPlayerId);
  const isInGame = players.some((p) => p.id === localPlayerId);
  const myDelegateId = delegations[localPlayerId] ?? null;
  const myDelegateName = players.find((p) => p.id === myDelegateId)?.name ?? null;
  const confirmTarget = players.find((p) => p.id === confirmTransferTarget);

  const showPlayersSection =
    (isHost && otherPlayers.length > 0) || (controlMode === 'self' && isInGame && otherPlayers.length > 0);

  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    const trigger = triggerRef.current;
    const focusables = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    focusables()[0]?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function modeButtonClass(active: boolean) {
    return `min-h-[44px] rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
      active ? 'bg-line text-fg' : 'text-fg-faint hover:text-fg-muted'
    }`;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Game menu"
        className="game-menu-trigger fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-raised text-fg-muted transition-colors duration-200 hover:bg-line hover:text-fg"
      >
        <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="2" r="2" />
          <circle cx="2" cy="9" r="2" />
          <circle cx="2" cy="16" r="2" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-base-deep/60"
            aria-hidden="true"
            onClick={handleClose}
          />
          <div
            ref={drawerRef}
            role="menu"
            aria-label="Game menu"
            className="game-menu game-menu-drawer fixed right-0 top-0 z-50 flex max-h-[80dvh] w-full max-w-xs flex-col gap-5 overflow-y-auto border-b border-l border-line bg-surface p-5 shadow-card sm:right-4 sm:top-16 sm:rounded-2xl sm:border"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-clay">Menu</h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors duration-200 hover:bg-raised hover:text-fg"
              >
                ✕
              </button>
            </div>

            {/* Session code — the game screen only shows the compact chip,
                so the full card (copy + QR) lives here */}
            <section className="game-menu-section flex flex-col items-center gap-2">
              <h3 className="self-start text-xs uppercase tracking-widest text-fg-faint">
                Session
              </h3>
              <GameCode code={gameCode} />
            </section>

            {/* Game settings */}
            <section className="game-menu-section flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-widest text-fg-faint">Game</h3>
              {isHost ? (
                <div className="flex flex-col gap-1 rounded-xl border border-line bg-raised p-1">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={controlMode === 'self'}
                    onClick={() => {
                      onModeChange('self');
                      handleClose();
                    }}
                    className={modeButtonClass(controlMode === 'self')}
                  >
                    Players control own
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={controlMode === 'host'}
                    onClick={() => {
                      onModeChange('host');
                      handleClose();
                    }}
                    className={modeButtonClass(controlMode === 'host')}
                  >
                    Host controls all
                  </button>
                </div>
              ) : (
                <p className="text-sm text-fg-muted">
                  Scoring:{' '}
                  {controlMode === 'host' ? 'host controls all' : 'players control their own'}
                </p>
              )}
            </section>

            {/* Players — host transfer + delegation */}
            {showPlayersSection && (
              <section className="game-menu-section flex flex-col gap-3">
                <h3 className="text-xs uppercase tracking-widest text-fg-faint">Players</h3>

                {/* Host transfer */}
                {isHost && otherPlayers.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {confirmTransferTarget ? (
                      <div className="rounded-xl border border-clay/30 bg-clay-deep p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar avatarName={confirmTarget?.avatarName ?? null} color={confirmTarget?.color ?? '#d08458'} size={28} />
                          <div>
                            <p className="text-sm font-medium text-fg">
                              Transfer host to {confirmTarget?.name}?
                            </p>
                            <p className="text-xs text-fg-muted mt-0.5">
                              You&apos;ll lose host controls for this session.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onTransferHost(confirmTransferTarget);
                              handleClose();
                            }}
                            className="flex-1 min-h-[40px] rounded-lg bg-clay px-3 text-sm font-bold text-base-deep transition-all duration-200 hover:bg-clay-strong"
                          >
                            Transfer host
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmTransferTarget(null)}
                            className="flex-1 min-h-[40px] rounded-lg border border-line bg-raised px-3 text-sm text-fg-muted transition-colors duration-200 hover:bg-line"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-fg-muted">Transfer host to:</p>
                        {otherPlayers.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setConfirmTransferTarget(p.id)}
                            className="flex min-h-[44px] items-center gap-3 rounded-xl border border-line bg-raised px-4 text-sm text-fg-muted transition-colors duration-200 hover:bg-line hover:text-fg"
                          >
                            <Avatar avatarName={p.avatarName} color={p.color} size={24} />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Delegation — only in self-control mode */}
                {controlMode === 'self' && isInGame && otherPlayers.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-fg-muted">
                      {myDelegateName
                        ? `${myDelegateName} is controlling your score.`
                        : 'Let another player control your score:'}
                    </p>
                    {myDelegateName ? (
                      <button
                        type="button"
                        onClick={() => {
                          onDelegate(null);
                          handleClose();
                        }}
                        className="flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-raised px-4 text-sm text-fg-muted transition-colors duration-200 hover:bg-line hover:text-fg"
                      >
                        Reclaim control
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {otherPlayers.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onDelegate(p.id);
                              handleClose();
                            }}
                            className="flex min-h-[44px] items-center gap-3 rounded-xl border border-line bg-raised px-4 text-sm text-fg-muted transition-colors duration-200 hover:bg-line hover:text-fg"
                          >
                            <Avatar avatarName={p.avatarName} color={p.color} size={24} />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Haptics */}
            {hapticsSupported() && (
              <section className="game-menu-section flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-widest text-fg-faint">Feedback</h3>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={hapticsOn}
                  onClick={() => {
                    const next = !hapticsOn;
                    setHapticsOn(next);
                    setHapticsEnabled(next);
                    if (next) vibrate(10);
                  }}
                  className="flex min-h-[44px] items-center justify-between rounded-xl border border-line bg-raised px-4 text-sm text-fg-muted transition-colors duration-200 hover:bg-line"
                >
                  <span>Haptic feedback</span>
                  <span className={hapticsOn ? 'font-semibold text-clay' : 'text-fg-faint'}>
                    {hapticsOn ? 'On' : 'Off'}
                  </span>
                </button>
              </section>
            )}

            <section className="game-menu-section flex flex-col gap-2 border-t border-line pt-4">
              <Link
                href="/"
                className="flex min-h-[44px] items-center rounded-xl border border-line bg-raised px-4 text-sm text-fg-muted transition-colors duration-200 hover:bg-line hover:text-fg"
              >
                Leave game
              </Link>
            </section>
          </div>
        </>
      )}
    </>
  );
}
