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
