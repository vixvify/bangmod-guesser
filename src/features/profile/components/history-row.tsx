import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import type { GameHistoryItem } from "@/features/profile/profile";
import { formatThaiDateTime } from "@/shared/lib/utils";

const numberFormatter = new Intl.NumberFormat("en-US");

export function HistoryRow({ game }: { game: GameHistoryItem }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface-overlay p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${game.status === "COMPLETED" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
            {game.status === "COMPLETED" ? "เล่นจบแล้ว" : "ออกกลางคัน"}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-surface-muted sm:text-sm">
          <AccessTimeOutlinedIcon sx={{ fontSize: "1rem" }} aria-hidden="true" />
          <time dateTime={game.playedAt}>{formatThaiDateTime(game.playedAt)}</time>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-surface-border pt-3 text-right sm:min-w-80 sm:border-0 sm:pt-0">
        <div>
          <p className="text-xs text-surface-muted">คะแนนรวม</p>
          <p className="text-lg font-bold text-primary-light">
            {game.totalScore === null ? "—" : numberFormatter.format(game.totalScore)}
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-muted">รอบดีที่สุด</p>
          <p className="text-sm font-semibold text-surface-text">
            {game.bestRoundScore === undefined
              ? "—"
              : numberFormatter.format(game.bestRoundScore)}
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-muted">ทายใกล้ที่สุด</p>
          <p className="text-sm font-semibold text-surface-text">
            {game.bestDistanceMeters === undefined
              ? "—"
              : `${game.bestDistanceMeters.toFixed(1)} ม.`}
          </p>
        </div>
      </div>
    </li>
  );
}
