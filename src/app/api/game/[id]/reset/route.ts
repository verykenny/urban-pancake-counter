import type { NextRequest } from 'next/server';
import { resetGame, getSession } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const { playerId } = (await req.json().catch(() => ({}))) as { playerId?: string };

  if (!playerId) {
    return Response.json({ error: 'playerId required' }, { status: 400 });
  }

  const ok = resetGame(id, playerId);
  if (!ok) {
    const session = getSession(id);
    if (!session) return Response.json({ error: 'not_found' }, { status: 404 });
    return Response.json({ error: 'unauthorized' }, { status: 403 });
  }

  const session = getSession(id)!;
  await pusher.trigger(`game-${id}`, 'game-reset', { players: session.players });

  return Response.json({ ok: true });
}
