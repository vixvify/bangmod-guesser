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

export function formatTimeForSpeech(totalSeconds: number): string {
  return `${Math.floor(totalSeconds / 60)} นาที ${totalSeconds % 60} วินาที`;
}

export function getPagination(
  totalItems: number,
  page: number,
  pageSize: number,
) {
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

const BANGKOK_TIME_ZONE = "Asia/Bangkok";
const BANGKOK_UTC_OFFSET = "+07:00";
const DAY_MS = 24 * 60 * 60 * 1000;

export function shiftDateOnly(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().split("T")[0];
}

export function toBangkokStartOfDay(date: string): Date {
  return new Date(`${date}T00:00:00${BANGKOK_UTC_OFFSET}`);
}

function dateParts(input: string | Date, timeZone = BANGKOK_TIME_ZONE) {
  const local =
    typeof input === "string"
      ? /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(
          input,
        )
      : null;
  if (local) {
    const [, year, month, day, hour = "00", minute = "00", second = "00"] =
      local;
    const date = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}Z`,
    );
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 19) !==
        `${year}-${month}-${day}T${hour}:${minute}:${second}`
    )
      return null;
    return { year, month, day, hour, minute, second };
  }

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

export function formatDateOnly(input: string | Date, timeZone = "UTC"): string {
  const parts = dateParts(input, timeZone);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : "";
}

export function formatThaiCalendarDate(
  input: string | Date,
  monthStyle: "short" | "full" = "full",
): string {
  const parts = dateParts(input);
  if (!parts) return "";
  const months = monthStyle === "short" ? THAI_MONTHS_SHORT : THAI_MONTHS_FULL;
  return `${Number(parts.day)} ${months[Number(parts.month) - 1]} ${parts.year}`;
}

export function formatThaiDateTime(input: string | Date): string {
  const parts = dateParts(input);
  return parts
    ? `${formatThaiCalendarDate(input, "short")}, ${parts.hour}:${parts.minute} น.`
    : "";
}

export function formatThaiDateRange(
  start: string | Date,
  end: string | Date,
): string {
  const first = formatThaiCalendarDate(start);
  const last = formatThaiCalendarDate(end);
  return first && last ? `${first} - ${last}` : "";
}

export function formatThaiClockTime(input: string | Date): string {
  const parts = dateParts(input);
  return parts ? `${parts.hour}:${parts.minute}:${parts.second}` : "";
}

export function formatThaiNumericDate(input: string | Date): string {
  const parts = dateParts(input);
  return parts
    ? `${parts.day}/${parts.month}/${String(Number(parts.year) + 543).slice(-2)}`
    : "";
}
