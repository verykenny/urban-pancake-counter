import { inkHex } from '@/lib/inkColors';

interface AvatarProps {
  avatarName: string | null;
  color: string;
  size: number;
}

export default function Avatar({ avatarName, color, size }: AvatarProps) {
  const pipColor = inkHex(avatarName) ?? color;

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-ink-mid"
      style={{
        width: size,
        height: size,
        border: `2px solid ${pipColor}`,
        boxShadow: `0 0 12px ${pipColor}55`,
      }}
    >
      <svg
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        viewBox="0 0 36 51"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: pipColor, fillRule: 'evenodd', clipRule: 'evenodd' }}
      >
        <g transform="matrix(1,0,0,1,-667.223,-730.659)">
          <g transform="matrix(1,0,0,1,0.0725875,4.84594)">
            <path
              d="M684.751,776.316C679.531,766.153 669.424,759.951 667.532,758.854C667.459,758.814 667.41,758.741 667.399,758.659C667.388,758.576 667.417,758.494 667.477,758.436C683.783,742.652 684.746,725.813 684.746,725.813C684.917,727.005 686.442,743.26 702.414,758.679C702.414,758.679 690.568,765.125 684.819,776.449L684.751,776.316Z"
              fill="currentColor"
            />
          </g>
          <g transform="matrix(1,0,0,1.11562,664.022,727.435)">
            <path
              d="M20.869,20.054L30.256,31.618L20.869,38.066L11.73,31.618L20.869,20.054Z"
              fill="currentColor"
              style={{ filter: 'invert(100%)' }}
            />
          </g>
        </g>
      </svg>
    </span>
  );
}
