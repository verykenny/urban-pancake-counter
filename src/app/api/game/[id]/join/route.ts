import type { NextRequest } from 'next/server';
import { addPlayer, getSession } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId, name } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    name?: string;
  };

  if (!playerId || !name?.trim()) {
    return Response.json({ error: 'playerId and name required' }, { status: 400 });
  }

  const result = addPlayer(id, playerId, name.trim());

  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : result.reason === 'full' ? 409 : 400;
    return Response.json({ error: result.reason }, { status });
  }

  const session = getSession(id)!;

  await pusher.trigger(`game-${id}`, 'player-joined', {
    players: session.players,
    hostPlayerId: session.hostPlayerId,
  });

  return Response.json({
    player: result.player,
    players: session.players,
    hostPlayerId: session.hostPlayerId,
    phase: session.phase,
  });
}
