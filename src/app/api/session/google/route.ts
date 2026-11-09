import { GoogleSignInSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export async function POST(request: Request) {
  try {
    const { callbackURL, errorCallbackURL } = parseSchema(GoogleSignInSchema, await readJson(request));
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
