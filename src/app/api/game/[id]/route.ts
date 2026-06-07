import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/gameStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const session = await getSession(id);
  if (session) {
    return Response.json({
      players: session.players,
      hostPlayerId: session.hostPlayerId,
      phase: session.phase,
      controlMode: session.controlMode,
      delegations: session.delegations,
      winner: session.winner,
      loreTarget: session.loreTarget,
    });
  }
  return Response.json({ exists: false }, { status: 404 });
}
