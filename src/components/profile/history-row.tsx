import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import type { GameHistoryItem } from "@/core/domain/profile";
import { formatThaiDateTime } from "@/utils/format-date";

const numberFormatter = new Intl.NumberFormat("en-US");

export function HistoryRow({ game }: { game: GameHistoryItem }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-bold text-secondary-dark">
            #{game.id}
          </span>
          <span className="rounded-md bg-primary-main/10 px-2 py-1 text-xs font-semibold text-primary-main">
            เล่นจบแล้ว
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
          <AccessTimeOutlinedIcon sx={{ fontSize: "1rem" }} aria-hidden="true" />
          <time dateTime={game.playedAt}>{formatThaiDateTime(game.playedAt)}</time>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-3 text-right sm:min-w-80 sm:border-0 sm:pt-0">
        <div>
          <p className="text-xs text-neutral-500">คะแนนรวม</p>
          <p className="text-lg font-bold text-secondary-dark">
            {numberFormatter.format(game.totalScore)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">รอบดีที่สุด</p>
          <p className="text-sm font-semibold text-secondary-dark">
            {game.bestRoundScore === undefined
              ? "—"
              : numberFormatter.format(game.bestRoundScore)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">ทายใกล้ที่สุด</p>
          <p className="text-sm font-semibold text-secondary-dark">
            {game.bestDistanceMeters === undefined
              ? "—"
              : `${game.bestDistanceMeters.toFixed(1)} ม.`}
          </p>
        </div>
      </div>
    </li>
  );
}
