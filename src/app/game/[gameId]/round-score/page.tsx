import { GameRoundScoreScreen } from "@/features/game/components/game-round-score-screen";
import { requireAuth } from "@/features/auth/server/auth-check";
import { QuestionNumberSchema } from "@/features/game/game.schema";
import { notFound } from "next/navigation";

export default async function RoundScorePage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ round?: string }>;
}) {
  const { gameId } = await params;
  await requireAuth();

  const round = QuestionNumberSchema.safeParse((await searchParams).round);
  if (!round.success) notFound();
  return <GameRoundScoreScreen gameId={gameId} questionNumber={round.data} />;
}

