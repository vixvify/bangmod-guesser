import { describe, expect, it } from "vitest";
import { LocationFormSchema } from "@/core/schema/location.schema";

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
    expect(LocationFormSchema.safeParse({ ...validLocation, name: " " }).success).toBe(false);
    expect(LocationFormSchema.safeParse({ ...validLocation, latitude: "" }).success).toBe(false);
    expect(LocationFormSchema.safeParse({ ...validLocation, longitude: "" }).success).toBe(false);
  });

  it("rejects non-numeric or out-of-range coordinates", () => {
    expect(LocationFormSchema.safeParse({ ...validLocation, latitude: "abc" }).success).toBe(false);
    expect(LocationFormSchema.safeParse({ ...validLocation, latitude: "91" }).success).toBe(false);
    expect(LocationFormSchema.safeParse({ ...validLocation, longitude: "-181" }).success).toBe(false);
  });
});
