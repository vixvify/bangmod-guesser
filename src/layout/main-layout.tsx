import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { User } from "@/core/domain/user";

type MainLayoutProps = {
  children: ReactNode;
  user: User | null;
  navbarVariant?: "transparent" | "solid";
  className?: string;
};

export function MainLayout({
  children,
  user,
  navbarVariant = "transparent",
  className = "relative min-h-svh text-secondary-light",
}: MainLayoutProps) {
  return (
    <main className={className}>
      <Navbar user={user} variant={navbarVariant} />
      {children}
      <Footer />
    </main>
  );
}
