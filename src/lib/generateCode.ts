const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCode(): string {
  return Array.from(
    { length: 6 },
    () => CHARSET[Math.floor(Math.random() * CHARSET.length)]
  ).join('');
}
