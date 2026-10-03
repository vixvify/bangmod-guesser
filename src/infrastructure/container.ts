import { ImageRepositoryImpl } from "./repositories/image.repository";
import { ImageService } from "@/core/service/image.service";
import { LocationRepositoryImpl } from "./repositories/location.repository";
import { LocationService } from "@/core/service/location.service";

const imageRepository = new ImageRepositoryImpl();
export const imageService = new ImageService(imageRepository);

const locationRepository = new LocationRepositoryImpl();
export const locationService = new LocationService(
  locationRepository,
  imageService,
);
