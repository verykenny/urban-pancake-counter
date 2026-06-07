'use client';

import { useState } from 'react';

interface GameCodeProps {
  code: string;
}

export default function GameCode({ code }: GameCodeProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="z-10 flex flex-col items-center gap-3">
      <div
        className="rounded-2xl border border-gold/30 bg-ink-dark px-8 py-4 text-center"
        style={{ boxShadow: '0 0 24px rgba(212,164,42,0.08)' }}
      >
        <p className="text-xs uppercase tracking-widest text-star-silver">Game code</p>
        <p className="font-mono text-3xl font-bold tracking-[0.3em] text-gold">{code}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-[44px] rounded-xl border border-ink-border bg-ink-mid px-5 text-sm font-medium text-star-silver transition-all duration-200 hover:bg-ink-border hover:text-star-white"
      >
        {copied ? 'Copied!' : 'Copy code'}
      </button>
    </div>
  );
}
