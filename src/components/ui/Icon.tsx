type IconId =
  | "bluesky-icon"
  | "discord-icon"
  | "documentation-icon"
  | "github-icon"
  | "social-icon"
  | "x-icon";

interface IconProps {
  id: IconId;
  size?: number;
  className?: string;
}

export default function Icon({ id, size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}
