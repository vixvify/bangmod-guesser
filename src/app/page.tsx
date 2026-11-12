import { CreditsSection } from "@/features/home/components/credits-section";
import { HowToPlaySection } from "@/features/home/components/how-to-play-section";
import { IntroSection } from "@/features/home/components/intro-section";
import { LobbySection } from "@/features/home/components/lobby-section";
import { MainLayout } from "@/shared/components/layout/main-layout";
import { authCheck } from "@/features/auth/server/auth-check";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Page() {
  const user = await authCheck();

  return (
    <MainLayout user={user} variant="fullBleed">
      <LobbySection />
      <IntroSection />
      <HowToPlaySection />
      <CreditsSection />
    </MainLayout>
  );
}
