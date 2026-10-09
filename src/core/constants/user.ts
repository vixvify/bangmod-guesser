export const USER_MESSAGES = {
  empty: "ไม่พบผู้ใช้",
  loadFailed: "โหลดรายชื่อผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง",
  updateSuccess: "แก้ไขผู้ใช้สำเร็จ",
  updateFailed: "แก้ไขผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง",
  deleteSuccess: "ลบผู้ใช้สำเร็จ",
  deleteFailed: "ลบผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง",
  updateConfirm: {
    title: "ยืนยันการแก้ไขผู้ใช้",
    description: "ต้องการบันทึกข้อมูลผู้ใช้ที่แก้ไขหรือไม่?",
    confirm: "ยืนยัน",
    cancel: "กลับไปแก้ไข",
  },
  discardConfirm: {
    title: "ยกเลิกการแก้ไข?",
    description: "ข้อมูลที่ยังไม่ได้บันทึกจะหายไป ต้องการปิดหน้าต่างนี้หรือไม่?",
    confirm: "ออกโดยไม่บันทึก",
    cancel: "กลับไปแก้ไข",
  },
  delete: {
    title: "ลบผู้ใช้",
    description: (name: string) => `คุณต้องการลบ ${name} หรือไม่?`,
    confirm: "ยืนยัน",
    cancel: "ยกเลิก",
  },
  suspensionRequired: "กรุณาเลือกช่วงวันที่ระงับ",
  suspensionOrder: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น",
  reasonMax: "เหตุผลต้องไม่เกิน 200 ตัวอักษร",
} as const;
