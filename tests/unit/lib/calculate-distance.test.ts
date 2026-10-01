import { describe, expect, it } from "vitest";
import { EARTH_RADIUS_METERS, haversineDistanceMeters } from "@/lib/calculate-distance";

describe("haversineDistanceMeters", () => {
    it("returns 0 for the same points", () => {
        const point = { latitude: 13.6516, longitude: 100.4952 };

        expect(haversineDistanceMeters(point, point)).toBe(0);
    });

    it("returns the same distance when actual and guess are swapped", () => {
        const a = { latitude: 13.6516, longitude: 100.4952 };
        const b = { latitude: 13.651, longitude: 100.495 };

        expect(haversineDistanceMeters(a, b)).toBeCloseTo(
            haversineDistanceMeters(b, a), 6,
        );
    });

    it("measures one degree of latitude at the equator", () => {
        const distance = haversineDistanceMeters(
        { latitude: 0, longitude: 0 },
        { latitude: 1, longitude: 0 },
        );

        expect(distance).toBeCloseTo(111194.927, 1);
    });

    it("handles antipodal points without returning NaN", () => {
        const distance = haversineDistanceMeters(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 180 },
        );

        expect(distance).toBeCloseTo(Math.PI * EARTH_RADIUS_METERS, 1);
    });

    it("takes the short way across the antimeridian", () => {
        const distance = haversineDistanceMeters(
        { latitude: 0, longitude: 179 },
        { latitude: 0, longitude: -179 },
        );

        expect(distance).toBeCloseTo(222_389.853, 1);
    });

    it("is accurate at university scale (tens of meters)", () => {
        const distance = haversineDistanceMeters(
        { latitude: 13.6516, longitude: 100.4952 },
        { latitude: 13.651, longitude: 100.495 },
        );

        expect(distance).toBeCloseTo(70.13, 1);
    });

    it.each([
        ["latitude above 90", { latitude: 91, longitude: 0 }],
        ["latitude below -90", { latitude: -91, longitude: 0 }],
        ["longitude above 180", { latitude: 0, longitude: 181 }],
        ["longitude below -180", { latitude: 0, longitude: -181 }],
        ["NaN latitude", { latitude: Number.NaN, longitude: 0 }],
        ["Infinity longitude", { latitude: 0, longitude: Infinity }],
    ])("throws RangeError for %s", (_label, invalid) => {
        const valid = { latitude: 0, longitude: 0 };

        expect(() => haversineDistanceMeters(invalid, valid)).toThrow(RangeError);
        expect(() => haversineDistanceMeters(valid, invalid)).toThrow(RangeError);
    });
});