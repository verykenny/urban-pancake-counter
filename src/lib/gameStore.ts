import { generateCode } from './generateCode';

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface GameState {
  createdAt: number;
  hostPlayerId: string;
  players: Player[];
  phase: 'lobby' | 'playing';
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const sessions = new Map<string, GameState>();

export function createSession(hostPlayerId: string): string {
  let code = generateCode();
  while (sessions.has(code)) {
    code = generateCode();
  }
  sessions.set(code, {
    createdAt: Date.now(),
    hostPlayerId,
    players: [],
    phase: 'lobby',
  });
  return code;
}

export function sessionExists(code: string): boolean {
  return sessions.has(code);
}

export function getSession(code: string): GameState | undefined {
  return sessions.get(code);
}

export function addPlayer(
  code: string,
  playerId: string,
  name: string
): { ok: true; player: Player } | { ok: false; reason: 'not_found' | 'full' | 'already_joined' } {
  const session = sessions.get(code);
  if (!session) return { ok: false, reason: 'not_found' };
  if (session.players.some((p) => p.id === playerId)) return { ok: false, reason: 'already_joined' };
  if (session.players.length >= 4) return { ok: false, reason: 'full' };
  const player: Player = {
    id: playerId,
    name,
    score: 0,
    color: COLORS[session.players.length],
  };
  session.players.push(player);
  return { ok: true, player };
}

export function startGame(code: string, requestingPlayerId: string): boolean {
  const session = sessions.get(code);
  if (!session) return false;
  if (session.hostPlayerId !== requestingPlayerId) return false;
  if (session.players.length < 2) return false;
  session.phase = 'playing';
  return true;
}

export function updateScore(code: string, playerId: string, delta: number): number | null {
  const session = sessions.get(code);
  if (!session) return null;
  const player = session.players.find((p) => p.id === playerId);
  if (!player) return null;
  player.score = Math.max(0, player.score + delta);
  return player.score;
}
