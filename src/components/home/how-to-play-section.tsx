import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { ContentContainer } from "@/components/layout/content-container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Steps } from "@/core/constants/home";

const StepIcons = {
  LOOK: ImageOutlinedIcon,
  THINK: SearchOutlinedIcon,
  PIN: PlaceOutlinedIcon,
} as const;

export function HowToPlaySection() {
  return (
    <section
      id="how-to-play"
      aria-labelledby="how-to-play-title"
      className="relative flex min-h-svh items-center overflow-hidden bg-secondary-light py-24 text-secondary-dark lg:py-32"
    >
      <ContentContainer>
        <ScrollReveal className="border-b-2 border-secondary-dark pb-10">
          <p className="font-mono text-xs uppercase tracking-widest">
            02 — HOW TO PLAY
          </p>
          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2
              id="how-to-play-title"
              className="text-4xl font-bold leading-tight sm:text-6xl"
            >
              วิธีเล่น<span className="text-primary-main">.</span>
            </h2>
            <p className="max-w-sm text-base leading-7 text-secondary-dark/65">
              ดูภาพ แล้วทายว่าอยู่ที่ไหน
              <br />
              จากหนึ่งภาพ สู่หนึ่งหมุดบนแผนที่
            </p>
          </div>
        </ScrollReveal>
        <ol className="grid gap-12 pt-12 md:grid-cols-3 md:gap-8">
          {Steps.map((step, index) => {
            const StepIcon = StepIcons[step.caption];

            return (
              <li key={step.caption}>
                <ScrollReveal delay={index * 0.08}>
                  <div
                    aria-hidden="true"
                    className="relative mb-8 flex h-40 items-end justify-between border-b border-secondary-dark/20 pb-5"
                  >
                    <span className="font-display text-9xl leading-none text-secondary-dark/10">
                      0{index + 1}
                    </span>
                    <span className="absolute right-3 top-4 grid size-24 rotate-6 place-items-center border-2 border-secondary-dark bg-primary-main shadow-[0.3125rem_0.3125rem_0_var(--color-secondary-dark)]">
                      <StepIcon className="size-11 -rotate-6" />
                    </span>
                    <span className="font-mono text-xs tracking-[0.2em]">
                      {step.caption}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="mt-4 text-base leading-8 text-secondary-dark/70">
                    {step.description}
                  </p>
                </ScrollReveal>
              </li>
            );
          })}
        </ol>
      </ContentContainer>
    </section>
  );
}
