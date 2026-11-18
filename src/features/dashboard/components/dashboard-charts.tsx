"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "@/features/dashboard/dashboard";

const number = (value: number) => new Intl.NumberFormat("th-TH").format(value);

export function DashboardCharts({
  dailyGames,
  scores,
}: Pick<DashboardSummary, "dailyGames" | "scores">) {
  const buckets = scores.buckets.map((bucket) => ({
    label: bucket.maxInclusive
      ? number(bucket.min)
      : `${bucket.min / 1000}–${bucket.max / 1000}k`,
    count: bucket.count,
  }));

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <section aria-labelledby="daily-games-title">
        <h2 id="daily-games-title" className="mb-3 text-lg font-bold">
          แนวโน้มจำนวนเกมที่เล่น
        </h2>
        <div className="rounded-2xl border border-surface-border bg-surface-overlay px-4 pt-5 pb-4 shadow-sm">
          <div
            role="img"
            aria-label={`จำนวนเกมรายวันในช่วงที่เลือก รวม ${number(dailyGames.reduce((sum, day) => sum + day.count, 0))} เกม`}
          >
            <AreaChart
              responsive
              data={dailyGames}
              style={{ width: "100%", height: 220 }}
              margin={{ top: 12, right: 12, bottom: 0, left: -20 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient
                  id="dashboard-trend-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop stopColor="var(--color-primary-main)" stopOpacity={0.3} />
                  <stop offset="1" stopColor="var(--color-primary-main)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--color-surface-border)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date: string) => date.slice(5)}
                minTickGap={28}
                tick={{ fontSize: 11, fill: "var(--color-surface-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--color-surface-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-secondary-main)", borderColor: "var(--color-surface-border)", color: "var(--color-surface-text)" }}
                formatter={(value) => [
                  `${number(Number(value))} เกม`,
                  "จำนวนเกม",
                ]}
                labelFormatter={(date) => `วันที่ ${date}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-primary-main)"
                strokeWidth={3}
                fill="url(#dashboard-trend-fill)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </div>
          <p className="mt-3 border-t border-surface-border pt-3 text-xs text-surface-muted">
            รวม {number(dailyGames.reduce((sum, day) => sum + day.count, 0))}{" "}
            เกมในช่วงที่เลือก
          </p>
        </div>
      </section>
      <section aria-labelledby="score-distribution-title">
        <h2 id="score-distribution-title" className="mb-3 text-lg font-bold">
          การกระจายตัวของคะแนน
        </h2>
        <div className="rounded-2xl border border-surface-border bg-surface-overlay px-4 pt-5 pb-4 shadow-sm">
          <div
            role="img"
            aria-label={`คะแนนจาก ${number(scores.count)} เกม ค่ากลาง ${scores.median === null ? "ไม่มีข้อมูล" : number(scores.median)}`}
          >
            <BarChart
              responsive
              data={buckets}
              style={{ width: "100%", height: 220 }}
              margin={{ top: 12, right: 8, bottom: 0, left: -28 }}
              accessibilityLayer
            >
              <CartesianGrid
                stroke="var(--color-surface-border)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                interval={0}
                tick={{ fontSize: 10, fill: "var(--color-surface-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--color-surface-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-secondary-main)", borderColor: "var(--color-surface-border)", color: "var(--color-surface-text)" }}
                formatter={(value) => [
                  `${number(Number(value))} เกม`,
                  "จำนวนเกม",
                ]}
              />
              <Bar
                dataKey="count"
                fill="var(--color-primary-main)"
                radius={[5, 5, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </div>
          <p className="mt-3 flex flex-wrap justify-between gap-2 border-t border-surface-border pt-3 text-xs text-surface-muted">
            <span>
              เกิน {number(scores.highAccuracy.threshold)} คะแนน:{" "}
              {scores.highAccuracy.percentage === null
                ? "—"
                : `${scores.highAccuracy.percentage}%`}
            </span>
            <span className="font-semibold text-surface-text">
              ค่ากลาง: {scores.median === null ? "—" : number(scores.median)}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
