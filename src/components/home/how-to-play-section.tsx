import { ScrollReveal } from "@/components/ui/scroll-reveal";

const steps = [
  {
    title: "รับภาพปริศนา",
    description:
      "ระบบจะให้ภาพสถานที่จริงในมหาวิทยาลัย สักมุมที่คุณอาจเดินผ่านทุกวัน",
    caption: "LOOK",
    path: "M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M15 7h.01",
  },
  {
    title: "สังเกตให้ดี",
    description:
      "มองหาอาคาร ทางเดิน หรือต้นไม้ที่คุ้นตา แล้วนึกให้ออกว่าตรงนี้คือที่ไหน",
    caption: "THINK",
    path: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0 M7 10h6 M10 7v6",
  },
  {
    title: "เลือกคำตอบ",
    description:
      "ปักหมุดลงบนแผนที่ตรงที่คุณคิดว่าใช่ แล้วดูว่าความทรงจำพาคุณไปได้ใกล้แค่ไหน",
    caption: "PIN",
    path: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  },
] as const;

export function HowToPlaySection() {
  return (
    <section
      id="how-to-play"
      aria-labelledby="how-to-play-title"
      className="relative flex min-h-svh items-center overflow-hidden bg-secondary-light px-6 py-24 text-secondary-dark sm:px-12 lg:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
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
          {steps.map((step, index) => (
            <li key={step.caption}>
              <ScrollReveal delay={index * 0.08}>
                <div
                  aria-hidden="true"
                  className="relative mb-8 flex h-40 items-end justify-between border-b border-secondary-dark/20 pb-5"
                >
                  <span className="font-display text-9xl leading-none text-secondary-dark/10">
                    0{index + 1}
                  </span>
                  <span className="absolute right-3 top-4 grid size-24 rotate-6 place-items-center border-2 border-secondary-dark bg-primary-main shadow-[5px_5px_0_var(--color-secondary-dark)]">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-11 -rotate-6 fill-none stroke-current stroke-[1.5]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={step.path} />
                    </svg>
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
          ))}
        </ol>
      </div>
    </section>
  );
}
