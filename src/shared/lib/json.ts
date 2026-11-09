import { AppError } from "@/shared/errors/app.error";

export function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError("Invalid JSON payload", 400);
    }
    throw error;
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError("Invalid JSON payload", 400);
    }
    throw error;
  }
}
