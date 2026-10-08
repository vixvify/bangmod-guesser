import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppRoutes } from "@/routes/app/routes";

const PUBLIC_ROUTES: string[] = [AppRoutes.home, AppRoutes.game];

const AUTH_ROUTES: string[] = [
  AppRoutes.login,
  AppRoutes.register,
  AppRoutes.forgotPassword,
  AppRoutes.resetPassword,
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value;
  const session = token
    ? await auth.api.getSession({ headers: request.headers })
    : null;

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL(AppRoutes.home, request.url));
  }

  if (!session && !isAuthRoute) {
    const loginUrl = new URL(AppRoutes.login, request.url);

    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
