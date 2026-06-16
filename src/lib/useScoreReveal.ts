'use client';

import { useEffect, useRef, useState } from 'react';

const FLASH_MS = 600;
const MERGE_MS = 250;

export interface ScoreBadge {
  value: number;
  merging: boolean;
}

export function useScoreReveal(
  score: number,
  pendingDelta: number,
  instant = false
): { displayedScore: number; badge: ScoreBadge | null; popKey: number } {
  const [displayedScore, setDisplayedScore] = useState(score);
  const [popKey, setPopKey] = useState(0);
  const [flash, setFlash] = useState(0);
  const [mergingValue, setMergingValue] = useState<number | null>(null);

  const displayedRef = useRef(score);
  const prevScore = useRef(score);
  const prevPending = useRef(pendingDelta);
  const scoreRef = useRef(score);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Single-device (table) mode commits the score directly in render (no network
    // echo to reconcile), so the reveal effect has nothing to synchronize.
    if (instant) return;
    scoreRef.current = score;
    const scoreChanged = score !== prevScore.current;
    const pendingDropped = Math.abs(pendingDelta) < Math.abs(prevPending.current);
    const mergedPending = prevPending.current;
    prevScore.current = score;
    prevPending.current = pendingDelta;
    if (!scoreChanged) return;

    if (pendingDropped) {
      // Own batch confirmed — merge the badge into the score immediately
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = null;
      setFlash(0);
      displayedRef.current = score;
      setDisplayedScore(score);
      setPopKey((k) => k + 1);
      if (pendingDelta === 0) {
        setMergingValue(mergedPending);
        if (mergeTimer.current) clearTimeout(mergeTimer.current);
        mergeTimer.current = setTimeout(() => setMergingValue(null), MERGE_MS);
      }
    } else {
      // Another player's update — flash the delta, then merge after a beat
      setFlash(score - displayedRef.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => {
        flashTimer.current = null;
        const commitTo = scoreRef.current;
        setMergingValue(commitTo - displayedRef.current);
        displayedRef.current = commitTo;
        setDisplayedScore(commitTo);
        setFlash(0);
        setPopKey((k) => k + 1);
        if (mergeTimer.current) clearTimeout(mergeTimer.current);
        mergeTimer.current = setTimeout(() => setMergingValue(null), MERGE_MS);
      }, FLASH_MS);
    }
  }, [score, pendingDelta, instant]);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (mergeTimer.current) clearTimeout(mergeTimer.current);
    },
    []
  );

  if (instant) {
    // Show the live score immediately; re-key on the value so each change
    // replays the pop. No badge in this mode.
    return { displayedScore: score, badge: null, popKey: score };
  }

  const badge: ScoreBadge | null =
    mergingValue !== null
      ? { value: mergingValue, merging: true }
      : pendingDelta !== 0
        ? { value: pendingDelta, merging: false }
        : flash !== 0
          ? { value: flash, merging: false }
          : null;

  return { displayedScore, badge, popKey };
}
