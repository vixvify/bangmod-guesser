export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

function assertValidCoordinates(point: Coordinates, label: string): void {
  const { latitude, longitude } = point;

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError(
      `${label}.latitude must be a finite number between -90 and 90`,
    );
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError(
      `${label}.longitude must be a finite number between -180 and 180`,
    );
  }
}

export function haversineDistanceMeters(
  actual: Coordinates,
  guess: Coordinates,
): number {
  assertValidCoordinates(actual, "actual");
  assertValidCoordinates(guess, "guess");

  const actualLat = toRadians(actual.latitude);
  const guessLat = toRadians(guess.latitude);
  const deltaLat = toRadians(guess.latitude - actual.latitude);
  const deltaLon = toRadians(guess.longitude - actual.longitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(actualLat) * Math.cos(guessLat) * Math.sin(deltaLon / 2) ** 2;

  const a = Math.min(1, haversine);
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * centralAngle;
}