"use client";

import { useEffect, useRef, useState } from "react";
import { GameHistory } from "@/features/profile/components/game-history";
import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { ListPagination } from "@/shared/components/ui/list-pagination";
import type { ProfileResult } from "@/features/profile/domain/profile";
import type { ProfileQueryInput } from "@/features/profile/schema/profile.schema";
import httpClient from "@/shared/lib/http";
import { ProfileRoutes } from "@/features/profile/routes/profile.routes";
import { AppRoutes } from "@/shared/routes/routes";

type ProfileHistoryProps = {
  initialProfile: ProfileResult;
  initialQuery: ProfileQueryInput;
};

export function ProfileHistory({ initialProfile, initialQuery }: ProfileHistoryProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [query, setQuery] = useState(initialQuery);
  const [pickerKey, setPickerKey] = useState(0);
  const [pickerRange, setPickerRange] = useState({
    startDate: initialQuery.from ?? null,
    endDate: initialQuery.to ?? null,
  });
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  const lastRequestedQuery = useRef(initialQuery);

  useEffect(() => () => request.current?.abort(), []);

  async function loadHistory(nextQuery: ProfileQueryInput) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    lastRequestedQuery.current = nextQuery;
    setLoading(true);
    setFailed(false);

    const params = new URLSearchParams({ page: String(nextQuery.page) });
    if (nextQuery.from) params.set("from", nextQuery.from);
    if (nextQuery.to) params.set("to", nextQuery.to);

    try {
      const { data } = await httpClient.get<ProfileResult>(
        `${ProfileRoutes.history}?${params}`,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setProfile(data);
      setQuery(nextQuery);
      window.history.replaceState(window.history.state, "", `${AppRoutes.profile}?${params}`);
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="game-history-title"
      aria-busy={loading}
      className="mt-5 rounded-3xl border border-surface-border bg-surface-overlay p-4 shadow-2xl shadow-black/20 sm:p-6"
    >
      <div className="flex flex-col gap-5 rounded-2xl border border-surface-border bg-surface-overlay p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <h2 id="game-history-title" className="text-xl font-bold text-surface-text">
            ประวัติการเล่นเกม
          </h2>
          <p className="text-sm text-primary-light">Game History</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <DateRangePicker
            key={pickerKey}
            label="เลือกช่วงเวลา"
            defaultValue={pickerRange}
            onChange={({ startDate, endDate }) => {
              if (startDate && endDate) {
                void loadHistory({ from: startDate, to: endDate, page: 1 });
              }
            }}
            theme="dark"
          />
          {(query.from || query.to) && (
            <Button
              variant="outline"
              size="small"
              sound="click"
              onClick={() => {
                setPickerRange({ startDate: null, endDate: null });
                setPickerKey((key) => key + 1);
                void loadHistory({ page: 1 });
              }}
            >
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p role="status" className="mt-4 py-12 text-center text-surface-muted">
          กำลังโหลดประวัติการเล่น...
        </p>
      ) : failed ? (
        <div role="alert" className="mt-4 rounded-2xl border border-surface-border p-6 text-center text-surface-text">
          <p>โหลดประวัติการเล่นไม่สำเร็จ</p>
          <Button
            variant="outline"
            size="small"
            sound="click"
            className="mt-3"
            onClick={() => void loadHistory(lastRequestedQuery.current)}
          >
            ลองอีกครั้ง
          </Button>
        </div>
      ) : (
        <>
          <GameHistory games={profile.games} />
          {profile.pagination.totalGames > 0 && (
            <ListPagination
              totalItems={profile.pagination.totalGames}
              pageSize={profile.pagination.pageSize}
              page={profile.pagination.page}
              onPageChange={(page) => void loadHistory({ ...query, page })}
              itemLabel="เกม"
              theme="dark"
            />
          )}
        </>
      )}
    </section>
  );
}
