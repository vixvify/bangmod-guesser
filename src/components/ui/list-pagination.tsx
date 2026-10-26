"use client";

import Pagination from "@mui/material/Pagination";
import { useState } from "react";
import { getPagination } from "@/lib/utils";

type ListPaginationProps = {
  totalItems: number;
  pageSize: number;
  itemLabel: string;
  page?: number;
  onPageChange?: (page: number) => void;
  theme?: "light" | "dark";
};

export function ListPagination({
  totalItems,
  pageSize,
  itemLabel,
  page,
  onPageChange,
  theme = "light",
}: ListPaginationProps) {
  const isDark = theme === "dark";
  const [selectedPage, setSelectedPage] = useState(1);
  const currentPage = page ?? selectedPage;
  const { pageCount, firstItem, lastItem } = getPagination(totalItems, currentPage, pageSize);

  return (
    <div className={`mt-5 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between ${isDark ? "text-surface-muted" : "text-neutral-600"}`}>
      <p>แสดง {firstItem}–{lastItem} จาก {totalItems} {itemLabel}</p>
      <Pagination
        count={pageCount}
        page={currentPage}
        onChange={(_, nextPage) => {
          if (page === undefined) setSelectedPage(nextPage);
          onPageChange?.(nextPage);
        }}
        aria-label={`หน้ารายการ${itemLabel}`}
        getItemAriaLabel={(type, pageNumber, selected) => {
          if (type === "page") return `${selected ? "หน้าปัจจุบัน" : "ไปหน้า"} ${pageNumber}`;
          if (type === "first") return "หน้าแรก";
          if (type === "last") return "หน้าสุดท้าย";
          if (type === "next") return "หน้าถัดไป";
          if (type === "previous") return "หน้าก่อนหน้า";
          return "มีหน้าเพิ่มเติม";
        }}
        sx={{
          "& .MuiPaginationItem-root": {
            fontFamily: "var(--font-prompt), sans-serif",
            color: isDark ? "var(--color-surface-text)" : undefined,
            border: isDark ? "1px solid var(--color-surface-border)" : undefined,
            backgroundColor: isDark ? "var(--color-surface-control)" : undefined,
            "&:hover": isDark ? { backgroundColor: "var(--color-surface-control-hover)" } : undefined,
            "&.Mui-selected": {
              backgroundColor: isDark ? "var(--color-primary-main)" : "var(--color-secondary-dark)",
              color: isDark ? "var(--color-secondary-main)" : "#fff",
              borderColor: isDark ? "var(--color-primary-main)" : undefined,
              "&:hover": { backgroundColor: isDark ? "var(--color-primary-hover)" : "var(--color-primary-main)" },
            },
          },
        }}
      />
    </div>
  );
}
