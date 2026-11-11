import { ResetPasswordRequestSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword } = parseSchema(
      ResetPasswordRequestSchema,
      await readJson(request),
    );
    await authService.resetPassword(request.headers, token, {password, confirmPassword});
    return successResponse(null);
  } catch (error) {
    return errorResponse(error);
  }
}