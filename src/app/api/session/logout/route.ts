import { authService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const authHeaders = await authService.signOut(request.headers);
    const response = successResponse(null);
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
