import { RequestPasswordResetSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export async function POST(request: Request) {
  try {
    const input = parseSchema(
      RequestPasswordResetSchema,
      await readJson(request)
    );
    await authService.requestPasswordReset(request.headers, input);
    return successResponse(null);
  } catch (error) {
    return errorResponse(error);
  }
}