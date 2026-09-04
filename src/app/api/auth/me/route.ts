import { errorResponse, successResponse } from "@/lib/api-response";
import { authCheck } from "@/lib/auth-check";

export async function GET() {
  try {
    return successResponse(await authCheck());
  } catch (error) {
    return errorResponse(error);
  }
}
