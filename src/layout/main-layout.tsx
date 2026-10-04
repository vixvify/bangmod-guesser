import type { ReactNode } from "react";
import { ContentContainer } from "@/components/layout/content-container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { User } from "@/core/domain/user";

type MainLayoutProps = {
  children: ReactNode;
  user: User | null;
  brandColor?: string;
  className?: string;
  variant?: "fullBleed" | "contained";
};

export function MainLayout({
  children,
  user,
  brandColor,
  className = "relative min-h-svh text-secondary-light",
  variant = "fullBleed",
}: MainLayoutProps) {
  return (
    <main className={`${className} flex flex-col`}>
      <Navbar user={user} brandColor={brandColor} />
      {variant === "contained" ? (
        <ContentContainer
          contentWidth="wide"
          className="pb-16 pt-24 sm:pt-28"
          data-layout-content="contained"
        >
          {children}
        </ContentContainer>
      ) : (
        children
      )}
      <Footer />
    </main>
  );
}
