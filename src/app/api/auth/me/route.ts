import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";

export async function GET() {
  try {
    return successResponse(await requireAuth());
  } catch (error) {
    return errorResponse(error);
  }
}
