import type { NextRequest } from 'next/server';
import { createSession, setHost } from '@/lib/gameStore';

export async function POST(req: NextRequest): Promise<Response> {
  const { playerId } = (await req.json().catch(() => ({}))) as {
    playerId?: string;
  };
  const code = createSession();
  if (playerId) setHost(code, playerId);
  return Response.json({ code }, { status: 201 });
}
