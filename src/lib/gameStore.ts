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
  controlMode: 'host' | 'self';
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
    controlMode: 'self',
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

export function startGame(code: string, requestingPlayerId: string, controlMode: 'host' | 'self'): boolean {
  const session = sessions.get(code);
  if (!session) return false;
  if (session.hostPlayerId !== requestingPlayerId) return false;
  if (session.players.length < 2) return false;
  session.phase = 'playing';
  session.controlMode = controlMode;
  return true;
}

export function setControlMode(
  code: string,
  requestingPlayerId: string,
  controlMode: 'host' | 'self'
): boolean {
  const session = sessions.get(code);
  if (!session) return false;
  if (session.hostPlayerId !== requestingPlayerId) return false;
  session.controlMode = controlMode;
  return true;
}

type UpdateScoreResult =
  | { ok: true; score: number }
  | { ok: false; reason: 'not_found' | 'unauthorized' };

export function updateScore(
  code: string,
  targetPlayerId: string,
  requestingPlayerId: string,
  delta: number
): UpdateScoreResult {
  const session = sessions.get(code);
  if (!session) return { ok: false, reason: 'not_found' };
  const player = session.players.find((p) => p.id === targetPlayerId);
  if (!player) return { ok: false, reason: 'not_found' };

  const authorized =
    session.controlMode === 'host'
      ? requestingPlayerId === session.hostPlayerId
      : requestingPlayerId === targetPlayerId;
  if (!authorized) return { ok: false, reason: 'unauthorized' };

  player.score = Math.max(0, player.score + delta);
  return { ok: true, score: player.score };
}
