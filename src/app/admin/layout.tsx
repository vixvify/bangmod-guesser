import type { ReactNode } from "react";
import { UserRole } from "@/features/users/domain/user";
import { MainLayout } from "@/shared/components/layout/main-layout";
import { requireAuth } from "@/features/auth/lib/auth-check";
import { roleCheck } from "@/shared/lib/role-check";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = roleCheck(await requireAuth(), [UserRole.ADMIN]);

  return (
    <MainLayout
      user={user}
      soundEnabled={false}
      variant="contained"
      brandColor="var(--color-secondary-dark)"
      className="relative min-h-svh bg-slate-50 text-secondary-dark"
    >
      {children}
    </MainLayout>
  );
}
