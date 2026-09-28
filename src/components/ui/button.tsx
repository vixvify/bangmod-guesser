"use client";

import Link from "next/link";
import ButtonBase from "@mui/material/ButtonBase";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "outline" | "surface" | "play";
type ButtonSize = "default" | "small" | "icon";

type ButtonSharedProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type NativeButtonProps = ButtonSharedProps &
  ButtonHTMLAttributes<HTMLButtonElement>;

type LinkButtonProps = ButtonSharedProps &
  Omit<ComponentProps<typeof Link>, "children" | "className" | "href"> & {
    href: ComponentProps<typeof Link>["href"];
  };

type ButtonProps = NativeButtonProps | LinkButtonProps;

const buttonStyles: SystemStyleObject<Theme> = {
  borderRadius: "0.5rem",
  transition:
    "background-color 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, filter 180ms ease",
};

const variantStyles: Record<ButtonVariant, SystemStyleObject<Theme>> = {
  primary: {
    backgroundColor: "var(--color-primary-main)",
    color: "var(--color-secondary-dark)",
    boxShadow: "0 0.625rem 1.5rem rgb(255 122 47 / 25%)",
    "&:not(.Mui-disabled):hover": {
      backgroundColor: "var(--color-primary-hover)",
      boxShadow: "0 0.875rem 1.875rem rgb(255 122 47 / 32%)",
    },
    "&.Mui-disabled": {
      backgroundColor: "color-mix(in srgb, var(--color-primary-main) 45%, transparent)",
      color: "color-mix(in srgb, var(--color-secondary-dark) 45%, transparent)",
      boxShadow: "none",
    },
  },
  ghost: {
    color: "color-mix(in srgb, var(--color-secondary-light) 75%, transparent)",
    "&:not(.Mui-disabled):hover": {
      backgroundColor: "rgb(255 255 255 / 10%)",
      color: "var(--color-secondary-light)",
    },
    "&.Mui-disabled": { opacity: 0.4 },
  },
  outline: {
    border: "0.0625rem solid rgb(255 255 255 / 15%)",
    backgroundColor: "color-mix(in srgb, var(--color-secondary-main) 35%, transparent)",
    color: "var(--color-secondary-light)",
    "&:not(.Mui-disabled):hover": {
      backgroundColor: "rgb(255 255 255 / 10%)",
    },
    "&.Mui-disabled": { opacity: 0.4 },
  },
  surface: {
    border: "0.0625rem solid rgb(0 0 0 / 10%)",
    backgroundColor: "#fff",
    color: "#000",
    boxShadow: "0 0.125rem 0.5rem rgb(0 0 0 / 18%)",
    "&:not(.Mui-disabled):hover": {
      borderColor: "var(--color-primary-main)",
      backgroundColor: "var(--color-primary-main)",
      boxShadow: "0 0.375rem 1.125rem rgb(255 122 47 / 38%)",
    },
    "&.Mui-disabled": {
      backgroundColor: "rgb(255 255 255 / 70%)",
      color: "rgb(0 0 0 / 35%)",
      boxShadow: "none",
    },
  },
  play: {
    border: "0.125rem solid var(--color-primary-light)",
    borderRadius: "0.75rem",
    background:
      "linear-gradient(to bottom, var(--color-primary-hover), var(--color-primary-main))",
    color: "var(--color-secondary-dark)",
    boxShadow:
      "0 0.3125rem 0 var(--color-secondary-dark), 0 0 0 rgb(255 122 47 / 0%), inset 0 0.125rem 0 var(--color-primary-soft)",
    transition: "box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1)",
    "&:not(.Mui-disabled):hover": {
      boxShadow:
        "0 0.3125rem 0 var(--color-secondary-dark), 0 0 2rem rgb(255 122 47 / 55%), inset 0 0.125rem 0 var(--color-primary-soft)",
    },
    "&.Mui-disabled": { opacity: 1 },
    "@media (prefers-reduced-motion: reduce)": {
      transition: "box-shadow 140ms ease",
    },
  },
};

const sizeStyles: Record<ButtonSize, SystemStyleObject<Theme>> = {
  default: { padding: "0.875rem 1.5rem", minWidth: "10rem" },
  small: { padding: "0.5rem 0.875rem", minHeight: "2.5rem" },
  icon: { width: "2.5rem", height: "2.5rem", flexShrink: 0 },
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "gap-7 text-sm font-bold uppercase tracking-widest",
  small: "gap-2 text-sm font-semibold",
  icon: "",
};

export function Button(props: ButtonProps) {
  const {
    children,
    className = "",
    size = "default",
    variant = "primary",
    ...buttonOrLinkProps
  } = props;
  const classes = `group inline-flex items-center justify-center overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus ${sizeClasses[size]} ${className}`;
  const sx = [buttonStyles, variantStyles[variant], sizeStyles[size]];

  if ("href" in buttonOrLinkProps) {
    const { href, ...linkProps } = buttonOrLinkProps;

    return (
      <ButtonBase
        component={Link}
        href={href}
        className={classes}
        sx={sx}
        {...linkProps}
      >
        {children}
      </ButtonBase>
    );
  }

  const { type = "button", ...buttonProps } = buttonOrLinkProps;

  return (
    <ButtonBase type={type} className={classes} sx={sx} {...buttonProps}>
      {children}
    </ButtonBase>
  );
}
