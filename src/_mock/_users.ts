import { UserRole } from "@/core/domain/user";
import type { ManagedUser } from "@/core/domain/admin-user";

const users: (Omit<ManagedUser, "suspension" | "reason"> & Partial<Pick<ManagedUser, "suspension" | "reason">>)[] = [
  {
    id: "u-01",
    name: "vixvify_v",
    email: "vixvify.v@kmutt.ac.th",
    image: null,
    role: UserRole.ADMIN,
    status: "ACTIVE",
    gameCount: 29,
  },
  {
    id: "u-02",
    name: "auntonin",
    email: "auntonin@kmutt.ac.th",
    image: null,
    role: UserRole.ADMIN,
    status: "ACTIVE",
    gameCount: 56,
  },
  {
    id: "u-03",
    name: "helianthwan",
    email: "helianthwan@kmutt.ac.th",
    image: null,
    role: UserRole.ADMIN,
    status: "ACTIVE",
    gameCount: 32,
  },
  {
    id: "u-04",
    name: "ponddd",
    email: "ponddd@kmutt.ac.th",
    image: null,
    role: UserRole.USER,
    status: "ACTIVE",
    gameCount: 10,
  },
  {
    id: "u-05",
    name: "phurit",
    email: "phurit@kmutt.ac.th",
    image: null,
    role: UserRole.USER,
    status: "ACTIVE",
    gameCount: 22,
  },
  {
    id: "u-06",
    name: "l00ktarn",
    email: "l00ktarn@kmutt.ac.th",
    image: null,
    role: UserRole.USER,
    status: "ACTIVE",
    gameCount: 4,
  },
  {
    id: "u-07",
    name: "mind_mint",
    email: "mind.mint@kmutt.ac.th",
    image: null,
    role: UserRole.USER,
    status: "TEMPORARY",
    gameCount: 49,
    suspension: { startDate: "2026-09-02", endDate: "2026-09-04" },
    reason: "ละเมิดกติกา",
  },
  {
    id: "u-08",
    name: "me_mie",
    email: "me.mie@kmutt.ac.th",
    image: null,
    role: UserRole.USER,
    status: "ACTIVE",
    gameCount: 19,
  },
  {
    id: "u-09",
    name: "phobrak",
    email: "phobrak.khun@kmutt.ac.th",
    image: null,
    role: UserRole.USER,
    status: "SUSPENDED",
    gameCount: 67,
    reason: "ละเมิดกติกาซ้ำ",
  },
];

export const mockUsers: ManagedUser[] = users.map((user) => ({
  ...user,
  suspension: user.suspension ?? { startDate: null, endDate: null },
  reason: user.reason ?? "",
}));

export const mockUserTotal = 372;
