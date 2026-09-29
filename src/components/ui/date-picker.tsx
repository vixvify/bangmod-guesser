"use client";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import "dayjs/locale/th";

type DatePickerProps = {
  label: string;
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
};

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <MuiDatePicker
        label={label}
        value={value === undefined ? selectedDate : value}
        onChange={(nextDate) => {
          if (value === undefined) setSelectedDate(nextDate);
          onChange?.(nextDate);
        }}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
            sx: {
              minWidth: "10rem",
              "& .MuiInputBase-root": {
                borderRadius: "0.75rem",
                backgroundColor: "#fff",
                fontFamily: "var(--font-prompt), sans-serif",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "var(--font-prompt), sans-serif",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
