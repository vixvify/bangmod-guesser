export type LocationImage = {
  id: string;
  name: string;
  url: string;
};

export type Location = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  images: LocationImage[];
};
