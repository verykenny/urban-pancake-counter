import { assignInk } from '@/lib/inkColors';

export interface TablePlayer {
  id: string;
  score: number;
  color: string;
  avatarName: string;
}

export function buildTablePlayers(count: number): TablePlayer[] {
  const players: TablePlayer[] = [];
  for (let i = 0; i < count; i++) {
    const ink = assignInk(null, players.map((p) => p.avatarName));
    players.push({ id: crypto.randomUUID(), score: 0, color: ink.hex, avatarName: ink.key });
  }
  return players;
}
