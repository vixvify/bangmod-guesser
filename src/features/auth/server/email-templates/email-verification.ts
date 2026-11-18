import { escapeHtml, getEmailVerificationUrl } from "../validate-url";

export function createEmailVerification(url: string) {
  const verificationUrl = getEmailVerificationUrl(url).toString();
  const title = "ยืนยันอีเมล";
  const instructions = "เปิดลิงก์ด้านล่างเพื่อยืนยันอีเมลสำหรับบัญชี Bangmod Guesser ของคุณ";
  const expiry = "ลิงก์นี้มีอายุ 1 ชั่วโมง หากคุณไม่ได้สมัครสมาชิก สามารถละเว้นอีเมลฉบับนี้ได้";

  return {
    subject: `${title} | Bangmod Guesser`,
    text: [instructions, verificationUrl, expiry].join("\n\n"),
    html: `<div lang="th" style="font-family:Arial,Tahoma,sans-serif;line-height:1.6">
      <h1>${title}</h1>
      <p>${instructions}</p>
      <p><a href="${escapeHtml(verificationUrl)}">${title}</a></p>
      <p>${expiry}</p>
    </div>`,
  };
}
