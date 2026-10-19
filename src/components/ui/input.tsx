"use client";

import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput, { type OutlinedInputProps } from "@mui/material/OutlinedInput";
import { useState } from "react";
import type { ReactNode, Ref } from "react";

type InputProps = Omit<
  OutlinedInputProps,
  "endAdornment" | "error" | "label" | "ref" | "startAdornment"
> & {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
  theme?: "light" | "dark";
};

export function Input({
  id,
  label,
  error,
  icon,
  ref,
  size = "medium",
  type,
  theme = "light",
  ...inputProps
}: InputProps) {
  const isDark = theme === "dark";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const errorId = `${id}-error`;

  return (
    <FormControl fullWidth error={Boolean(error)}>
      <FormLabel
        htmlFor={id}
        sx={{
          mb: "0.5rem",
          color: isDark ? "var(--color-surface-text)" : "var(--color-form-label)",
          fontFamily: "var(--font-prompt), sans-serif",
          fontSize: "0.875rem",
          fontWeight: 700,
          "&.Mui-focused": { color: isDark ? "var(--color-primary-light)" : "var(--color-form-label)" },
        }}
      >
        {label}
      </FormLabel>
      <OutlinedInput
        {...inputProps}
        size={size}
        type={isPassword && isPasswordVisible ? "text" : type}
        id={id}
        inputRef={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={[inputProps["aria-describedby"], error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
        startAdornment={
          icon ? (
            <InputAdornment
              position="start"
              sx={{ color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)" }}
            >
              {icon}
            </InputAdornment>
          ) : null
        }
        endAdornment={
          isPassword ? (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                aria-label={isPasswordVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                onMouseDown={(event) => event.preventDefault()}
                sx={{
                  color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
                  "&:hover": { color: "var(--color-primary-main)" },
                }}
              >
                {isPasswordVisible ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ) : null
        }
        sx={{
          minHeight: size === "small" ? "2.5rem" : "3.25rem",
          borderRadius: "0.75rem",
          backgroundColor: isDark ? "var(--color-surface-control)" : "#fff",
          color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
          fontFamily: "var(--font-prompt), sans-serif",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: isDark
              ? "var(--color-surface-control-border)"
              : "color-mix(in srgb, var(--color-secondary-main) 18%, white)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
          },
          "& .MuiOutlinedInput-input": {
            py: size === "small" ? "0.5rem" : "0.875rem",
            fontFamily: "inherit",
            "&::placeholder": {
              fontFamily: "inherit",
              ...(isDark && { color: "var(--color-surface-placeholder)", opacity: 1 }),
            },
            "&:autofill, &:-webkit-autofill": {
              WebkitBoxShadow: `0 0 0 100rem ${isDark ? "var(--color-secondary-main)" : "#fff"} inset`,
              WebkitTextFillColor: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
              caretColor: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
            },
          },
        }}
      />
      {error && (
        <FormHelperText
          id={errorId}
          sx={{ mx: 0, mt: "0.375rem", fontFamily: "var(--font-prompt), sans-serif" }}
        >
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
}
