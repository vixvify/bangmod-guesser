export enum LocationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type LocationImage = {
  imageNumber: number;
  name: string;
  url: string;
};

export type Location = {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status?: LocationStatus;
  images: LocationImage[];
  createdAt?: Date;
  updatedAt?: Date | null;
};

export interface PaginatedLocations {
  items: Location[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
