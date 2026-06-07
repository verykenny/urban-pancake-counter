import type { NextRequest } from 'next/server';
import { startGame } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId, controlMode, loreTarget } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    controlMode?: string;
    loreTarget?: number;
  };

  if (!playerId) return Response.json({ error: 'playerId required' }, { status: 400 });

  const resolvedMode: 'host' | 'self' = controlMode === 'host' ? 'host' : 'self';
  const result = await startGame(id, playerId, resolvedMode, loreTarget);
  if (!result.ok) return Response.json({ error: 'forbidden' }, { status: 403 });

  await pusher.trigger(`game-${id}`, 'game-started', {
    players: result.session.players,
    phase: 'playing',
    controlMode: result.session.controlMode,
    loreTarget: result.session.loreTarget,
  });

  return Response.json({ ok: true });
}
