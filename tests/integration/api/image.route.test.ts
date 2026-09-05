import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-check", () => ({
  authCheck: vi.fn(),
}));

vi.mock("@/infrastructure/container", () => ({
  imageService: {
    upload: vi.fn(),
    delete: vi.fn(),
  },
}));

import { DELETE, POST } from "@/app/api/images/route";
import { imageService } from "@/infrastructure/container";
import { authCheck } from "@/lib/auth-check";

const pngContent = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const admin = {
  id: "admin_1",
  name: "KMUTT Admin",
  email: "admin@example.com",
  role: "ADMIN",
};

function uploadRequest() {
  const formData = new FormData();
  formData.set("file", new Blob([pngContent], { type: "image/png" }), "map.png");

  return new Request("http://localhost/api/images", {
    method: "POST",
    body: formData,
  });
}

function deleteRequest(key: string) {
  return new Request("http://localhost/api/images", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key }),
  });
}

describe("Image API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authCheck).mockResolvedValue(admin);
  });

  it("allows an admin to upload an image", async () => {
    vi.mocked(imageService.upload).mockResolvedValue({
      key: "images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
      url: "https://images.example.com/images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
    });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        key: "images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
        url: "https://images.example.com/images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
      },
      statusCode: "CREATED",
    });
    expect(imageService.upload).toHaveBeenCalledWith({
      contentType: "image/png",
      content: expect.any(Uint8Array),
    });
  });

  it("rejects a non-admin before calling the image service", async () => {
    vi.mocked(authCheck).mockResolvedValue({ ...admin, role: "USER" });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(403);
    expect(imageService.upload).not.toHaveBeenCalled();
  });

  it("returns a validation error when no file is provided", async () => {
    const response = await POST(
      new Request("http://localhost/api/images", { method: "POST" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Image file is required",
      statusCode: "ERROR",
    });
  });

  it("allows an admin to delete an image by key", async () => {
    vi.mocked(imageService.delete).mockResolvedValue(undefined);

    const response = await DELETE(
      deleteRequest("images/21caef87-af96-4e68-9d5e-d68f7508117a.png"),
    );

    expect(response.status).toBe(200);
    expect(imageService.delete).toHaveBeenCalledWith({
      key: "images/21caef87-af96-4e68-9d5e-d68f7508117a.png",
    });
  });

  it("validates an image key before calling the image service", async () => {
    const response = await DELETE(deleteRequest("private/image.png"));

    expect(response.status).toBe(400);
    expect(imageService.delete).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid image key",
      statusCode: "ERROR",
    });
  });
});
