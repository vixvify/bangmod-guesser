import { GoogleSignInSchema } from "@/core/schema/auth.schema";
import { authService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { parseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { callbackURL, errorCallbackURL } = parseSchema(GoogleSignInSchema, await request.json());
    const { url, headers } = await authService.googleSignIn(request.headers, callbackURL, errorCallbackURL);
    const response = successResponse({ url });
    for (const cookie of headers.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
