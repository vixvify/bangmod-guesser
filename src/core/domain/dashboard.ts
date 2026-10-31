export type DashboardGameStatus = "PLAYING" | "COMPLETED" | "INCOMPLETE";

export type DashboardDateRange = { start: Date; endExclusive: Date };
export type DashboardGameCounts = { total: number; incomplete: number };

export type DashboardPeriod = {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  timeZone: string;
};

export type DashboardScoreBucket = {
  min: number;
  max: number;
  maxInclusive: boolean;
  count: number;
  percentage: number;
};

export type DashboardGameLog = {
  id: string;
  user: { id: string; name: string };
  status: DashboardGameStatus;
  startedAt: string;
  finishedAt: string | null;
  totalScore: number | null;
  roundScoreTotal: number;
  bonusScore: null;
  rounds: {
    questionNumber: number;
    status: "PENDING" | "COMPLETED" | null;
    location: { id: string; name: string };
    score: number | null;
    distanceMeters: number | null;
    playTimeSeconds: number | null;
  }[];
};

export type DashboardGameLogs = {
  items: DashboardGameLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DashboardSummary = {
  period: DashboardPeriod;
  generatedAt: string;
  totalGames: { count: number; previousCount: number; changePercent: number | null };
  players: {
    date: string; previousDate: string; timeZone: string;
    count: number; previousCount: number; changePercent: number | null; playing: number;
  };
  roundAverage: { score: number | null; maxScore: number; percentage: number | null; count: number; distanceMeters: number | null; distanceCount: number };
  dropOff: {
    count: number; ratePercent: number;
    baseline: { scope: "ALL_TIME"; gameCount: number; incompleteCount: number; ratePercent: number | null };
    comparison: "above" | "below" | "equal" | "unavailable";
    differencePercentagePoints: number | null;
    mostCommonRound: number | null; unknownRoundCount: number;
    byRound: { questionNumber: number; count: number }[];
  };
  dailyGames: { date: string; count: number }[];
  scores: {
    maxScore: number; count: number; median: number | null; mean: number | null;
    highAccuracy: { threshold: number; operator: "gt"; count: number; percentage: number | null };
    buckets: DashboardScoreBucket[]; mostFrequentBucket: DashboardScoreBucket | null;
  };
  games: DashboardGameLogs;
};

export type DashboardOverview = Omit<DashboardSummary, "games">;
