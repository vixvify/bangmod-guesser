"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import type { AdminUserStatus } from "@/core/domain/admin-user";

type UserStatusPickerProps = {
  value: AdminUserStatus;
  onChange: (value: AdminUserStatus) => void;
};

const options: {
  value: AdminUserStatus;
  label: string;
  description: string;
}[] = [
  { value: "ACTIVE", label: "ปกติ", description: "ใช้งานได้ตามปกติ" },
  {
    value: "TEMPORARY",
    label: "ระงับชั่วคราว",
    description: "มีกำหนดเวลา ปลดล็อกอัตโนมัติ",
  },
  {
    value: "SUSPENDED",
    label: "ระงับถาวร",
    description: "ปลดล็อกการใช้งานโดยผู้ดูแลเท่านั้น",
  },
  {
    value: "DEACTIVATED",
    label: "ปิดใช้งาน",
    description: "ไม่ถือเป็นการลงโทษ",
  },
];

export function UserStatusPicker({ value, onChange }: UserStatusPickerProps) {
  return (
    <RadioGroup
      value={value}
      onChange={(event) => onChange(event.target.value as AdminUserStatus)}
      aria-label="สถานะบัญชี"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gap: "0.75rem",
        "& .MuiFormControlLabel-label": {
          fontFamily: "var(--font-prompt), sans-serif",
        },
      }}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={
            <Radio
              size="small"
              sx={{
                color: "var(--color-secondary-dark)",
                "&.Mui-checked": { color: "var(--color-primary-main)" },
              }}
            />
          }
          label={
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="text-xs text-slate-500">
                {option.description}
              </span>
            </span>
          }
          sx={{
            m: 0,
            minHeight: "4.5rem",
            alignItems: "center",
            border: "1px solid",
            borderColor:
              value === option.value ? "var(--color-primary-main)" : "#e2e8f0",
            bgcolor: value === option.value ? "#fff7ed" : "#fff",
            borderRadius: "0.75rem",
            px: 1.5,
            py: 0.5,
            width: "100%",
          }}
        />
      ))}
    </RadioGroup>
  );
}
