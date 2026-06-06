import type { NextRequest } from 'next/server';
import { updateScore } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(req: NextRequest): Promise<Response> {
  const { gameId, playerId, delta } = (await req.json().catch(() => ({}))) as {
    gameId?: string;
    playerId?: string;
    delta?: number;
  };

  if (!gameId || !playerId || typeof delta !== 'number') {
    return Response.json({ error: 'gameId, playerId, and delta required' }, { status: 400 });
  }

  const newScore = updateScore(gameId, playerId, delta);
  if (newScore === null) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

  await pusher.trigger(`game-${gameId}`, 'score-update', { playerId, score: newScore });

  return Response.json({ ok: true, score: newScore });
}
