import type { GameHistoryItem } from "@/core/domain/profile";
import { HistoryRow } from "@/components/profile/history-row";

export function GameHistory({ games }: { games: GameHistoryItem[] }) {
  if (games.length === 0) {
    return (
      <p className="mt-4 rounded-2xl bg-slate-50 px-5 py-12 text-center text-neutral-500">
        ไม่พบประวัติการเล่นในช่วงเวลานี้
      </p>
    );
  }

  return (
    <ol className="mt-4 space-y-3">
      {games.map((game) => (
        <HistoryRow key={game.id} game={game} />
      ))}
    </ol>
  );
}
