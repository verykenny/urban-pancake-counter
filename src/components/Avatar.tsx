import { initialsOf } from '@/lib/champions';

interface AvatarProps {
  name: string;
  avatarName: string | null;
  color: string;
  size: number;
}

export default function Avatar({ name, avatarName, color, size }: AvatarProps) {
  const initials = initialsOf(avatarName ?? name);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-ink-mid font-bold uppercase text-star-white"
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}`,
        fontSize: Math.round(size * 0.38),
        boxShadow: `0 0 12px ${color}55`,
      }}
    >
      {initials}
    </span>
  );
}
