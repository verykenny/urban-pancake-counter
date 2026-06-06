import type { NextRequest } from 'next/server';
import { createSession } from '@/lib/gameStore';

export async function POST(req: NextRequest): Promise<Response> {
  const { playerId } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
  };
  if (!playerId) return Response.json({ error: 'playerId required' }, { status: 400 });
  const code = createSession(playerId);
  return Response.json({ code }, { status: 201 });
}
