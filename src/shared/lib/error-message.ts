type HttpFailure = {
  name: "HttpError";
  status?: number;
  retryAfter?: number;
};

function isHttpFailure(error: unknown): error is HttpFailure {
  return error instanceof Error && error.name === "HttpError";
}

export function getHttpErrorStatus(error: unknown): number | undefined {
  return isHttpFailure(error) ? error.status : undefined;
}

export function getErrorMessage(
  error: unknown,
  fallback: string,
  overrides: Partial<Record<number, string>> = {},
): string {
  if (!isHttpFailure(error)) return fallback;
  const { status, retryAfter } = error;
  if (status === undefined) return "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง";
  if (overrides[status]) return overrides[status];
  switch (status) {
    case 400:
    case 422:
      return "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง";
    case 401:
      return "ไม่สามารถยืนยันตัวตนได้ กรุณาเข้าสู่ระบบอีกครั้ง";
    case 403:
      return "คุณไม่มีสิทธิ์ดำเนินการนี้";
    case 404:
      return "ไม่พบข้อมูลที่ต้องการ ข้อมูลอาจถูกลบแล้ว";
    case 408:
      return "การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองอีกครั้ง";
    case 409:
      return "ข้อมูลหรือสถานะไม่ตรงกับปัจจุบัน กรุณาโหลดข้อมูลล่าสุดแล้วลองอีกครั้ง";
    case 413:
      return "ข้อมูลหรือไฟล์ที่ส่งมีขนาดใหญ่เกินไป";
    case 429:
      return retryAfter && Number.isFinite(retryAfter) && retryAfter > 0
        ? `ส่งคำขอบ่อยเกินไป กรุณารอ ${Math.ceil(retryAfter)} วินาทีแล้วลองอีกครั้ง`
        : "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง";
    case 503:
      return "บริการไม่พร้อมใช้งานชั่วคราว กรุณาลองอีกครั้งภายหลัง";
    default:
      return status >= 500
        ? "เซิร์ฟเวอร์เกิดข้อผิดพลาด กรุณาลองอีกครั้งภายหลัง"
        : fallback;
  }
}
