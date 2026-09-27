import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { User } from "@/core/domain/user";

type HomeLayoutProps = {
  children: ReactNode;
  user: User | null;
};

export function HomeLayout({ children, user }: HomeLayoutProps) {
  return (
    <main className="relative min-h-svh text-secondary-light">
      <Navbar user={user} />
      {children}
      <Footer />
    </main>
  );
}
