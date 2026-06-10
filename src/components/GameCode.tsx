'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface GameCodeProps {
  code: string;
}

export default function GameCode({ code }: GameCodeProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [origin] = useState(() => (typeof window !== 'undefined' ? window.location.origin : ''));

  async function handleCopy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div className="game-code flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-clay/30 bg-surface px-8 py-4 text-center">
        <p className="text-xs uppercase tracking-widest text-fg-muted">Game code</p>
        <p className="font-mono text-3xl font-bold tracking-[0.3em] text-clay">{code}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-[44px] rounded-xl border border-line bg-raised px-5 text-sm font-medium text-fg-muted transition-all duration-200 hover:bg-line hover:text-fg"
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? 'Copied to clipboard' : ''}
        </span>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="min-h-[44px] rounded-xl border border-line bg-raised px-5 text-sm font-medium text-fg-muted transition-all duration-200 hover:bg-line hover:text-fg"
        >
          {showQr ? 'Hide QR' : 'Show QR'}
        </button>
      </div>

      {showQr && origin && (
        <div className="rounded-xl bg-fg p-3">
          <QRCodeSVG value={`${origin}/game/${code}`} size={160} />
        </div>
      )}
    </div>
  );
}
