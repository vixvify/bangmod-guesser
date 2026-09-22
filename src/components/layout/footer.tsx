import Link from "next/link";
import { AppRoutes } from "@/routes/app/routes";

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="border-t border-secondary-light/10 bg-secondary-dark px-6 py-14 text-secondary-light/75 sm:px-12 lg:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <div>
              <span className="font-display text-2xl tracking-tight text-secondary-light">
                BANGMOD <span className="text-primary-main">GUESSER</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-secondary-light/70">
              เกมทายพิกัดสถานที่ในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (บางมด)
              ชวนคุณกลับมาสำรวจมุมโปรดและทางที่เดินผ่านทุกวันด้วยสายตาใหม่
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-secondary-light">
              ไปยังหน้าอื่น ๆ
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href={AppRoutes.home}
                  className="transition-colors hover:text-primary-light"
                >
                  หน้าแรก
                </Link>
              </li>
              <li>
                <a
                  href="#introduction"
                  className="transition-colors hover:text-primary-light"
                >
                  ทำความรู้จักเกม
                </a>
              </li>
              <li>
                <a
                  href="#how-to-play"
                  className="transition-colors hover:text-primary-light"
                >
                  วิธีเล่น
                </a>
              </li>
              <li>
                <a
                  href="#credits"
                  className="transition-colors hover:text-primary-light"
                >
                  คณะผู้จัดทำ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-secondary-light">
              เกี่ยวกับโครงการ
            </h3>
            <div className="mt-4 space-y-2 text-sm text-secondary-light/65">
              <p>วิชา Web Programming 1</p>
              <p>สาขาวิทยาการคอมพิวเตอร์ประยุกต์ (ACS)</p>
              <p>ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์</p>
              <p>มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-secondary-light/10 pt-8 text-center text-xs text-secondary-light/50 sm:text-left">
          <p>
            © {new Date().getFullYear()} Bangmod Guesser. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
