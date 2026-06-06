import type { NextRequest } from 'next/server';
import { transferHost } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId, newHostPlayerId } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    newHostPlayerId?: string;
  };

  if (!playerId || !newHostPlayerId) {
    return Response.json({ error: 'playerId and newHostPlayerId required' }, { status: 400 });
  }

  const ok = await transferHost(id, playerId, newHostPlayerId);
  if (!ok) return Response.json({ error: 'forbidden' }, { status: 403 });

  await pusher.trigger(`game-${id}`, 'host-transferred', { hostPlayerId: newHostPlayerId });

  return Response.json({ ok: true });
}
