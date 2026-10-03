export enum LocationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface LocationImageItem {
  imageNumber: number;
  imageUrl: string;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  images: LocationImageItem[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface PaginatedLocations {
  items: Location[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
