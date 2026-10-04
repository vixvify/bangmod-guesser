export const LOCATION_MESSAGES = {
  empty: "ไม่พบสถานที่",
  emptyDescription: "ยังไม่มีสถานที่ในระบบ เริ่มต้นด้วยการสร้างสถานที่ใหม่",
  emptySearchDescription: "ลองใช้คำค้นหาอื่น หรือล้างการค้นหาเพื่อดูสถานที่ทั้งหมด",
  clearSearch: "ล้างการค้นหา",
  createSuccess: "สร้างสถานที่สำเร็จ",
  createFailed: "สร้างสถานที่ไม่สำเร็จ กรุณาลองอีกครั้ง",
  updateSuccess: "แก้ไขสถานที่สำเร็จ",
  updateFailed: "แก้ไขสถานที่ไม่สำเร็จ กรุณาลองอีกครั้ง",
  createConfirm: {
    title: "ยืนยันการสร้างสถานที่",
    description: "ตรวจสอบข้อมูล พิกัด และรูปภาพก่อนสร้างสถานที่",
    confirm: "ยืนยัน",
    cancel: "กลับไปแก้ไข",
  },
  updateConfirm: {
    title: "ยืนยันการแก้ไขสถานที่",
    description: "ต้องการบันทึกข้อมูล พิกัด และรูปภาพที่แก้ไขหรือไม่?",
    confirm: "ยืนยัน",
    cancel: "กลับไปแก้ไข",
  },
  discardConfirm: {
    title: "ยกเลิกการแก้ไข?",
    description: "ข้อมูลที่ยังไม่ได้บันทึกจะหายไป ต้องการออกจากหน้านี้หรือไม่?",
    confirm: "ออกโดยไม่บันทึก",
    cancel: "กลับไปแก้ไข",
  },
  deleteSuccess: "ลบสถานที่สำเร็จ",
  deleteFailed: "ลบสถานที่ไม่สำเร็จ กรุณาลองอีกครั้ง",
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
