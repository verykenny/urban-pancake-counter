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
    return Response.json(
      { error: result.reason },
      { status: result.reason === 'unauthorized' ? 403 : 404 }
    );
  }

  await pusher.trigger(`game-${gameId}`, 'score-update', { playerId, score: result.score });

  return Response.json({ ok: true, score: result.score });
}
