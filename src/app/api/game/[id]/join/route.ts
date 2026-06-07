import type { NextRequest } from 'next/server';
import { addPlayer } from '@/lib/gameStore';
import pusher from '@/lib/pusher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { playerId, name, avatarName } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
    name?: string;
    avatarName?: string | null;
  };

  if (!playerId || !name?.trim()) {
    return Response.json({ error: 'playerId and name required' }, { status: 400 });
  }

  const result = await addPlayer(id, playerId, name.trim(), avatarName ?? null);

  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : result.reason === 'full' ? 409 : 400;
    return Response.json({ error: result.reason }, { status });
  }

  await pusher.trigger(`game-${id}`, 'player-joined', {
    players: result.session.players,
    hostPlayerId: result.session.hostPlayerId,
  });

  return Response.json({
    player: result.player,
    players: result.session.players,
    hostPlayerId: result.session.hostPlayerId,
    phase: result.session.phase,
    controlMode: result.session.controlMode,
    delegations: result.session.delegations,
  });
}
