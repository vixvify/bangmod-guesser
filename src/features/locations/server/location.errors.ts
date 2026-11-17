export class LocationImagesChangedError extends Error {
  constructor() {
    super("Location images have changed");
    this.name = "LocationImagesChangedError";
  }
}

export class LocationImagesInUseError extends Error {
  constructor() {
    super("Location images are in use");
    this.name = "LocationImagesInUseError";
  }
}

export class LocationInUseError extends Error {
  constructor() {
    super("Location is in use");
    this.name = "LocationInUseError";
  }
}

export class LocationNotFoundError extends Error {
  constructor() {
    super("Location not found");
    this.name = "LocationNotFoundError";
  }
}
