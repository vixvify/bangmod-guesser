import { describe, expect, it } from "vitest";
import {
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
