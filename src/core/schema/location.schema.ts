import { z } from "zod";
import { LOCATION_MAX_IMAGES, LOCATION_MESSAGES } from "@/core/constants/location";
import { LocationStatus } from "../domain/location";
import { UploadImageSchema } from "./image.schema";

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

const LocationDataSchema = LocationFormSchema.extend({
  description: LocationFormSchema.shape.description.optional(),
  latitude: coordinate("ละติจูด", -90, 90).transform(Number),
  longitude: coordinate("ลองจิจูด", -180, 180).transform(Number),
});

const ImageNumberSchema = z.coerce.number().int().min(1).max(LOCATION_MAX_IMAGES);
const LocationImageRecordSchema = z.object({
  imageNumber: ImageNumberSchema,
  imageUrl: z.string(),
});

export const CreateLocationSchema = LocationDataSchema.extend({
  images: z.array(UploadImageSchema).min(1).max(LOCATION_MAX_IMAGES),
});

export const SearchLocationQuerySchema = z.object({
  search: z.string().trim().optional(),
  searchBy: z.enum(["name", "description"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export const UpdateLocationSchema = LocationDataSchema.partial().extend({
  status: z.nativeEnum(LocationStatus).optional(),
  keepImageNumbers: z.array(ImageNumberSchema).optional(),
  newImages: z.array(UploadImageSchema).max(LOCATION_MAX_IMAGES).optional(),
});

export const GetLocationRecordsSchema = SearchLocationQuerySchema.omit({
  page: true,
  pageSize: true,
}).extend({
  skip: z.number().int().min(0),
  take: z.number().int().min(1).max(100),
});

export const CreateLocationRecordSchema = LocationDataSchema.extend({
  status: z.nativeEnum(LocationStatus),
  images: z.array(LocationImageRecordSchema),
});

export const UpdateLocationRecordSchema = LocationDataSchema.partial().extend({
  status: z.nativeEnum(LocationStatus).optional(),
  images: z.array(LocationImageRecordSchema).optional(),
});

export const LocationIdParamSchema = z.object({
  id: z.string().trim().min(1, "Location ID is required"),
});

export const LocationImageParamSchema = z.object({
  id: z.string().trim().min(1, "Location ID is required"),
  imageNumber: ImageNumberSchema,
});

export type LocationFormInput = z.input<typeof LocationFormSchema>;
export type SearchLocationQueryInput = z.infer<typeof SearchLocationQuerySchema>;
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;
export type GetLocationRecordsInput = z.infer<typeof GetLocationRecordsSchema>;
export type CreateLocationRecordInput = z.infer<typeof CreateLocationRecordSchema>;
export type UpdateLocationRecordInput = z.infer<typeof UpdateLocationRecordSchema>;
