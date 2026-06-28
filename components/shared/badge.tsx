import type { ReactNode } from "react";

export type BadgeTone = "negative" | "neutral" | "info" | "positive" | "warning";

const toneClass: Record<BadgeTone, string> = {
  info: "badge-info",
  negative: "badge-negative",
  neutral: "badge-neutral",
  positive: "badge-positive",
  warning: "badge-warning",
};

const STATUS_TONES: Record<string, BadgeTone> = {
  active: "positive",
  approved: "positive",
  blocked: "negative",
  completed: "positive",
  draft: "neutral",
  in_progress: "info",
  inactive: "neutral",
  pending: "warning",
  quoted: "info",
  rejected: "negative",
  reviewing: "warning",
  submitted: "info",
  suspended: "negative",
  waiting_documents: "warning",
};

export function toneForStatus(value: string | null | undefined): BadgeTone {
  if (!value) {
    return "neutral";
  }

  return STATUS_TONES[value] ?? "neutral";
}

export function Badge({
  children,
  dot = true,
  tone = "neutral",
}: Readonly<{
  children: ReactNode;
  dot?: boolean;
  tone?: BadgeTone;
}>) {
  return (
    <span className={`badge ${toneClass[tone]}`}>
      {dot ? <span className="badge-dot" /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({
  label,
  value,
}: Readonly<{
  label?: string | null;
  value: string | null | undefined;
}>) {
  if (!value) {
    return null;
  }

  return <Badge tone={toneForStatus(value)}>{label ?? value}</Badge>;
}
