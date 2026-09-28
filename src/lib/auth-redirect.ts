import { AppRoutes } from "@/routes/app/routes";

export function getAuthRedirect(callbackUrl: string | string[] | undefined) {
  if (
    typeof callbackUrl !== "string" ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\")
  ) {
    return AppRoutes.home;
  }

  return callbackUrl;
}
