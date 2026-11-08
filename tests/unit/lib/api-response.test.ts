import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/errors/app.error";
import { errorResponse } from "@/shared/lib/api-response";

describe("errorResponse", () => {
  it("should return the AppError code as statusCode", async () => {
    const error = new AppError(
      "Location images have changed",
      409,
      "STALE_UPDATE",
    );

    const response = errorResponse(error);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({
      error: "Location images have changed",
      status: 409,
      statusCode: "STALE_UPDATE",
    });
  });

  it("should use ERROR when AppError has no code", async () => {
    const error = new AppError("Location not found", 404);

    const response = errorResponse(error);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.statusCode).toBe("ERROR");
  });

  it("should return 400 for SyntaxError", async () => {
    const response = errorResponse(new SyntaxError());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: "Invalid JSON payload",
      status: 400,
      statusCode: "ERROR",
    });
  });

  it("should return 500 for unknown errors", async () => {
    const response = errorResponse(new Error("Unexpected error"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "Internal server error",
      status: 500,
      statusCode: "ERROR",
    });
  });
});
