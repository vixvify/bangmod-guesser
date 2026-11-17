import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  theme?: "light" | "dark";
};

export function EmptyState({ title, description, icon, action, theme = "light" }: EmptyStateProps) {
  const isDark = theme === "dark";
  return (
    <section
      role="status"
      className={`flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center ${isDark ? "border-surface-border bg-surface-overlay" : "border-slate-200 bg-slate-50/70"}`}
    >
      <div className="mb-4 flex rounded-full bg-orange-50 p-4 text-primary-main" aria-hidden="true">
        {icon ?? <InboxOutlinedIcon fontSize="large" />}
      </div>
      <h2 className={`text-lg font-semibold ${isDark ? "text-surface-text" : "text-secondary-dark"}`}>{title}</h2>
      {description && <p className={`mt-2 max-w-md text-sm ${isDark ? "text-surface-muted" : "text-slate-500"}`}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
