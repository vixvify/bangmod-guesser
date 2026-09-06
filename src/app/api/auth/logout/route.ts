import { cookies } from "next/headers";
import { config } from "@/config";
import { sessionService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const token = (await cookies()).get("accessToken")?.value ?? null;

    await sessionService.delete(token);

    const response = successResponse(null);
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
