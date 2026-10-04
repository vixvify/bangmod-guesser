import { config } from "@/lib/config";

export const LocationRoutes = {
  list: `${config.apiUrl}/locations`,
  create: `${config.apiUrl}/locations`,
  detail: (id: string) => `${config.apiUrl}/locations/${id}`,
  update: (id: string) => `${config.apiUrl}/locations/${id}`,
  delete: (id: string) => `${config.apiUrl}/locations/${id}`,
  deleteImage: (id: string, imageNumber: number) =>
    `${config.apiUrl}/locations/${id}/images/${imageNumber}`,
} as const;
