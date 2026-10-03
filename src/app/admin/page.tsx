import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/routes/app/routes";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        ภาพรวมระบบ
      </h1>
      <p className="mt-2 text-sm text-slate-500 sm:text-base">
        เลือกส่วนที่ต้องการจัดการ
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PeopleOutlineRoundedIcon
            sx={{ color: "var(--color-primary-main)", fontSize: "2rem" }}
          />
          <h2 className="mt-4 text-xl font-bold">จัดการผู้ใช้</h2>
          <p className="mt-2 mb-6 text-sm text-slate-500">
            ดูบัญชีผู้เล่น บทบาท และสถานะการใช้งาน
          </p>
          <Button href={AppRoutes.adminUsers} variant="primary" size="small">
            จัดการผู้ใช้ <ArrowForwardRoundedIcon fontSize="small" />
          </Button>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PlaceOutlinedIcon
            sx={{ color: "var(--color-primary-main)", fontSize: "2rem" }}
          />
          <h2 className="mt-4 text-xl font-bold">จัดการสถานที่</h2>
          <p className="mt-2 mb-6 text-sm text-slate-500">
            เพิ่ม แก้ไข และดูรูปภาพสถานที่ในเกม
          </p>
          <Button
            href={AppRoutes.adminLocations}
            variant="primary"
            size="small"
          >
            จัดการสถานที่ <ArrowForwardRoundedIcon fontSize="small" />
          </Button>
        </section>
      </div>
    </div>
  );
}
