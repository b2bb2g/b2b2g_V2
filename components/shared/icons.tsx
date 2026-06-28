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

export function GridIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="7" rx="1.4" width="7" x="3.5" y="3.5" />
      <rect height="7" rx="1.4" width="7" x="13.5" y="3.5" />
      <rect height="7" rx="1.4" width="7" x="3.5" y="13.5" />
      <rect height="7" rx="1.4" width="7" x="13.5" y="13.5" />
    </svg>
  );
}

export function BuildingIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="17" rx="1.2" width="11" x="4" y="3.5" />
      <path d="M9.5 8h2M9.5 11.5h2M9.5 15h2" />
      <path d="M15 9.5h4.5v11H15" />
    </svg>
  );
}

export function BoxIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 8l8.5-4.5L20.5 8 12 12.5 3.5 8z" />
      <path d="M3.5 8v8.3L12 20.8l8.5-4.5V8" />
      <path d="M12 12.5v8.3" />
    </svg>
  );
}

export function PulseIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M3 12h3.5l2-5 4 10 2-7.5 1.7 2.5H21" />
    </svg>
  );
}

export function UserCircleIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10.2" r="2.6" />
      <path d="M6.3 18.2c1.2-2.2 3.2-3.4 5.7-3.4s4.5 1.2 5.7 3.4" />
    </svg>
  );
}

export function UsersIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 18.5c.9-2.8 2.9-4.3 5.5-4.3s4.6 1.5 5.5 4.3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.5c2.1.1 3.6 1.4 4.3 3.7" />
    </svg>
  );
}

export function DatabaseIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
      <path d="M4.5 6v12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6" />
      <path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
    </svg>
  );
}

export function BriefcaseIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="13.5" rx="2" width="18" x="3" y="7" />
      <path d="M9 7V5.8C9 4.8 9.8 4 10.8 4h2.4C14.2 4 15 4.8 15 5.8V7" />
      <path d="M3 11.8h18" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function CalendarDaysIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="16" rx="2" width="18" x="3" y="5" />
      <path d="M3 9.5h18" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M8 13h.1M12 13h.1M16 13h.1M8 17h.1M12 17h.1" />
    </svg>
  );
}

export function ExchangeIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M7 7h10" />
      <path d="M14 4l3 3-3 3" />
      <path d="M17 17H7" />
      <path d="M10 14l-3 3 3 3" />
    </svg>
  );
}

export function GearIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.2 13.3c.1-.4.1-.8.1-1.3s0-.9-.1-1.3l1.8-1.4-1.8-3-2.2.9c-.7-.5-1.3-.8-2.1-1.1L14.6 4h-5.2l-.3 2.1c-.8.3-1.5.7-2.1 1.1l-2.2-.9-1.8 3 1.8 1.4c-.1.4-.1.8-.1 1.3s0 .9.1 1.3l-1.8 1.4 1.8 3 2.2-.9c.7.5 1.3.8 2.1 1.1l.3 2.1h5.2l.3-2.1c.8-.3 1.5-.7 2.1-1.1l2.2.9 1.8-3-1.8-1.4z" />
    </svg>
  );
}

export function LayoutPanelIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="17" rx="2" width="18" x="3" y="4" />
      <path d="M3 9h18" />
      <path d="M9 9v12" />
      <path d="M13 13h4" />
      <path d="M13 17h4" />
    </svg>
  );
}

export function NetworkNodesIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <circle cx="6" cy="7" r="2.4" />
      <circle cx="18" cy="7" r="2.4" />
      <circle cx="12" cy="17" r="2.4" />
      <path d="M8.2 8.2l2.9 6.6" />
      <path d="M15.8 8.2l-2.9 6.6" />
      <path d="M8.4 7h7.2" />
    </svg>
  );
}

export function ProjectBoardIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M8 4v16" />
      <path d="M16 4v16" />
      <rect height="3.5" rx=".8" width="3" x="4.6" y="7" />
      <rect height="3.5" rx=".8" width="3" x="10.5" y="12" />
      <rect height="3.5" rx=".8" width="3" x="16.4" y="8.5" />
    </svg>
  );
}

export function ServiceDeskIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M7 4h10v5.5H7z" />
      <path d="M5 20h14" />
      <path d="M8 20l1.2-10.5h5.6L16 20" />
      <path d="M10 7h4" />
      <path d="M8.5 14h7" />
    </svg>
  );
}

export function MenuIcon(props: Readonly<IconProps>) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}
