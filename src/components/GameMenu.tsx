'use client';

import { useEffect, useRef, useState } from 'react';
import { hapticsEnabled, hapticsSupported, setHapticsEnabled, vibrate } from '@/lib/haptics';
import GameCode from '@/components/GameCode';

interface GameMenuProps {
  gameCode: string;
  isHost: boolean;
  controlMode: 'host' | 'self';
  onModeChange: (mode: 'host' | 'self') => void;
}

export default function GameMenu({ gameCode, isHost, controlMode, onModeChange }: GameMenuProps) {
  const [open, setOpen] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(hapticsEnabled);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

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
        setOpen(false);
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
  }, [open]);

  function modeButtonClass(active: boolean) {
    return `min-h-[44px] rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
      active ? 'bg-ink-border text-star-white' : 'text-star-dim hover:text-star-silver'
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
        className="game-menu-trigger fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-border bg-ink-mid text-star-silver transition-colors duration-200 hover:bg-ink-border hover:text-star-white"
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
            className="fixed inset-0 z-40 bg-ink-deep/60"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            role="menu"
            aria-label="Game menu"
            className="game-menu game-menu-drawer fixed right-0 top-0 z-50 flex max-h-[80dvh] w-full max-w-xs flex-col gap-5 overflow-y-auto border-b border-l border-ink-border bg-ink-dark p-5 shadow-card sm:right-4 sm:top-16 sm:rounded-2xl sm:border"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-gold">Menu</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-star-silver transition-colors duration-200 hover:bg-ink-mid hover:text-star-white"
              >
                ✕
              </button>
            </div>

            {/* Session code lives here on mobile; it stays inline on desktop */}
            <section className="game-menu-section flex flex-col items-center gap-2 sm:hidden">
              <h3 className="self-start text-xs uppercase tracking-widest text-star-dim">
                Session
              </h3>
              <GameCode code={gameCode} />
            </section>

            <section className="game-menu-section flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-widest text-star-dim">Game</h3>
              {isHost ? (
                <div className="flex flex-col gap-1 rounded-xl border border-ink-border bg-ink-mid p-1">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={controlMode === 'self'}
                    onClick={() => {
                      onModeChange('self');
                      setOpen(false);
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
                      setOpen(false);
                    }}
                    className={modeButtonClass(controlMode === 'host')}
                  >
                    Host controls all
                  </button>
                </div>
              ) : (
                <p className="text-sm text-star-silver">
                  Scoring:{' '}
                  {controlMode === 'host' ? 'host controls all' : 'players control their own'}
                </p>
              )}
            </section>

            {hapticsSupported() && (
              <section className="game-menu-section flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-widest text-star-dim">Feedback</h3>
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
                  className="flex min-h-[44px] items-center justify-between rounded-xl border border-ink-border bg-ink-mid px-4 text-sm text-star-silver transition-colors duration-200 hover:bg-ink-border"
                >
                  <span>Haptic feedback</span>
                  <span className={hapticsOn ? 'font-semibold text-gold' : 'text-star-dim'}>
                    {hapticsOn ? 'On' : 'Off'}
                  </span>
                </button>
              </section>
            )}
            <section className="game-menu-section flex flex-col gap-2 border-t border-ink-border pt-4">
              <a
                href="/"
                className="flex min-h-[44px] items-center rounded-xl border border-ink-border bg-ink-mid px-4 text-sm text-star-silver transition-colors duration-200 hover:bg-ink-border hover:text-star-white"
              >
                Leave game
              </a>
            </section>
          </div>
        </>
      )}
    </>
  );
}
