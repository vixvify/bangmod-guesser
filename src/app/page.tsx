import { CreditsSection } from "@/components/home/credits-section";
import { HowToPlaySection } from "@/components/home/how-to-play-section";
import { IntroSection } from "@/components/home/intro-section";
import { LobbySection } from "@/components/home/lobby-section";
import { MainLayout } from "@/layout/main-layout";
import { authCheck } from "@/lib/auth-check";

export default async function Page() {
  const user = await authCheck();

  return (
    <MainLayout user={user}>
      <LobbySection />
      <IntroSection />
      <HowToPlaySection />
      <CreditsSection />
    </MainLayout>
  );
}
