import { redirect } from "next/navigation";
import { GameSession } from "@/components/game/game-session";
import { authCheck } from "@/lib/auth-check";
import { AppRoutes } from "@/routes/app/routes";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const user = await authCheck();

  if (!user) {
    redirect(AppRoutes.login);
  }

  return <GameSession key={gameId} gameId={gameId} />;
}

