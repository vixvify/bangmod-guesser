import { z } from "zod";
import { LOCATION_MESSAGES } from "@/core/constants/location";

function coordinate(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, LOCATION_MESSAGES.coordinateRequired(label))
    .refine((value) => /^-?\d+(\.\d+)?$/.test(value), LOCATION_MESSAGES.coordinateNumber(label))
    .refine(
      (value) => Number(value) >= min && Number(value) <= max,
      LOCATION_MESSAGES.coordinateRange(label, min, max),
    );
}

export const LocationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, LOCATION_MESSAGES.nameRequired)
    .max(100, LOCATION_MESSAGES.nameMax),
  description: z.string().trim().max(500, LOCATION_MESSAGES.descriptionMax),
  latitude: coordinate("ละติจูด", -90, 90),
  longitude: coordinate("ลองจิจูด", -180, 180),
});

export type LocationFormInput = z.input<typeof LocationFormSchema>;
