import { describe, expect, it } from "vitest";
import { LocationFactory } from "@/infrastructure/factories/location.factory";

describe("LocationFactory", () => {
  it("orders images and names them with their stored extensions", () => {
    const location = LocationFactory.toDomain({
      id: "loc_1",
      name: "Library",
      description: null,
      latitude: 13.65,
      longitude: 100.49,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: null,
      images: [
        {
          locationId: "loc_1",
          imageNumber: 2,
          imageUrl: "https://cdn.example.com/images/second.webp",
          createdAt: new Date(),
        },
        {
          locationId: "loc_1",
          imageNumber: 1,
          imageUrl: "https://cdn.example.com/images/first.png",
          createdAt: new Date(),
        },
      ],
    });

    expect(location.images.map((image) => image.name)).toEqual([
      "location-01.png",
      "location-02.webp",
    ]);
  });
});
