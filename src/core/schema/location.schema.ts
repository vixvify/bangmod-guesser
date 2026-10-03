import { z } from "zod";
import { LocationStatus } from "../domain/location";

export const SearchLocationQuerySchema = z.object({
  search: z.string().trim().optional(),
  searchBy: z.enum(["name", "description"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export const CreateLocationSchema = z.object({
  name: z.string().trim().min(1, "Location name is required").max(255),
  description: z.string().trim().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export const UpdateLocationSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  status: z.nativeEnum(LocationStatus).optional(),
  deleteImageNumbers: z
    .array(z.coerce.number().int().min(1).max(5))
    .optional(),
});

export const LocationIdParamSchema = z.object({
  id: z.string().trim().min(1, "Location ID is required"),
});

export const LocationImageParamSchema = z.object({
  id: z.string().trim().min(1, "Location ID is required"),
  imageNumber: z.coerce.number().int().min(1).max(5),
});

export type SearchLocationQueryInput = z.infer<typeof SearchLocationQuerySchema>;
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;
export type LocationIdParamInput = z.infer<typeof LocationIdParamSchema>;
export type LocationImageParamInput = z.infer<typeof LocationImageParamSchema>;
