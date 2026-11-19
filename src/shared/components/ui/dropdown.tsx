"use client";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { useId, type ReactNode } from "react";
import { fieldLabelSx, smallFieldHeight } from "./field-styles";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: ReactNode;
};

export type DropdownProps<T extends string = string> = {
  id?: string;
  label?: string;
  value: T;
  options: readonly DropdownOption<T>[] | DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  theme?: "light" | "dark";
  "aria-label"?: string;
};

export function Dropdown<T extends string = string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
  theme = "light",
  "aria-label": ariaLabel,
}: DropdownProps<T>) {
  const isDark = theme === "dark";
  const generatedId = useId();
  const labelId = label ? `${id ?? generatedId}-label` : undefined;
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as T);
  };

  return (
    <FormControl size="small" className={className} disabled={disabled}>
      {label && (
        <FormLabel id={labelId} sx={fieldLabelSx(isDark)}>
          {label}
        </FormLabel>
      )}
      <Select
        id={id}
        labelId={labelId}
        value={value}
        onChange={handleChange}
        inputProps={{ "aria-label": ariaLabel }}
        IconComponent={KeyboardArrowDownRoundedIcon}
        sx={{
          minHeight: smallFieldHeight,
          borderRadius: "0.75rem",
          backgroundColor: isDark ? "var(--color-surface-control)" : "#ffffff",
          color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: 600,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: isDark ? "var(--color-surface-control-border)" : "rgb(0 0 0 / 15%)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
            borderWidth: "0.0625rem",
          },
          "& .MuiSelect-select": {
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            paddingLeft: "0.875rem",
            paddingRight: "2rem",
          },
          "& .MuiSelect-icon": {
            color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
            right: "0.375rem",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                borderRadius: "0.5rem",
                marginTop: "0.25rem",
                backgroundColor: isDark ? "var(--color-secondary-main)" : "#fff",
                color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
                border: isDark ? "1px solid var(--color-surface-border)" : undefined,
                boxShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.15)",
                "& .MuiMenuItem-root": {
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    backgroundColor: "color-mix(in srgb, var(--color-primary-main) 15%, transparent)",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "color-mix(in srgb, var(--color-primary-main) 25%, transparent)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: isDark ? "var(--color-surface-control-hover)" : "rgba(0, 0, 0, 0.04)",
                  },
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
