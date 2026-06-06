import type { NextRequest } from 'next/server';
import { updateScore } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(req: NextRequest): Promise<Response> {
  const { gameId, playerId, requestingPlayerId, delta } = (await req.json().catch(() => ({}))) as {
    gameId?: string;
    playerId?: string;
    requestingPlayerId?: string;
    delta?: number;
  };

  if (!gameId || !playerId || !requestingPlayerId || typeof delta !== 'number') {
    return Response.json({ error: 'gameId, playerId, requestingPlayerId, and delta required' }, { status: 400 });
  }

  const result = updateScore(gameId, playerId, requestingPlayerId, delta);
  if (!result.ok) {
    const status = result.reason === 'unauthorized' || result.reason === 'board_locked' ? 403 : 404;
    return Response.json({ error: result.reason }, { status });
  }

  await pusher.trigger(`game-${gameId}`, 'score-update', { playerId, score: result.score });

  if (result.winner !== null) {
    await pusher.trigger(`game-${gameId}`, 'game-won', { winnerId: result.winner });
  }

  return Response.json({ ok: true, score: result.score });
}
