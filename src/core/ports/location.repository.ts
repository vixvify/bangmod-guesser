import type {
  GetLocationRecordsResult,
  LocationModelWithImages,
} from "../../../prisma/types/location";
import type {
  CreateLocationRecordInput,
  GetLocationRecordsInput,
  UpdateLocationRecordInput,
} from "../schema/location.schema";

export interface LocationRepository {
  findMany(query: GetLocationRecordsInput): Promise<GetLocationRecordsResult>;
  findById(id: string): Promise<LocationModelWithImages | null>;
  create(input: CreateLocationRecordInput): Promise<LocationModelWithImages>;
  update(
    id: string,
    input: UpdateLocationRecordInput,
  ): Promise<LocationModelWithImages>;
  delete(id: string): Promise<void>;
}
