import { describe, expect, it, vi } from "vitest";

const { getHandler, postHandler } = vi.hoisted(() => ({
  getHandler: vi.fn(),
  postHandler: vi.fn(),
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn(() => ({
    GET: getHandler,
    POST: postHandler,
  })),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    handler: vi.fn(),
  },
}));

import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("Better Auth catch-all API route", () => {
  it("delegates GET requests to Better Auth handler", async () => {
    const mockResponse = new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    getHandler.mockResolvedValue(mockResponse);

    const request = new Request("http://localhost/api/auth/get-session");
    const response = await GET(request);

    expect(getHandler).toHaveBeenCalledWith(request);
    expect(response.status).toBe(200);
  });

  it("delegates POST requests to Better Auth handler", async () => {
    const mockResponse = new Response(JSON.stringify({ user: { id: "user_1" } }), { status: 200 });
    postHandler.mockResolvedValue(mockResponse);

    const request = new Request("http://localhost/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "Password123" }),
    });
    const response = await POST(request);

    expect(postHandler).toHaveBeenCalledWith(request);
    expect(response.status).toBe(200);
  });
});
