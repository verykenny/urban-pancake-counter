import type { NextRequest } from 'next/server';
import { setDelegation } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId, delegatePlayerId } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    delegatePlayerId?: string | null;
  };

  if (!playerId) return Response.json({ error: 'playerId required' }, { status: 400 });
  if (delegatePlayerId === undefined) return Response.json({ error: 'delegatePlayerId required' }, { status: 400 });

  const result = await setDelegation(id, playerId, delegatePlayerId);

  if (!result.ok) {
    if (result.reason === 'not_allowed') {
      return Response.json({ error: 'delegation requires players-control-own mode' }, { status: 400 });
    }
    if (result.reason === 'invalid_delegate') {
      return Response.json({ error: 'invalid delegatePlayerId' }, { status: 400 });
    }
    return Response.json({ error: 'not found' }, { status: 404 });
  }

  await pusher.trigger(`game-${id}`, 'delegation-updated', { playerId, delegatePlayerId });

  return Response.json({ ok: true });
}
