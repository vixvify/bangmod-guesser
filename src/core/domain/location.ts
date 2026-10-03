export type LocationImage = {
  imageNumber: number;
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
