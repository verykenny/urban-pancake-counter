import { createSession } from '@/lib/gameStore';

export async function POST(): Promise<Response> {
  const code = createSession();
  return Response.json({ code }, { status: 201 });
}
