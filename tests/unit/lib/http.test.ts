import { beforeEach, describe, expect, it, vi } from "vitest";
import httpClient from "@/shared/lib/http";

const { put } = vi.hoisted(() => ({
  put: vi.fn(),
}));

vi.mock("client-only", () => ({}));
vi.mock("@/shared/config/runtime", () => ({
  config: {
    apiUrl: "http://localhost:3000",
  },
}));
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({ put })),
  },
}));

describe("httpClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass STALE_UPDATE statusCode from API response to HttpError", async () => {
    put.mockRejectedValue({
      message: "Request failed with status code 409",
      response: {
        status: 409,
        data: {
          error: "Location images have changed",
          status: 409,
          statusCode: "STALE_UPDATE",
        },
      },
    });

    await expect(httpClient.put("/locations/1", {})).rejects.toMatchObject({
      message: "Location images have changed",
      status: 409,
      statusCode: "STALE_UPDATE",
    });
  });

  it("should pass IMAGE_IN_USE statusCode from API response to HttpError", async () => {
    put.mockRejectedValue({
      message: "Request failed with status code 409",
      response: {
        status: 409,
        data: {
          error: "Cannot delete or replace an image used by a game in progress",
          status: 409,
          statusCode: "IMAGE_IN_USE",
        },
      },
    });

    await expect(httpClient.put("/locations/1", {})).rejects.toMatchObject({
      status: 409,
      statusCode: "IMAGE_IN_USE",
    });
  });

  it("should support API error responses without statusCode", async () => {
    put.mockRejectedValue({
      message: "Request failed with status code 404",
      response: {
        status: 404,
        data: {
          error: "Location not found",
          status: 404,
        },
      },
    });

    await expect(httpClient.put("/locations/1", {})).rejects.toMatchObject({
      message: "Location not found",
      status: 404,
      statusCode: undefined,
    });
  });

  it("preserves Retry-After on rate limit responses", async () => {
    put.mockRejectedValue({
      message: "Too many requests",
      response: { status: 429, headers: { "retry-after": "25" }, data: { error: "Too many requests" } },
    });
    await expect(httpClient.put("/locations/1", {})).rejects.toMatchObject({ status: 429, retryAfter: 25 });
  });
});
