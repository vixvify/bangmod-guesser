export const USER_MESSAGES = {
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
