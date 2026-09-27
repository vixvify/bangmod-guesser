"use client";

import { inView, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const element = scope.current;
    if (!element || prefersReducedMotion || !("IntersectionObserver" in window)) return;

    return inView(element, () => {
      void animate(element, { opacity: [0, 1], y: [28, 0] }, {
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      });
    }, { amount: "some", margin: "0px 0px 64px 0px" });
  }, [animate, delay, prefersReducedMotion, scope]);

  return (
    <div
      ref={scope}
      data-scroll-reveal
      className={className}
    >
      {children}
    </div>
  );
}
