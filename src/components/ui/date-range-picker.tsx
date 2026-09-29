"use client";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Popover from "@mui/material/Popover";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { useId, useState } from "react";
import { formatThaiDateRange } from "@/utils/format-date";
import "dayjs/locale/th";

type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

type DateRangePickerProps = {
  label: string;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
};

export function DateRangePicker({
  label,
  defaultValue,
  onChange,
}: DateRangePickerProps) {
  const [range, setRange] = useState<DateRange>(
    defaultValue ?? { startDate: null, endDate: null },
  );
  const inputId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const displayValue =
    range.startDate && range.endDate
      ? formatThaiDateRange(
          dayjs(range.startDate).toDate(),
          dayjs(range.endDate).toDate(),
        )
      : range.startDate
        ? dayjs(range.startDate).locale("th").format("D MMMM YYYY")
        : "เลือกช่วงวันที่";

  function selectDate(date: Dayjs | null) {
    if (!date || !date.isValid()) return;

    const selectedDate = date.format("YYYY-MM-DD");
    const nextRange =
      !range.startDate ||
      range.endDate ||
      date.isBefore(dayjs(range.startDate), "day")
        ? { startDate: selectedDate, endDate: null }
        : { startDate: range.startDate, endDate: selectedDate };

    setRange(nextRange);
    onChange?.(nextRange);
    if (nextRange.endDate) setAnchor(null);
  }

  return (
    <div className="w-full sm:w-80">
      <FormControl fullWidth>
        <FormLabel htmlFor={inputId} sx={{ mb: 0.5, fontSize: "0.75rem" }}>
          {label}
        </FormLabel>
        <OutlinedInput
          id={inputId}
          value={displayValue}
          readOnly
          size="small"
          onClick={(event) => setAnchor(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setAnchor(event.currentTarget);
            }
          }}
          inputProps={{
            "aria-haspopup": "dialog",
            "aria-expanded": Boolean(anchor),
          }}
          endAdornment={
            <InputAdornment position="end">
              <CalendarMonthOutlinedIcon fontSize="small" aria-hidden="true" />
            </InputAdornment>
          }
          sx={{
            borderRadius: "0.5rem",
            backgroundColor: "#f1f5f9",
            fontFamily: "var(--font-prompt), sans-serif",
            cursor: "pointer",
            "& input": {
              cursor: "pointer",
              fontSize: "0.75rem",
              textOverflow: "ellipsis",
            },
            "&:hover": { backgroundColor: "#fff" },
          }}
        />
      </FormControl>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { borderRadius: "1rem", mt: 1 } } }}
      >
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-5 py-4 text-sm text-secondary-dark">
          <div>
            <p className="text-xs text-neutral-500">วันเริ่มต้น</p>
            <p>
              {range.startDate
                ? dayjs(range.startDate).locale("th").format("D MMM YYYY")
                : "ยังไม่เลือก"}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">วันสิ้นสุด</p>
            <p>
              {range.endDate
                ? dayjs(range.endDate).locale("th").format("D MMM YYYY")
                : "ยังไม่เลือก"}
            </p>
          </div>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <DateCalendar
            value={range.startDate ? dayjs(range.startDate) : null}
            onChange={selectDate}
            slotProps={{
              day: ({ day }) => {
                const isStart = Boolean(
                  range.startDate && day.isSame(dayjs(range.startDate), "day"),
                );
                const isEnd = Boolean(
                  range.endDate && day.isSame(dayjs(range.endDate), "day"),
                );
                const isBetween = Boolean(
                  range.startDate &&
                  range.endDate &&
                  day.isAfter(dayjs(range.startDate), "day") &&
                  day.isBefore(dayjs(range.endDate), "day"),
                );
                const isEndpoint = isStart || isEnd;
                const hasContinuation = Boolean(
                  range.endDate &&
                  ((isStart && !isEnd && day.day() !== 6) ||
                    (isEnd && !isStart && day.day() !== 0)),
                );
                const endpointBackground = isEndpoint
                  ? `radial-gradient(circle calc(var(--PickerDay-size) / 2) at center, var(--range-endpoint-color) 99%, transparent 100%)${
                      hasContinuation
                        ? `, linear-gradient(${isStart ? "to right" : "to left"}, transparent 50%, var(--color-primary-soft) 50%)`
                        : ""
                    }, linear-gradient(#fff, #fff)`
                  : undefined;
                const radius =
                  isBetween && day.day() === 0
                    ? "50% 0 0 50%"
                    : isBetween && day.day() === 6
                      ? "0 50% 50% 0"
                      : isEndpoint || isBetween
                        ? 0
                        : undefined;

                return {
                  "aria-label": `${day.locale("th").format("D MMMM YYYY")}${isStart ? " วันเริ่มต้น" : isEnd ? " วันสิ้นสุด" : isBetween ? " อยู่ในช่วงที่เลือก" : ""}`,
                  sx: {
                    "--range-endpoint-color": "var(--color-primary-main)",
                    marginLeft: 0,
                    marginRight: 0,
                    width:
                      "calc(var(--PickerDay-size) + 2 * var(--PickerDay-horizontalMargin))",
                    backgroundColor: isEndpoint
                      ? "transparent"
                      : isBetween
                        ? "var(--color-primary-soft)"
                        : undefined,
                    backgroundImage: endpointBackground,
                    color: isEndpoint ? "#fff" : undefined,
                    borderRadius: radius,
                    "&.MuiPickerDay-selected": {
                      backgroundColor: isEndpoint ? "transparent" : undefined,
                    },
                    "&.MuiPickerDay-selected:hover, &.MuiPickerDay-selected:focus":
                      {
                        backgroundColor: isEndpoint ? "transparent" : undefined,
                      },
                    "&:hover": {
                      "--range-endpoint-color": "var(--color-primary-hover)",
                      backgroundColor: isEndpoint
                        ? "transparent"
                        : isBetween
                          ? "var(--color-primary-soft)"
                          : undefined,
                    },
                  },
                };
              },
            }}
            sx={{ fontFamily: "var(--font-prompt), sans-serif" }}
          />
        </LocalizationProvider>
      </Popover>
    </div>
  );
}
