import { NextRequest, NextResponse } from "next/server";
import pusher from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { gameId, playerId, score } = await req.json();

  await pusher.trigger(`game-${gameId}`, "score-update", { playerId, score });

  return NextResponse.json({ ok: true });
}
