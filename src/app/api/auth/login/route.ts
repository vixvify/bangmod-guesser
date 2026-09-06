import { authService, sessionService } from "@/infrastructure/container";
import { config } from "@/config";
import { errorResponse, successResponse } from "@/lib/api-response";
import { SESSION_DURATION_SECONDS } from "@/core/constants/auth";

export async function POST(request: Request) {
  try {
    const user = await authService.login(await request.json());
    const token = await sessionService.create(user.id);
    const response = successResponse(user);

    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
