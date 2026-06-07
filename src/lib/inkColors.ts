export interface InkColor {
  key: string;
  label: string;
  hex: string;
}

export const INK_COLORS: InkColor[] = [
  { key: 'amber',    label: 'Amber',    hex: '#F59E0B' },
  { key: 'amethyst', label: 'Amethyst', hex: '#7C3AED' },
  { key: 'emerald',  label: 'Emerald',  hex: '#059669' },
  { key: 'ruby',     label: 'Ruby',     hex: '#DC2626' },
  { key: 'sapphire', label: 'Sapphire', hex: '#2563EB' },
  { key: 'steel',    label: 'Steel',    hex: '#94A3B8' },
];

export function inkHex(key: string | null): string | null {
  if (!key) return null;
  return INK_COLORS.find((c) => c.key === key)?.hex ?? null;
}
