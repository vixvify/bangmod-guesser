import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
