import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.6,
    viewBox: "0 0 24 24",
    ...props,
  };
}

export function SearchIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.6-4.6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowRightIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function ChevronRightIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ShieldCheckIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12.2l2.1 2.1L15.2 10" />
    </svg>
  );
}

export function DocumentCheckIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 14.2l1.8 1.8 3.2-3.6" />
    </svg>
  );
}

export function HandshakeIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M3 12l4-4 4 3 2-2 4 4" />
      <path d="M7 16l3 3 2-2 3 3 3-3" />
      <path d="M11 11l2 2" />
    </svg>
  );
}

export function BadgeIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.5L7.5 21l4.5-2.4L16.5 21 15 13.5" />
    </svg>
  );
}

export function GlobeIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.3 4 5.2 4 8.5s-1.4 6.2-4 8.5c-2.6-2.3-4-5.2-4-8.5s1.4-6.2 4-8.5z" />
    </svg>
  );
}

export function BoltIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5L5 13h5.5L10 21.5 19 11h-5.5L12 2.5z" />
    </svg>
  );
}

export function CompassIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

export function MailIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="14" rx="1.5" width="18" x="3" y="5" />
      <path d="M4 6.5l8 6 8-6" />
    </svg>
  );
}

export function CalendarIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="16" rx="1.5" width="18" x="3" y="5" />
      <path d="M3 9.5h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function MapPinIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
}
