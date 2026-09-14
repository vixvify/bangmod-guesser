import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "default" | "small" | "icon";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type NativeButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

type LinkButtonProps = ButtonBaseProps &
  Omit<ComponentProps<typeof Link>, "children" | "className" | "href"> & {
    href: ComponentProps<typeof Link>["href"];
  };

type ButtonProps = NativeButtonProps | LinkButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-main text-secondary-dark shadow-[0_10px_24px_rgba(255,122,47,0.25)] hover:bg-primary-hover hover:shadow-[0_14px_30px_rgba(255,122,47,0.32)]",
  ghost:
    "text-secondary-light/75 hover:bg-white/10 hover:text-secondary-light",
  outline:
    "border border-white/15 bg-secondary-main/35 text-secondary-light/75 backdrop-blur-sm hover:bg-white/10 hover:text-secondary-light",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "min-w-40 gap-7 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.16em]",
  small: "px-3 py-2 text-xs font-semibold",
  icon: "h-10 w-10",
};

export function Button(props: ButtonProps) {
  const {
    children,
    className = "",
    size = "default",
    variant = "primary",
    ...buttonOrLinkProps
  } = props;
  const buttonClasses = `group inline-flex items-center justify-center rounded-lg transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-main disabled:cursor-not-allowed disabled:opacity-75 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in buttonOrLinkProps) {
    const { href, ...linkProps } = buttonOrLinkProps;

    return (
      <Link href={href} className={buttonClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = buttonOrLinkProps;

  return (
    <button
      type={type}
      className={buttonClasses}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
