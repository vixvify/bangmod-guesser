import type { GameHistoryItem } from "@/features/profile/profile";
import { HistoryRow } from "@/features/profile/components/history-row";

export function GameHistory({ games }: { games: GameHistoryItem[] }) {
  if (games.length === 0) {
    return (
      <p className="mt-4 rounded-2xl border border-surface-border bg-surface-overlay px-5 py-12 text-center text-surface-muted">
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
