export const smallFieldHeight = "2.5rem";

export function fieldLabelSx(isDark: boolean) {
  return {
    mb: "0.5rem",
    color: isDark ? "var(--color-surface-text)" : "var(--color-form-label)",
    fontFamily: "var(--font-prompt), sans-serif",
    fontSize: "0.875rem",
    fontWeight: 700,
    "&.Mui-focused": {
      color: isDark ? "var(--color-primary-light)" : "var(--color-form-label)",
    },
  };
}
