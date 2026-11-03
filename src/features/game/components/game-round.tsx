type GameRoundProps = {
  round: number;
};

export function GameRound({ round }: GameRoundProps) {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-xl border border-primary-main/50 bg-primary-main/10 px-4 py-2 font-semibold text-secondary-light backdrop-blur-sm">
      <span className="text-xs tracking-wide">ข้อที่</span>
      <span className="text-2xl font-bold tracking-wider tabular-nums text-primary-main">
        {round}
      </span>
    </p>
  );
}
