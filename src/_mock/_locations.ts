import type { Location } from "@/core/domain/location";

const imageUrls = [
  "/images/kmutt-bangmod-panorama.jpg",
  "/images/kmutt-bangmod-1.jpg",
  "/images/kmutt-bangmod-3.jpg",
  "/images/kmutt-bangmod-4.jpg",
  "/images/kmutt-bangmod-5.jpg",
];

const rows = [
  ["อาคารเรียนรวม 2 (CB2)", 2],
  ["สำนักหอสมุด", 3],
  ["อาคารเรียนรวม 4 (CB4)", 5],
  ["โรงอาหารพระจอมเกล้าธนบุรี", 4],
  ["ลานพระบรมราชานุสาวรีย์ รัชกาลที่ 4", 1],
  ["สนามฟุตบอล", 5],
  ["อาคารสำนักงานอธิการบดี", 3],
  ["อาคารคณะวิทยาศาสตร์", 2],
  ["อาคารคณะครุศาสตร์อุตสาหกรรม", 4],
] as const;

export const mockLocations: Location[] = rows.map(([name, imageCount], index) => ({
  id: `location-${String(index + 1).padStart(2, "0")}`,
  name,
  description: index === 0 ? "อาคารเรียนรวมภายในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี" : "",
  latitude: 13.6516,
  longitude: 100.4952,
  images: imageUrls.slice(0, imageCount).map((url, imageIndex) => ({
    imageNumber: imageIndex + 1,
    name: `location-${String(imageIndex + 1).padStart(2, "0")}.jpg`,
    url,
  })),
}));

export const mockLocationTotal = 72;
