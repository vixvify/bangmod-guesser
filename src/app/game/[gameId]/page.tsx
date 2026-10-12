import { GameSession } from "@/components/game/game-session";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return <GameSession key={gameId} />;
}
