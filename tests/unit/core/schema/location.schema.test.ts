import { describe, expect, it } from "vitest";
import {
  CreateLocationSchema,
  LocationIdSchema,
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

describe("CreateLocationSchema validation", () => {
  it("accepts a location with decimal coordinates", () => {
    expect(CreateLocationSchema.safeParse(validLocation).success).toBe(true);
  });

  it("requires a name and both coordinates", () => {
    expect(
      CreateLocationSchema.safeParse({ ...validLocation, name: " " }).success,
    ).toBe(false);
    expect(
      CreateLocationSchema.safeParse({ ...validLocation, latitude: "" }).success,
    ).toBe(false);
    expect(
      CreateLocationSchema.safeParse({ ...validLocation, longitude: "" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric or out-of-range coordinates", () => {
    expect(
      CreateLocationSchema.safeParse({ ...validLocation, latitude: "abc" })
        .success,
    ).toBe(false);
    expect(
      CreateLocationSchema.safeParse({ ...validLocation, latitude: "91" })
        .success,
    ).toBe(false);
    expect(
      CreateLocationSchema.safeParse({ ...validLocation, longitude: "-181" })
        .success,
    ).toBe(false);
  });
});

describe("Location schemas", () => {
  describe("LocationIdSchema", () => {
    it("trims a valid id and rejects an empty id", () => {
      expect(LocationIdSchema.parse(" loc_123 ")).toBe("loc_123");
      expect(LocationIdSchema.safeParse(" ").success).toBe(false);
    });
  });

  describe("CreateLocationSchema", () => {
    it("converts coordinates", () => {
      const result = CreateLocationSchema.parse({
        ...validLocation,
      });

      expect(result.latitude).toBe(13.6516);
      expect(result.longitude).toBe(100.4952);
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

    it("converts updated coordinates", () => {
      const result = UpdateLocationSchema.parse({
        latitude: "13.7",
      });

      expect(result.latitude).toBe(13.7);
    });
  });
});
