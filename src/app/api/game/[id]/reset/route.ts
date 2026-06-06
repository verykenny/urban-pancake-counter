import type { NextRequest } from 'next/server';
import { resetGame } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const { playerId } = (await req.json().catch(() => ({}))) as { playerId?: string };

  if (!playerId) {
    return Response.json({ error: 'playerId required' }, { status: 400 });
  }

  const result = await resetGame(id, playerId);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 403;
    return Response.json({ error: result.reason }, { status });
  }

  await pusher.trigger(`game-${id}`, 'game-reset', { players: result.session.players });

  return Response.json({ ok: true });
}
