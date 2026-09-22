import { CreditsSection } from "@/components/home/credits-section";
import { HowToPlaySection } from "@/components/home/how-to-play-section";
import { IntroSection } from "@/components/home/intro-section";

export { CreditsSection, HowToPlaySection, IntroSection };

export function HomeSections() {
  return (
    <>
      <IntroSection />
      <HowToPlaySection />
      <CreditsSection />
    </>
  );
}
