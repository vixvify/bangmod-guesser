"use client";

import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput, { type OutlinedInputProps } from "@mui/material/OutlinedInput";
import Tooltip from "@mui/material/Tooltip";
import useForkRef from "@mui/utils/useForkRef";
import { useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { fieldLabelSx, smallFieldHeight } from "./field-styles";

type InputProps = Omit<
  OutlinedInputProps,
  "endAdornment" | "error" | "label" | "ref" | "startAdornment"
> & {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  onClear?: () => void;
  ref?: Ref<HTMLInputElement>;
  theme?: "light" | "dark";
};

export function Input({
  id,
  label,
  error,
  icon,
  onClear,
  ref,
  size = "medium",
  type,
  theme = "light",
  ...inputProps
}: InputProps) {
  const isDark = theme === "dark";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputElement = useRef<HTMLInputElement>(null);
  const inputRef = useForkRef(inputElement, ref);
  const isPassword = type === "password";
  const errorId = `${id}-error`;

  return (
    <FormControl fullWidth error={Boolean(error)} disabled={inputProps.disabled}>
      <FormLabel
        htmlFor={id}
        sx={{
          ...fieldLabelSx(isDark),
          ...(isDark && { "&.Mui-disabled": { color: "var(--color-surface-disabled-text)" } }),
        }}
      >
        {label}
      </FormLabel>
      <OutlinedInput
        {...inputProps}
        size={size}
        type={isPassword && isPasswordVisible ? "text" : type}
        id={id}
        inputRef={inputRef}
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
          ) : onClear && inputProps.value && !inputProps.disabled ? (
            <InputAdornment position="end">
              <Tooltip title="ล้างการค้นหา">
                <IconButton
                  type="button"
                  edge="end"
                  size="small"
                  onClick={() => {
                    onClear();
                    inputElement.current?.focus();
                  }}
                  sx={{ color: isDark ? "var(--color-surface-muted)" : "var(--color-secondary-dark)" }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null
        }
        sx={{
          minHeight: size === "small" ? smallFieldHeight : "3.25rem",
          borderRadius: "0.75rem",
          backgroundColor: isDark ? "var(--color-surface-control)" : "#fff",
          color: isDark ? "var(--color-surface-text)" : "var(--color-secondary-dark)",
          fontFamily: "var(--font-prompt), sans-serif",
          ...(isDark && {
            "&.Mui-disabled": {
              backgroundColor: "var(--color-surface-disabled)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-surface-border)",
              },
            },
            "& .MuiOutlinedInput-input.Mui-disabled": {
              WebkitTextFillColor: "var(--color-surface-disabled-text)",
            },
          }),
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: isDark
              ? "var(--color-surface-control-border)"
              : "color-mix(in srgb, var(--color-secondary-main) 18%, white)",
          },
          "&:not(.Mui-disabled):hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary-main)",
            borderWidth: "0.0625rem",
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
