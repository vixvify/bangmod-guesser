import { NextRequest, NextResponse } from "next/server";
import { AppRoutes } from "../routes/app/routes";

const PUBLIC_ROUTES: string[] = [AppRoutes.home];

const AUTH_ROUTES: string[] = [AppRoutes.login, AppRoutes.register];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL(AppRoutes.home, request.url));
  }

  if (!token && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL(AppRoutes.login, request.url);

    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
