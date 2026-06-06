import { generateCode } from './generateCode';

interface SessionState {
  createdAt: number;
  hostPlayerId: string | null;
}

const sessions = new Map<string, SessionState>();

export function createSession(): string {
  let code = generateCode();
  while (sessions.has(code)) {
    code = generateCode();
  }
  sessions.set(code, { createdAt: Date.now(), hostPlayerId: null });
  return code;
}

export function sessionExists(code: string): boolean {
  return sessions.has(code);
}

export function setHost(code: string, playerId: string): void {
  const session = sessions.get(code);
  if (!session || session.hostPlayerId) return;
  session.hostPlayerId = playerId;
}
