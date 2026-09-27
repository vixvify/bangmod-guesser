import { HomeSections } from "@/components/home/home-sections";
import { LobbySection } from "@/components/home/lobby-section";
import { HomeLayout } from "@/layout/home-layout";
import { authCheck } from "@/lib/auth-check";

export default async function Page() {
  const user = await authCheck();

  return (
    <HomeLayout user={user}>
      <LobbySection />
      <HomeSections />
    </HomeLayout>
  );
}
