import { ImageRepositoryImpl } from "./repositories/image.repository";
import { ImageService } from "@/core/service/image.service";

const imageRepository = new ImageRepositoryImpl();

export const imageService = new ImageService(imageRepository);

