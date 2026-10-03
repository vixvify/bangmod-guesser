export const LOCATION_MESSAGES = {
  delete: {
    title: "ลบสถานที่",
    description: (name: string) => `คุณต้องการลบ ${name} หรือไม่?`,
    confirm: "ยืนยัน",
    cancel: "ยกเลิก",
  },
  nameRequired: "กรุณากรอกชื่อสถานที่",
  nameMax: "ชื่อสถานที่ต้องไม่เกิน 100 ตัวอักษร",
  descriptionMax: "คำอธิบายต้องไม่เกิน 500 ตัวอักษร",
  coordinateRequired: (label: string) => `กรุณากรอก${label}`,
  coordinateNumber: (label: string) => `${label}ต้องเป็นตัวเลข`,
  coordinateRange: (label: string, min: number, max: number) =>
    `${label}ต้องอยู่ระหว่าง ${min} ถึง ${max}`,
  imageInvalid: "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB",
  imageLimit: "แนบรูปได้สูงสุด 5 รูป",
} as const;

export const LOCATION_MAX_IMAGES = 5;
