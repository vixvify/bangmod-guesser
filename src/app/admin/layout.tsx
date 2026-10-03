import type { ReactNode } from "react";
import { UserRole } from "@/core/domain/user";
import { MainLayout } from "@/layout/main-layout";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = roleCheck(await requireAuth(), [UserRole.ADMIN]);

  return (
    <MainLayout
      user={user}
      variant="contained"
      brandColor="var(--color-secondary-dark)"
      className="relative min-h-svh bg-slate-50 text-secondary-dark"
    >
      {children}
    </MainLayout>
  );
}
