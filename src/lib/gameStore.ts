import { generateCode } from './generateCode';

interface SessionState {
  createdAt: number;
}

const sessions = new Map<string, SessionState>();

export function createSession(): string {
  let code = generateCode();
  while (sessions.has(code)) {
    code = generateCode();
  }
  sessions.set(code, { createdAt: Date.now() });
  return code;
}

export function sessionExists(code: string): boolean {
  return sessions.has(code);
}
