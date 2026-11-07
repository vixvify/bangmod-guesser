import type {
  GetLocationRecordsResult,
  LocationModelWithImages,
} from "../../../../prisma/types/location";
import type { LocationImageRecordInput } from "../../images/image.schema";
import type {
  CreateLocationInput,
  SearchLocationQueryInput,
  UpdateLocationInput,
} from "../location.schema";
import type { LocationStatus } from "../location";

export type LocationUpdateResult =
  | {
      status: "UPDATED";
      location: LocationModelWithImages;
    }
  | {
      status: "IMAGE_IN_USE";
    };

export interface LocationRepository {
  findMany(query: SearchLocationQueryInput): Promise<GetLocationRecordsResult>;
  findById(id: string): Promise<LocationModelWithImages | null>;
  create(
    input: CreateLocationInput,
    status: LocationStatus,
    images: LocationImageRecordInput[],
  ): Promise<LocationModelWithImages>;
  update(
    id: string,
    input: UpdateLocationInput,
    images?: LocationImageRecordInput[],
  ): Promise<LocationUpdateResult>;
  delete(id: string): Promise<void>;
}
