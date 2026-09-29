"use client";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import type { ReactNode } from "react";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: ReactNode;
};

export type DropdownProps<T extends string = string> = {
  id?: string;
  value: T;
  options: readonly DropdownOption<T>[] | DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Dropdown<T extends string = string>({
  id,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: DropdownProps<T>) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as T);
  };

  return (
    <FormControl size="small" className={className} disabled={disabled}>
      <Select
        id={id}
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel}
        IconComponent={KeyboardArrowDownRoundedIcon}
        sx={{
          borderRadius: "0.5rem",
          backgroundColor: "#ffffff",
          color: "var(--color-secondary-dark)",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: 600,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgb(0 0 0 / 15%)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
            borderWidth: "0.0625rem",
          },
          "& .MuiSelect-select": {
            paddingTop: "0.4rem",
            paddingBottom: "0.4rem",
            paddingLeft: "0.875rem",
            paddingRight: "2rem",
          },
          "& .MuiSelect-icon": {
            color: "var(--color-secondary-dark)",
            right: "0.375rem",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                borderRadius: "0.5rem",
                marginTop: "0.25rem",
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
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
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
