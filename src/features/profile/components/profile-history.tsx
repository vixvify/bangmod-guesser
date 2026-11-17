"use client";

import { useEffect, useRef, useState } from "react";
import { GameHistory } from "@/features/profile/components/game-history";
import { HistorySkeleton } from "@/features/profile/components/history-skeleton";
import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { ListPagination } from "@/shared/components/ui/list-pagination";
import type { ProfileResult } from "@/features/profile/profile";
import type { ProfileQueryInput } from "@/features/profile/profile.schema";
import httpClient from "@/shared/lib/http";
import { ProfileRoutes } from "@/features/profile/profile.routes";
import { AppRoutes } from "@/shared/routes/routes";
import { getErrorMessage } from "@/shared/lib/error-message";

type ProfileHistoryProps = {
  initialProfile: ProfileResult;
  initialQuery: ProfileQueryInput;
  userId?: string;
};

export function ProfileHistory({ initialProfile, initialQuery, userId }: ProfileHistoryProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [query, setQuery] = useState(initialQuery);
  const [pickerKey, setPickerKey] = useState(0);
  const [pickerRange, setPickerRange] = useState({
    startDate: initialQuery.from ?? null,
    endDate: initialQuery.to ?? null,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const lastRequestedQuery = useRef(initialQuery);

  useEffect(() => () => request.current?.abort(), []);

  async function loadHistory(nextQuery: ProfileQueryInput) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    lastRequestedQuery.current = nextQuery;
    setLoading(true);
    setErrorMessage(null);

    const params = new URLSearchParams({ page: String(nextQuery.page) });
    if (nextQuery.from) params.set("from", nextQuery.from);
    if (nextQuery.to) params.set("to", nextQuery.to);
    if (userId) params.set("userId", userId);

    try {
      const { data } = await httpClient.get<ProfileResult>(
        `${ProfileRoutes.history}?${params}`,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setProfile(data);
      setQuery(nextQuery);
      const basePath = userId ? AppRoutes.userProfile(userId) : AppRoutes.profile;
      const historyParams = new URLSearchParams(params);
      historyParams.delete("userId");
      const queryString = historyParams.toString();
      window.history.replaceState(
        window.history.state,
        "",
        queryString ? `${basePath}?${queryString}` : basePath,
      );
    } catch (error) {
      if (!controller.signal.aborted) setErrorMessage(getErrorMessage(error, "โหลดประวัติการเล่นไม่สำเร็จ"));
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
      <div className="flex flex-col gap-5 rounded-2xl border border-surface-border bg-surface-overlay p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
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
        <HistorySkeleton />
      ) : errorMessage ? (
        <div role="alert" className="mt-4 rounded-2xl border border-surface-border p-6 text-center text-surface-text">
          <p>{errorMessage}</p>
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
