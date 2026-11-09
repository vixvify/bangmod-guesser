export class LocationImagesInUseError extends Error {
  constructor() {
    super("Cannot delete an image used by a game in progress");
    this.name = "LocationImagesInUseError";
  }
}

export class LocationImagesChangedError extends Error {
  constructor() {
    super("Location images have changed");
    this.name = "LocationImagesChangedError";
  }
}
