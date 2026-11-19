"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useEffect, useRef, useState } from "react";
import { DashboardGameDetailsModal } from "@/features/dashboard/components/dashboard-game-details-modal";
import { DashboardGamesTable } from "@/features/dashboard/components/dashboard-games-table";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Input } from "@/shared/components/ui/input";
import { ListPagination } from "@/shared/components/ui/list-pagination";
import { TableSkeleton } from "@/shared/components/ui/table-skeleton";
import type {
  DashboardGameLog,
  DashboardGameLogs,
  DashboardPeriod,
} from "@/features/dashboard/dashboard";
import { useDebounce } from "@/shared/hooks/use-debounce";
import httpClient from "@/shared/lib/http";
import { DashboardRoutes } from "@/features/dashboard/dashboard.routes";
import { getErrorMessage } from "@/shared/lib/error-message";

export function DashboardRecentGames({
  initialGames,
  period,
}: {
  initialGames: DashboardGameLogs;
  period: DashboardPeriod;
}) {
  const [games, setGames] = useState(initialGames);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const [page, setPage] = useState(initialGames.page);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<DashboardGameLog | null>(
    null,
  );
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const controller = new AbortController();
    async function loadGames() {
      setLoading(true);
      setErrorMessage(null);
      const params = new URLSearchParams({
        startDate: period.startDate,
        endDate: period.endDate,
        page: String(page),
        pageSize: String(initialGames.pageSize),
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      try {
        const { data } = await httpClient.get<DashboardGameLogs>(
          `${DashboardRoutes.games}?${params}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setGames(data);
      } catch (error) {
        if (!controller.signal.aborted) setErrorMessage(getErrorMessage(error, "โหลดรายการเกมไม่สำเร็จ ลองค้นหาอีกครั้ง"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadGames();
    return () => controller.abort();
  }, [
    debouncedSearch,
    page,
    period.startDate,
    period.endDate,
    initialGames.pageSize,
  ]);

  return (
    <section aria-labelledby="recent-games-title" className="mt-8">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="recent-games-title" className="text-xl font-bold">
            บันทึกเกมล่าสุด
          </h2>
          <p className="mt-1 text-xs text-surface-muted">
            รายการเกมของผู้เล่นในช่วงวันที่เลือก
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input theme="dark"
            id="dashboard-game-search"
            label="ค้นหาเกมหรือผู้เล่น"
            size="small"
            placeholder="ชื่อผู้ใช้ หรือ Game ID"
            icon={<SearchRoundedIcon />}
            value={search}
            onClear={() => {
              setSearch("");
              setPage(1);
            }}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {loading ? (
        <TableSkeleton label="กำลังโหลดบันทึกเกม" columns={7} />
      ) : errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-surface-overlay p-8 text-center text-red-300"
        >
          {errorMessage}
        </div>
      ) : games.items.length === 0 ? (
        <EmptyState theme="dark"
          title="ไม่พบเกมในช่วงที่เลือก"
          description="ลองเลือกช่วงวันหรือคำค้นหาอื่น"
        />
      ) : (
        <DashboardGamesTable games={games.items} onView={setSelectedGame} />
      )}
      {!loading && !errorMessage && games.total > 0 && (
        <ListPagination theme="dark"
          totalItems={games.total}
          pageSize={games.pageSize}
          page={games.page}
          itemLabel="เกม"
          onPageChange={setPage}
        />
      )}
      <DashboardGameDetailsModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </section>
  );
}
