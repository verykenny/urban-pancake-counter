export const CHAMPIONS: string[] = [
  'Mickey Mouse',
  'Minnie Mouse',
  'Elsa',
  'Anna',
  'Stitch',
  'Maui',
  'Moana',
  'Mulan',
  'Ariel',
  'Belle',
  'Hades',
  'Maleficent',
  'Aladdin',
  'Jasmine',
  'Simba',
  'Scar',
  'Peter Pan',
  'Captain Hook',
  'Rapunzel',
  'Tiana',
  'Merida',
  'Genie',
];

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}
