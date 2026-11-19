import type { ReactNode } from "react";

const tones = {
  positive: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  caution: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  negative: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  neutral: "border-surface-border bg-surface-control text-surface-muted",
  accent: "border-primary-main/30 bg-primary-main/10 text-primary-light",
} as const;

export function TableBadge({ children, tone }: { children: ReactNode; tone: keyof typeof tones }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}
