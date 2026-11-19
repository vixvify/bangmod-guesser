import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserRole } from "@/features/users/user";
import { MainLayout } from "@/shared/components/layout/main-layout";
import { requireAuth } from "@/features/auth/server/auth-check";
import { hasRole } from "@/shared/lib/role-check";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();
  if (!hasRole(user, [UserRole.ADMIN])) notFound();

  return (
    <MainLayout
      user={user}
      soundEnabled={false}
      variant="contained"
      brandColor="var(--color-surface-text)"
      className="relative min-h-svh bg-secondary-main text-surface-text"
    >
      {children}
    </MainLayout>
  );
}
