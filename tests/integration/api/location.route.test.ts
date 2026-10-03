import { describe, expect, it, vi } from "vitest";

const sampleJpeg = new Uint8Array([0xff, 0xd8, 0xff]);

const { mockLocationService } = vi.hoisted(() => ({
  mockLocationService: {
    getLocations: vi.fn(),
    getLocationById: vi.fn(),
    createLocation: vi.fn(),
    updateLocation: vi.fn(),
    deleteLocation: vi.fn(),
    deleteLocationImage: vi.fn(),
  },
}));

vi.mock("server-only", () => ({}));

vi.mock("@/infrastructure/container", () => ({
  locationService: mockLocationService,
}));

import { GET as getLocations, POST as createLocation } from "@/app/api/locations/route";
import {
  GET as getLocationById,
  PUT as updateLocation,
  DELETE as deleteLocation,
} from "@/app/api/locations/[id]/route";
import { DELETE as deleteLocationImage } from "@/app/api/locations/[id]/images/[imageNumber]/route";

describe("Locations API routes", () => {
  describe("GET /api/locations", () => {
    it("returns paginated location results", async () => {
      mockLocationService.getLocations.mockResolvedValue({
        items: [
          {
            id: "loc_1",
            name: "CB2",
            description: null,
            latitude: 13.65,
            longitude: 100.49,
            status: "ACTIVE",
            images: [],
            createdAt: new Date(),
            updatedAt: null,
          },
        ],
        total: 1,
        page: 2,
        pageSize: 15,
        totalPages: 1,
      });

      const request = new Request(
        "http://localhost/api/locations?search=CB2&searchBy=description&page=2&pageSize=15&orderBy=asc",
      );
      const response = await getLocations(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.items[0].name).toBe("CB2");
      expect(mockLocationService.getLocations).toHaveBeenCalledWith({
        search: "CB2",
        searchBy: "description",
        page: 2,
        pageSize: 15,
        orderBy: "asc",
      });
    });
  });

  describe("POST /api/locations", () => {
    it("creates a new location with dynamic 2 images", async () => {
      mockLocationService.createLocation.mockResolvedValue({
        id: "loc_new",
        name: "Library",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: "ACTIVE",
        images: [],
        createdAt: new Date(),
        updatedAt: null,
      });

      const formData = new FormData();
      formData.append("name", "Library");
      formData.append("latitude", "13.65");
      formData.append("longitude", "100.49");

      for (let i = 1; i <= 2; i += 1) {
        const file = new File([sampleJpeg], `image_${i}.jpg`, {
          type: "image/jpeg",
        });
        formData.append("images", file);
      }

      const request = new Request("http://localhost/api/locations", {
        method: "POST",
        body: formData,
      });

      const response = await createLocation(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.data.id).toBe("loc_new");
      expect(mockLocationService.createLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Library",
          images: expect.any(Array),
        }),
      );
    });
  });

  describe("GET /api/locations/[id]", () => {
    it("returns single location by id", async () => {
      mockLocationService.getLocationById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: "ACTIVE",
        images: [],
        createdAt: new Date(),
        updatedAt: null,
      });

      const request = new Request("http://localhost/api/locations/loc_1");
      const response = await getLocationById(request, {
        params: Promise.resolve({ id: "loc_1" }),
      });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.id).toBe("loc_1");
    });
  });

  describe("PUT /api/locations/[id]", () => {
    it("updates location fields and deletes specified image numbers via JSON", async () => {
      mockLocationService.updateLocation.mockResolvedValue({
        id: "loc_1",
        name: "CB2 Updated",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: "ACTIVE",
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/locations/loc_1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "CB2 Updated",
          deleteImageNumbers: [2],
        }),
      });

      const response = await updateLocation(request, {
        params: Promise.resolve({ id: "loc_1" }),
      });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.name).toBe("CB2 Updated");
      expect(mockLocationService.updateLocation).toHaveBeenCalledWith(
        "loc_1",
        expect.objectContaining({
          name: "CB2 Updated",
          deleteImageNumbers: [2],
        }),
      );
    });
  });

  describe("DELETE /api/locations/[id]", () => {
    it("deletes location and returns 200", async () => {
      mockLocationService.deleteLocation.mockResolvedValue(undefined);

      const request = new Request("http://localhost/api/locations/loc_1", {
        method: "DELETE",
      });

      const response = await deleteLocation(request, {
        params: Promise.resolve({ id: "loc_1" }),
      });

      expect(response.status).toBe(200);
      expect(mockLocationService.deleteLocation).toHaveBeenCalledWith("loc_1");
    });
  });

  describe("DELETE /api/locations/[id]/images/[imageNumber]", () => {
    it("deletes specific image and returns updated location with 200", async () => {
      mockLocationService.deleteLocationImage.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: "ACTIVE",
        images: [{ imageNumber: 1, imageUrl: "https://example.com/1.jpg" }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request(
        "http://localhost/api/locations/loc_1/images/2",
        {
          method: "DELETE",
        },
      );

      const response = await deleteLocationImage(request, {
        params: Promise.resolve({ id: "loc_1", imageNumber: "2" }),
      });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.images).toHaveLength(1);
      expect(mockLocationService.deleteLocationImage).toHaveBeenCalledWith(
        "loc_1",
        2,
      );
    });
  });
});
