import { inkHex } from '@/lib/inkColors';

interface AvatarProps {
  avatarName: string | null;
  color: string;
  size: number;
}

function inkShape(name: string | null) {
  switch (name) {
    case 'amber':
      return <path d="M12 3L21 12L12 21L3 12Z" fill="currentColor" />;
    case 'amethyst':
      return <circle cx="12" cy="12" r="9" fill="currentColor" />;
    case 'emerald':
      return <path d="M12 3L19.8 16.5L4.2 16.5Z" fill="currentColor" />;
    case 'ruby':
      return <path d="M12 21L4.2 7.5L19.8 7.5Z" fill="currentColor" />;
    case 'sapphire':
      return <path d="M12 3L14.23 8.93L20.56 9.22L15.62 13.17L17.29 19.28L12 15.8L6.71 19.28L8.38 13.17L3.44 9.22L9.77 8.93Z" fill="currentColor" />;
    case 'steel':
      return <path d="M12 3L19.8 7.5L19.8 16.5L12 21L4.2 16.5L4.2 7.5Z" fill="currentColor" />;
    default:
      return <circle cx="12" cy="12" r="9" fill="currentColor" />;
  }
}

export default function Avatar({ avatarName, color, size }: AvatarProps) {
  const pipColor = inkHex(avatarName) ?? color;

  return (
    <span
      role="img"
      aria-label={avatarName ? `${avatarName} ink` : 'player'}
      className="flex shrink-0 items-center justify-center rounded-full bg-raised"
      style={{
        width: size,
        height: size,
        border: `2px solid ${pipColor}`,
        boxShadow: `0 0 12px ${pipColor}55`,
      }}
    >
      <svg
        width={Math.round(size * 0.5)}
        height={Math.round(size * 0.5)}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ color: pipColor }}
      >
        {inkShape(avatarName)}
      </svg>
    </span>
  );
}
