import { describe, expect, it } from "vitest";
import {
  CreateLocationSchema,
  LocationFormSchema,
  LocationIdParamSchema,
  SearchLocationQuerySchema,
  UpdateLocationSchema,
} from "@/core/schema/location.schema";
import { LocationStatus } from "@/core/domain/location";

const validLocation = {
  name: "อาคารเรียนรวม 2 (CB2)",
  description: "จุดทายสถานที่",
  latitude: "13.6516",
  longitude: "100.4952",
};

describe("LocationFormSchema", () => {
  it("accepts a location with decimal coordinates", () => {
    expect(LocationFormSchema.safeParse(validLocation).success).toBe(true);
  });

  it("requires a name and both coordinates", () => {
    expect(
      LocationFormSchema.safeParse({ ...validLocation, name: " " }).success,
    ).toBe(false);
    expect(
      LocationFormSchema.safeParse({ ...validLocation, latitude: "" }).success,
    ).toBe(false);
    expect(
      LocationFormSchema.safeParse({ ...validLocation, longitude: "" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric or out-of-range coordinates", () => {
    expect(
      LocationFormSchema.safeParse({ ...validLocation, latitude: "abc" })
        .success,
    ).toBe(false);
    expect(
      LocationFormSchema.safeParse({ ...validLocation, latitude: "91" })
        .success,
    ).toBe(false);
    expect(
      LocationFormSchema.safeParse({ ...validLocation, longitude: "-181" })
        .success,
    ).toBe(false);
  });
});

describe("Location schemas", () => {
  describe("CreateLocationSchema", () => {
    it("converts coordinates and validates uploaded images", () => {
      const result = CreateLocationSchema.parse({
        ...validLocation,
        images: [
          {
            contentType: "image/jpeg",
            content: new Uint8Array([0xff, 0xd8, 0xff]),
          },
        ],
      });

      expect(result.latitude).toBe(13.6516);
      expect(result.longitude).toBe(100.4952);
      expect(result.images).toHaveLength(1);
    });

    it("rejects a location without images", () => {
      expect(CreateLocationSchema.safeParse({ ...validLocation, images: [] }).success).toBe(false);
    });
  });

  describe("SearchLocationQuerySchema", () => {
    it("applies default pagination, searchBy, and orderBy values", () => {
      const result = SearchLocationQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.searchBy).toBe("name");
      expect(result.orderBy).toBe("desc");
      expect(result.search).toBeUndefined();
    });

    it("parses valid search parameters", () => {
      const result = SearchLocationQuerySchema.parse({
        search: "CB2",
        searchBy: "description",
        page: "2",
        pageSize: "20",
        orderBy: "asc",
      });
      expect(result.search).toBe("CB2");
      expect(result.searchBy).toBe("description");
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20);
      expect(result.orderBy).toBe("asc");
    });
  });

  describe("UpdateLocationSchema", () => {
    it("accepts partial updates", () => {
      const result = UpdateLocationSchema.parse({
        name: "Updated Name",
        status: LocationStatus.INACTIVE,
      });
      expect(result.name).toBe("Updated Name");
      expect(result.status).toBe(LocationStatus.INACTIVE);
    });

    it("parses image ordering and new uploads", () => {
      const result = UpdateLocationSchema.parse({
        keepImageNumbers: ["3", "1"],
        latitude: "13.7",
        newImages: [
          {
            contentType: "image/jpeg",
            content: new Uint8Array([0xff, 0xd8, 0xff]),
          },
        ],
      });

      expect(result.keepImageNumbers).toEqual([3, 1]);
      expect(result.latitude).toBe(13.7);
      expect(result.newImages).toHaveLength(1);
    });
  });

  describe("LocationIdParamSchema", () => {
    it("validates non-empty id", () => {
      const result = LocationIdParamSchema.parse({ id: "loc_123" });
      expect(result.id).toBe("loc_123");
    });

    it("rejects empty id", () => {
      expect(() => LocationIdParamSchema.parse({ id: "" })).toThrow();
    });
  });
});
