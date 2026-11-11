import { escapeHtml, validateResetUrl } from "../validate-url";

export function createPasswordResetEmail(url: string) {
  const validatedUrl = validateResetUrl(url).toString();
  const safeUrl = escapeHtml(validatedUrl);

  return {
    subject: "เปลี่ยนรหัสผ่าน | Bangmod Guesser",
    text: [
      "สวัสดี!",
      "",
      "เราได้รับคำขอเปลี่ยนรหัสผ่านสำหรับบัญชี Bangmod Guesser ของคุณ",
      "",
      "หากคุณเป็นผู้ส่งคำขอ กรุณาเปิดลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่าน:",
      validatedUrl,
      "",
      "ลิงก์นี้มีอายุ 15 นาที",
      "",
      "หากคุณไม่ได้ส่งคำขอเปลี่ยนรหัสผ่าน สามารถละเว้นอีเมลฉบับนี้ได้",
      "",
      "Bangmod Guesser",
    ].join("\n"),
    html: `
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>เปลี่ยนรหัสผ่าน | Bangmod Guesser</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Tahoma, sans-serif; color: #1f2937;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="background-color: #f3f4f6; padding: 40px 16px;"
          >
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden;"
                >
                  <tr>
                    <td style="padding: 28px 32px; background-color: #ff7a2f; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                        Bangmod Guesser
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h2 style="margin: 0 0 20px; font-size: 22px; color: #111827;">
                        เปลี่ยนรหัสผ่าน
                      </h2>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7;">
                        สวัสดี!
                      </p>
                      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7;">
                        เราได้รับคำขอเปลี่ยนรหัสผ่านสำหรับบัญชี Bangmod Guesser ของคุณ
                      </p>
                      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7;">
                        หากคุณเป็นผู้ส่งคำขอ กรุณากดปุ่มด้านล่างเพื่อเปลี่ยนรหัสผ่าน
                      </p>
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        style="margin: 0 auto 24px;"
                      >
                        <tr>
                          <td align="center" style="border-radius: 8px; background-color: #ca4d0a;">
                            <a
                              href="${safeUrl}"
                              style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px;"
                            >
                              เปลี่ยนรหัสผ่าน
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.7; color: #4b5563;">
                        ลิงก์นี้มีอายุ 15 นาทีนับจากเวลาที่ส่งอีเมล
                      </p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6b7280;">
                        หากคุณไม่ได้ส่งคำขอเปลี่ยนรหัสผ่าน สามารถละเว้นอีเมลฉบับนี้ได้ บัญชีของคุณจะยังคงปลอดภัย
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 32px; background-color: #f9fafb; text-align: center;">
                      <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                        Bangmod Guesser
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}
