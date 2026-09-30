import InstagramIcon from "@mui/icons-material/Instagram";
import { ContentContainer } from "@/components/layout/content-container";
import MuiLink from "@mui/material/Link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Contributors } from "@/core/constants/home";

const instagramLinkStyles = {
  color: "color-mix(in srgb, var(--color-secondary-light) 60%, transparent)",
  transition: "color 180ms ease",
  "&:hover, &:focus-visible": { color: "var(--color-primary-light)" },
};

export function CreditsSection() {
  return (
    <section
      id="credits"
      aria-labelledby="credits-title"
      className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-secondary-main py-24 text-secondary-light lg:py-32"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 -translate-x-1/2 whitespace-nowrap font-display text-[clamp(8rem,28vw,28rem)] leading-none text-secondary-light/3"
      >
        BANGMOD
      </span>
      <ContentContainer>
        <ScrollReveal className="grid items-end gap-6 pb-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary-light">
              03 — THE PEOPLE BEHIND THE PINS
            </p>
            <h2
              id="credits-title"
              className="mt-6 text-4xl font-bold leading-tight sm:text-6xl"
            >
              คณะผู้จัดทำ
            </h2>
          </div>
          <p className="max-w-md text-base leading-8 text-secondary-light/60 md:justify-self-end">
            จากนักศึกษาบางมด สู่เกมที่ชวนทุกคน
            <br className="hidden sm:block" />
            กลับมาสำรวจมหาวิทยาลัยไปด้วยกัน
          </p>
        </ScrollReveal>
        <ol className="border-t border-secondary-light/20">
          {Contributors.map((contributor, index) => (
            <li
              key={contributor.instagram}
              className="border-b border-secondary-light/20"
            >
              <ScrollReveal
                delay={index * 0.06}
                className="grid items-center gap-4 py-7 sm:grid-cols-[3rem_1fr_auto] sm:gap-8 sm:py-9"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-sm text-primary-main"
                >
                  0{index + 1}
                </span>
                <h3 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                  {contributor.name}
                </h3>
                <MuiLink
                  href={`https://www.instagram.com/${contributor.instagram}/`}
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                  aria-label={`Instagram ของ ${contributor.name}`}
                  sx={instagramLinkStyles}
                  className="inline-flex w-fit items-center gap-3 rounded-sm py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-focus"
                >
                  <InstagramIcon className="size-5 shrink-0" />
                  @{contributor.instagram}
                </MuiLink>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </ContentContainer>
    </section>
  );
}
