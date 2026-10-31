import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import type { DashboardSummary } from "@/core/domain/dashboard";

const format = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(value);

function change(value: number | null) {
  if (value === null) return "ไม่มีข้อมูลช่วงก่อนหน้า";
  return `${value > 0 ? "+" : ""}${format(value)}% จากช่วงก่อน`;
}

export function DashboardStats({ summary }: { summary: DashboardSummary }) {
  const cards = [
    {
      title: "เกมที่เล่นทั้งหมด",
      value: format(summary.totalGames.count),
      suffix: "เกม",
      detail: change(summary.totalGames.changePercent),
      foot: "เทียบกับช่วงก่อนหน้า",
      icon: <SportsEsportsOutlinedIcon />,
    },
    {
      title: "ผู้เล่นวันนี้",
      value: format(summary.players.count),
      suffix: "คน",
      detail: change(summary.players.changePercent),
      foot: `กำลังเล่น ${format(summary.players.playing)} คน`,
      icon: <PeopleOutlineRoundedIcon />,
    },
    {
      title: "คะแนนเฉลี่ย / รอบ",
      value:
        summary.roundAverage.score === null
          ? "—"
          : format(summary.roundAverage.score),
      suffix: `/ ${format(summary.roundAverage.maxScore)}`,
      detail:
        summary.roundAverage.percentage === null
          ? "ยังไม่มีคะแนน"
          : `${format(summary.roundAverage.percentage)}% ของคะแนนเต็ม`,
      foot: `จาก ${format(summary.roundAverage.count)} รอบ`,
      icon: <TrackChangesOutlinedIcon />,
    },
    {
      title: "อัตราการออกกลางคัน",
      value: `${format(summary.dropOff.ratePercent)}%`,
      suffix: "",
      detail:
        summary.dropOff.differencePercentagePoints === null
          ? "ยังไม่มีค่าเปรียบเทียบ"
          : `${summary.dropOff.differencePercentagePoints > 0 ? "+" : ""}${format(summary.dropOff.differencePercentagePoints)} จุดจากค่าเฉลี่ย`,
      foot: `${format(summary.dropOff.count)} เกมที่ไม่จบ`,
      icon: <ExitToAppOutlinedIcon />,
    },
  ];

  return (
    <section
      aria-label="สถิติภาพรวม"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-600">
              {card.title}
            </h2>
            <span
              aria-hidden="true"
              className="rounded-lg bg-orange-50 p-2 text-primary-main"
            >
              {card.icon}
            </span>
          </div>
          <p className="mt-3 flex items-baseline gap-2 text-3xl font-bold tabular-nums text-secondary-dark">
            {card.value}
            <span className="text-sm font-medium text-slate-500">
              {card.suffix}
            </span>
          </p>
          <p className="mt-2 text-xs font-semibold text-orange-700">
            {card.detail}
          </p>
          <p className="mt-1 text-xs text-slate-500">{card.foot}</p>
        </article>
      ))}
    </section>
  );
}
