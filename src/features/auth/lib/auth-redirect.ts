import { AppRoutes } from "@/shared/routes/routes";

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
