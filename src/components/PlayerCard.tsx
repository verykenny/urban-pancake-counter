"use client";

import { useState } from "react";

interface OtherPlayer {
  id: string;
  name: string;
}

interface PlayerCardProps {
  name: string;
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  isOwnCard?: boolean;
  isHost?: boolean;
  canTransferHost?: boolean;
  onTransferHost?: () => void;
  canDelegate?: boolean;
  currentDelegate: string | null;
  delegateName: string | null;
  otherPlayers: OtherPlayer[];
  onDelegate: (delegatePlayerId: string | null) => void;
}

export default function PlayerCard({
  name,
  score,
  onIncrement,
  onDecrement,
  disabled,
  isOwnCard,
  isHost,
  canTransferHost,
  onTransferHost,
  canDelegate,
  currentDelegate,
  delegateName,
  otherPlayers,
  onDelegate,
}: PlayerCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handlePick(delegateId: string | null) {
    onDelegate(delegateId);
    setPickerOpen(false);
  }

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">{name}</h2>
        {isHost && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Host</span>
        )}
      </div>

      {delegateName && (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          Delegated to {delegateName}
        </span>
      )}

      <span className="text-6xl font-bold">{score}</span>

      <div className="flex gap-3">
        <button
          onClick={onDecrement}
          disabled={disabled || score === 0}
          className="rounded-lg bg-gray-100 px-4 py-2 text-lg font-bold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          −
        </button>
        <button
          onClick={onIncrement}
          disabled={disabled}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-lg font-bold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {canTransferHost && (
        <button
          onClick={onTransferHost}
          className="text-xs text-gray-400 hover:text-amber-600 underline underline-offset-2"
        >
          Make host
        </button>
      )}

      {isOwnCard && canDelegate && (
        <div className="relative">
          <button
            onClick={() => setPickerOpen((o) => !o)}
            className="text-xs text-gray-400 hover:text-indigo-600 underline underline-offset-2"
          >
            {currentDelegate ? `Delegated → ${delegateName}` : 'Delegate control'}
          </button>

          {pickerOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 min-w-max rounded-xl border border-gray-200 bg-white shadow-lg">
              <ul className="py-1">
                {otherPlayers.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handlePick(p.id)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 ${currentDelegate === p.id ? 'font-semibold text-indigo-700' : 'text-gray-700'}`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => handlePick(null)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${!currentDelegate ? 'font-semibold text-gray-500' : 'text-gray-400'}`}
                  >
                    None
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
