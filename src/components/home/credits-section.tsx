import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Contributors } from "@/lib/data";

export function CreditsSection() {
  return (
    <section
      id="credits"
      aria-labelledby="credits-title"
      className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-secondary-main px-6 py-24 text-secondary-light sm:px-12 lg:py-32"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 -translate-x-1/2 whitespace-nowrap font-display text-[clamp(8rem,28vw,28rem)] leading-none text-secondary-light/3"
      >
        BANGMOD
      </span>
      <div className="mx-auto w-full max-w-6xl">
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
                <a
                  href={`https://www.instagram.com/${contributor.instagram}/`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Instagram ของ ${contributor.name}`}
                  className="inline-flex w-fit items-center gap-3 rounded-sm py-2 text-sm text-secondary-light/60 transition-colors hover:text-primary-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-focus"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-5 shrink-0 fill-none stroke-current stroke-2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.75" className="fill-current" />
                  </svg>
                  @{contributor.instagram}
                </a>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
