import type { NextRequest } from 'next/server';
import { startGame, getSession } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId } = (await req.json().catch(() => ({}))) as { playerId?: string };

  if (!playerId) return Response.json({ error: 'playerId required' }, { status: 400 });

  const ok = startGame(id, playerId);
  if (!ok) return Response.json({ error: 'forbidden' }, { status: 403 });

  const session = getSession(id)!;

  await pusher.trigger(`game-${id}`, 'game-started', {
    players: session.players,
    phase: 'playing',
  });

  return Response.json({ ok: true });
}
