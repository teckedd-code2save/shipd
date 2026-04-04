import type { CSSProperties } from "react";

interface IconProps {
  size?: number;
  style?: CSSProperties;
  className?: string;
}

function iconProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...(className ? { className } : {})
  };
}

export function ArrowLeftIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function ArrowUpRightIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function SparklesIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M5 3v3" />
      <path d="M3.5 4.5h3" />
      <path d="M19 17v4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export function GitHubIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M9 18c-4.5 1.5-4.5-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.7A5.2 5.2 0 0 0 18.8 4S17.7 3.7 15 5.5a11.5 11.5 0 0 0-6 0C6.3 3.7 5.2 4 5.2 4A5.2 5.2 0 0 0 4 7.8c0 5.2 3.1 6.4 6.1 6.7a3.4 3.4 0 0 0-.9 2.6V21" />
    </svg>
  );
}

export function SearchIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ScanIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M4 7V5.5A1.5 1.5 0 0 1 5.5 4H7" />
      <path d="M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7" />
      <path d="M20 17v1.5a1.5 1.5 0 0 1-1.5 1.5H17" />
      <path d="M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17" />
      <path d="M7 12h10" />
      <path d="M7 9h10" />
      <path d="M7 15h6" />
    </svg>
  );
}

export function ChartIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M4 20V8" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20V10" />
    </svg>
  );
}

export function FileIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

export function SendIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}

export function RefreshIcon({ size = 18, style }: IconProps) {
  return (
    <svg {...iconProps(size)} style={style}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function CheckIcon({ size = 18, style, className }: IconProps) {
  return (
    <svg {...iconProps(size, className)} style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 18, style, className }: IconProps) {
  return (
    <svg {...iconProps(size, className)} style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function TerminalIcon({ size = 18, style, className }: IconProps) {
  return (
    <svg {...iconProps(size, className)} style={style}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
