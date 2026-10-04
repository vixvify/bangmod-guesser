import type {
  GetLocationRecordsResult,
  LocationModelWithImages,
} from "../../../prisma/types/location";
import type { LocationImageRecordInput } from "../schema/image.schema";
import type {
  CreateLocationInput,
  SearchLocationQueryInput,
  UpdateLocationInput,
} from "../schema/location.schema";
import type { LocationStatus } from "../domain/location";

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
  ): Promise<LocationModelWithImages>;
  delete(id: string): Promise<void>;
}
