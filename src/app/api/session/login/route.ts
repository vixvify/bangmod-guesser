import { LoginSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { parseSchema } from "@/shared/lib/validation";

export async function POST(request: Request) {
  try {
    const input = parseSchema(LoginSchema, await request.json());
    const authHeaders = await authService.signIn(request.headers, input);
    const response = successResponse(null);
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
