export interface InkColor {
  key: string;
  label: string;
  hex: string;
}

/* Hexes are brightened from the canonical card colors so every ink holds
   ≥3:1 against the dark surface ramp at score-numeral sizes (worst case:
   amethyst 3.8:1 on --surface). */
export const INK_COLORS: InkColor[] = [
  { key: 'amber',    label: 'Amber',    hex: '#F59E0B' },
  { key: 'amethyst', label: 'Amethyst', hex: '#8B5CF6' },
  { key: 'emerald',  label: 'Emerald',  hex: '#10B981' },
  { key: 'ruby',     label: 'Ruby',     hex: '#EF4444' },
  { key: 'sapphire', label: 'Sapphire', hex: '#3B82F6' },
  { key: 'steel',    label: 'Steel',    hex: '#94A3B8' },
];

export function inkHex(key: string | null): string | null {
  if (!key) return null;
  return INK_COLORS.find((c) => c.key === key)?.hex ?? null;
}

export function inkLabel(key: string | null): string {
  return INK_COLORS.find((c) => c.key === key)?.label ?? 'Player';
}

export function assignInk(
  requested: string | null,
  taken: (string | null)[]
): InkColor {
  const takenKeys = new Set(taken);
  if (requested && !takenKeys.has(requested)) {
    const match = INK_COLORS.find((c) => c.key === requested);
    if (match) return match;
  }
  return INK_COLORS.find((c) => !takenKeys.has(c.key)) ?? INK_COLORS[0];
}
