import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NavigationGuardProvider } from "@/shared/hooks/use-navigation-guard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function GameRoutesLayout({ children }: { children: ReactNode }) {
  return <NavigationGuardProvider>{children}</NavigationGuardProvider>;
}
