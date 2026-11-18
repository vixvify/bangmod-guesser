import { AUTH_MESSAGES } from "@/features/auth/auth.constants";
import { z } from "zod";

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const expirySchema = z.iso.datetime();

export function getSuspensionMessage(
  data: unknown,
  fallback: string = AUTH_MESSAGES.submit.loginSuspended,
): string {
  if (!data || typeof data !== "object" || !("banExpires" in data)) return fallback;

  const expiry = expirySchema.safeParse(data.banExpires);
  if (!expiry.success) return fallback;
  const date = new Date(expiry.data);
  return AUTH_MESSAGES.submit.loginSuspendedUntil(
    `${dateFormatter.format(date)} เวลา ${timeFormatter.format(date)} น.`,
  );
}
