import type { ReactNode } from "react";
import { ContentContainer } from "@/components/layout/content-container";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { NavigationGuardProvider } from "@/hooks/use-navigation-guard";
import type { User } from "@/core/domain/user";

type MainLayoutProps = {
  children: ReactNode;
  user: User | null;
  brandColor?: string;
  className?: string;
  variant?: "fullBleed" | "contained";
  soundEnabled?: boolean;
};

export function MainLayout({
  children,
  user,
  brandColor,
  className = "relative min-h-svh text-secondary-light",
  variant = "fullBleed",
  soundEnabled = true,
}: MainLayoutProps) {
  return (
    <div className={`${className} flex flex-col`}>
      <NavigationGuardProvider>
        <Navbar user={user} brandColor={brandColor} soundEnabled={soundEnabled} />
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
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
        </main>
      </NavigationGuardProvider>
      <Footer />
    </div>
  );
}
