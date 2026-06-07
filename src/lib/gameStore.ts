import { generateCode } from './generateCode';
import redis from './redis';

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
  delegations: Record<string, string | null>;
  winner: string | null;
  loreTarget: number;
}

const WIN_SCORE = 20;

function clampLoreTarget(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return WIN_SCORE;
  return Math.min(200, Math.max(1, Math.round(value)));
}
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
const SESSION_TTL = 86400; // 24 hours in seconds

function key(code: string): string {
  return `session:${code}`;
}

export async function createSession(hostPlayerId: string): Promise<string> {
  let code = generateCode();
  while ((await redis.exists(key(code))) === 1) {
    code = generateCode();
  }
  const state: GameState = {
    createdAt: Date.now(),
    hostPlayerId,
    players: [],
    phase: 'lobby',
    controlMode: 'self',
    delegations: {},
    winner: null,
    loreTarget: WIN_SCORE,
  };
  await redis.set(key(code), state, { ex: SESSION_TTL });
  return code;
}

export async function getSession(code: string): Promise<GameState | null> {
  return redis.get<GameState>(key(code));
}

export async function addPlayer(
  code: string,
  playerId: string,
  name: string
): Promise<
  | { ok: true; player: Player; session: GameState }
  | { ok: false; reason: 'not_found' | 'full' | 'already_joined' }
> {
  const session = await redis.get<GameState>(key(code));
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
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return { ok: true, player, session };
}

export async function startGame(
  code: string,
  requestingPlayerId: string,
  controlMode: 'host' | 'self',
  loreTarget?: number
): Promise<{ ok: true; session: GameState } | { ok: false }> {
  const session = await redis.get<GameState>(key(code));
  if (!session) return { ok: false };
  if (session.hostPlayerId !== requestingPlayerId) return { ok: false };
  if (session.players.length < 2) return { ok: false };
  session.phase = 'playing';
  session.controlMode = controlMode;
  session.loreTarget = clampLoreTarget(loreTarget);
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return { ok: true, session };
}

export async function setControlMode(
  code: string,
  requestingPlayerId: string,
  controlMode: 'host' | 'self'
): Promise<boolean> {
  const session = await redis.get<GameState>(key(code));
  if (!session) return false;
  if (session.hostPlayerId !== requestingPlayerId) return false;
  session.controlMode = controlMode;
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return true;
}

type UpdateScoreResult =
  | { ok: true; score: number; winner: string | null }
  | { ok: false; reason: 'not_found' | 'unauthorized' | 'board_locked' };

export async function updateScore(
  code: string,
  targetPlayerId: string,
  requestingPlayerId: string,
  delta: number
): Promise<UpdateScoreResult> {
  const session = await redis.get<GameState>(key(code));
  if (!session) return { ok: false, reason: 'not_found' };
  if (session.winner !== null) return { ok: false, reason: 'board_locked' };
  const player = session.players.find((p) => p.id === targetPlayerId);
  if (!player) return { ok: false, reason: 'not_found' };

  const authorized =
    session.controlMode === 'host'
      ? requestingPlayerId === session.hostPlayerId
      : requestingPlayerId === targetPlayerId ||
        session.delegations[targetPlayerId] === requestingPlayerId;
  if (!authorized) return { ok: false, reason: 'unauthorized' };

  player.score = Math.max(0, player.score + delta);
  if (player.score >= (session.loreTarget ?? WIN_SCORE)) {
    session.winner = player.id;
  }
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return { ok: true, score: player.score, winner: session.winner };
}

export async function resetGame(
  code: string,
  requestingPlayerId: string
): Promise<{ ok: true; session: GameState } | { ok: false; reason: 'not_found' | 'unauthorized' }> {
  const session = await redis.get<GameState>(key(code));
  if (!session) return { ok: false, reason: 'not_found' };
  if (session.hostPlayerId !== requestingPlayerId) return { ok: false, reason: 'unauthorized' };
  session.winner = null;
  for (const player of session.players) {
    player.score = 0;
  }
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return { ok: true, session };
}

export async function transferHost(
  code: string,
  requestingPlayerId: string,
  newHostPlayerId: string
): Promise<boolean> {
  const session = await redis.get<GameState>(key(code));
  if (!session) return false;
  if (session.hostPlayerId !== requestingPlayerId) return false;
  if (!session.players.some((p) => p.id === newHostPlayerId)) return false;
  session.hostPlayerId = newHostPlayerId;
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return true;
}

type SetDelegationResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'not_allowed' | 'invalid_delegate' };

export async function setDelegation(
  code: string,
  playerId: string,
  delegatePlayerId: string | null
): Promise<SetDelegationResult> {
  const session = await redis.get<GameState>(key(code));
  if (!session) return { ok: false, reason: 'not_found' };
  if (session.controlMode !== 'self') return { ok: false, reason: 'not_allowed' };
  if (!session.players.some((p) => p.id === playerId)) return { ok: false, reason: 'not_found' };
  if (
    delegatePlayerId !== null &&
    (delegatePlayerId === playerId || !session.players.some((p) => p.id === delegatePlayerId))
  ) {
    return { ok: false, reason: 'invalid_delegate' };
  }
  session.delegations[playerId] = delegatePlayerId;
  await redis.set(key(code), session, { ex: SESSION_TTL });
  return { ok: true };
}
