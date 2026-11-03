import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <section
      role="status"
      className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center"
    >
      <div className="mb-4 flex rounded-full bg-orange-50 p-4 text-primary-main" aria-hidden="true">
        {icon ?? <InboxOutlinedIcon fontSize="large" />}
      </div>
      <h2 className="text-lg font-semibold text-secondary-dark">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
