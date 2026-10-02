import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdminLayout from "@/app/admin/layout";
import { UserRole } from "@/core/domain/user";
import { requireAuth } from "@/lib/auth-check";

vi.mock("@/lib/auth-check", () => ({ requireAuth: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/auth-client", () => ({ authClient: { signOut: vi.fn() } }));

describe("AdminLayout", () => {
  it("allows an admin to view the management page in MainLayout", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "admin-1", name: "Admin", email: "admin@kmutt.ac.th", role: UserRole.ADMIN });
    const markup = renderToStaticMarkup(await AdminLayout({ children: <p>Management content</p> }));
    expect(markup).toContain("Management content");
    expect(markup).toContain('data-layout-content="contained"');
  });

  it("rejects a regular user", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "user-1", name: "User", email: "user@kmutt.ac.th", role: UserRole.USER });
    await expect(AdminLayout({ children: <p>Management content</p> })).rejects.toMatchObject({ status: 403 });
  });
});
