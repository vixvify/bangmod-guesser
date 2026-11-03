import type { ComponentPropsWithoutRef } from "react";

type ContentContainerProps = ComponentPropsWithoutRef<"div"> & {
  contentWidth?: "narrow" | "content" | "wide" | "full";
};

const widthClasses = {
  narrow: "max-w-3xl",
  content: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

export function ContentContainer({
  children,
  contentWidth = "content",
  className,
  ...props
}: ContentContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-8 lg:px-12 ${widthClasses[contentWidth]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}
