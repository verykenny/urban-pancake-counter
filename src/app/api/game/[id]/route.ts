import type { NextRequest } from 'next/server';
import { sessionExists } from '@/lib/gameStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  if (sessionExists(id)) {
    return Response.json({ exists: true });
  }
  return Response.json({ exists: false }, { status: 404 });
}
