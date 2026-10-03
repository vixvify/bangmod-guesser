export type ScoreTier = "SSS" | "S" | "A" | "B" | "C" | "D";

export interface TierInfo {
  tier: ScoreTier;
  label: string;
  minScore: number;
  maxScore: number;
  percentage: string;
  description: string;
  badgeClassName: string;
}

export function formatScore(score: number): string {
  return score.toLocaleString("en-US");
}

export function calculateScoreTier(score: number): ScoreTier {
  if (score >= 4750) return "SSS";
  if (score >= 4200) return "S";
  if (score >= 3350) return "A";
  if (score >= 2500) return "B";
  if (score >= 1650) return "C";
  return "D";
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getPagination(totalItems: number, page: number, pageSize: number) {
  if (pageSize < 1) {
    throw new RangeError("pageSize must be greater than zero");
  }

  return {
    pageCount: Math.max(1, Math.ceil(totalItems / pageSize)),
    firstItem: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    lastItem: Math.min(page * pageSize, totalItems),
  };
}

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function formatThaiDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes} น.`;
}

export function formatThaiDateRange(
  startInput: string | Date,
  endInput: string | Date,
): string {
  const start = typeof startInput === "string" ? new Date(startInput) : startInput;
  const end = typeof endInput === "string" ? new Date(endInput) : endInput;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "";
  }

  const startDay = start.getDate();
  const startMonth = THAI_MONTHS_FULL[start.getMonth()];
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = THAI_MONTHS_FULL[end.getMonth()];
  const endYear = end.getFullYear();

  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
}
