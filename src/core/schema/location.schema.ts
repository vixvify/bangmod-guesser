import { z } from "zod";
import { LOCATION_MESSAGES } from "@/core/constants/location";
import { LocationStatus } from "../domain/location";

function coordinate(label: string, min: number, max: number) {
  return z.preprocess(
    (val) => (typeof val === "number" ? String(val) : val),
    z
      .string()
      .trim()
      .min(1, LOCATION_MESSAGES.coordinateRequired(label))
      .refine(
        (value) => /^-?\d+(\.\d+)?$/.test(value),
        LOCATION_MESSAGES.coordinateNumber(label),
      )
      .refine(
        (value) => Number(value) >= min && Number(value) <= max,
        LOCATION_MESSAGES.coordinateRange(label, min, max),
      ),
  );
}

export const LocationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, LOCATION_MESSAGES.nameRequired)
    .max(100, LOCATION_MESSAGES.nameMax),
  description: z.preprocess(
    (val) => (val === null || val === undefined ? "" : val),
    z.string().trim().max(500, LOCATION_MESSAGES.descriptionMax),
  ),
  latitude: coordinate("ละติจูด", -90, 90),
  longitude: coordinate("ลองจิจูด", -180, 180),
});

export const SearchLocationQuerySchema = z.object({
  search: z.string().trim().optional(),
  searchBy: z.enum(["name", "description"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export const UpdateLocationSchema = LocationFormSchema.partial().extend({
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

export type LocationFormInput = z.input<typeof LocationFormSchema>;
export type SearchLocationQueryInput = z.infer<typeof SearchLocationQuerySchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;
export type LocationIdParamInput = z.infer<typeof LocationIdParamSchema>;
export type LocationImageParamInput = z.infer<typeof LocationImageParamSchema>;