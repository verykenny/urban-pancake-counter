import type { NextRequest } from 'next/server';
import { setControlMode } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId, controlMode } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    controlMode?: string;
  };

  if (!playerId) return Response.json({ error: 'playerId required' }, { status: 400 });

  const resolvedMode: 'host' | 'self' = controlMode === 'host' ? 'host' : 'self';
  const ok = await setControlMode(id, playerId, resolvedMode);
  if (!ok) return Response.json({ error: 'forbidden' }, { status: 403 });

  await pusher.trigger(`game-${id}`, 'mode-changed', { controlMode: resolvedMode });

  return Response.json({ ok: true });
}
