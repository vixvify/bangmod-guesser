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
};

export function ListPagination({
  totalItems,
  pageSize,
  itemLabel,
  page,
  onPageChange,
}: ListPaginationProps) {
  const [selectedPage, setSelectedPage] = useState(1);
  const currentPage = page ?? selectedPage;
  const { pageCount, firstItem, lastItem } = getPagination(totalItems, currentPage, pageSize);

  return (
    <div className="mt-5 flex flex-col gap-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
      <p>แสดง {firstItem}–{lastItem} จาก {totalItems} {itemLabel}</p>
      <Pagination
        count={pageCount}
        page={currentPage}
        onChange={(_, nextPage) => {
          if (page === undefined) setSelectedPage(nextPage);
          onPageChange?.(nextPage);
        }}
        aria-label={`หน้ารายการ${itemLabel}`}
        sx={{
          "& .MuiPaginationItem-root": {
            fontFamily: "var(--font-prompt), sans-serif",
            "&.Mui-selected": {
              backgroundColor: "var(--color-secondary-dark)",
              color: "#fff",
              "&:hover": { backgroundColor: "var(--color-primary-main)" },
            },
          },
        }}
      />
    </div>
  );
}
