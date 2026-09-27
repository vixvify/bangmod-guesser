"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HomeBackgroundImages } from "@/core/constants/home";

const slideshowIntervalMilliseconds = 6000;
const fadeDurationMilliseconds = 1600;
const zoomDurationMilliseconds =
  slideshowIntervalMilliseconds + fadeDurationMilliseconds;

export function BackgroundSlideshow() {
  const scene = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<{
    active: number;
    previous: number | null;
  }>({ active: 0, previous: null });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const playback: {
      timer: number | undefined;
      startedAt: number;
      remaining: number;
      pausedAnimations: Animation[];
    } = {
      timer: undefined,
      startedAt: 0,
      remaining: slideshowIntervalMilliseconds,
      pausedAnimations: [],
    };
    const zoom = { started: false, firstFrame: 0, secondFrame: 0 };

    function scheduleNextSlide() {
      playback.startedAt = performance.now();
      playback.timer = window.setTimeout(() => {
        if (document.hidden || !document.hasFocus()) {
          syncPlayback();
          return;
        }
        playback.timer = undefined;
        setSlides(({ active }) => ({
          active: (active + 1) % HomeBackgroundImages.length,
          previous: active,
        }));
        playback.remaining = slideshowIntervalMilliseconds;
        scheduleNextSlide();
      }, playback.remaining);
    }

    function syncPlayback() {
      if (document.hidden || !document.hasFocus()) {
        window.cancelAnimationFrame(zoom.firstFrame);
        window.cancelAnimationFrame(zoom.secondFrame);
        if (playback.timer === undefined) return;
        window.clearTimeout(playback.timer);
        playback.timer = undefined;
        playback.remaining = Math.max(
          0,
          playback.remaining - (performance.now() - playback.startedAt),
        );
        playback.pausedAnimations = (
          scene.current?.getAnimations?.({ subtree: true }) ?? []
        ).filter((animation) => animation.playState === "running");
        playback.pausedAnimations.forEach((animation) => animation.pause());
        return;
      }

      if (playback.timer !== undefined) return;
      playback.pausedAnimations.forEach((animation) => animation.play());
      playback.pausedAnimations = [];
      if (!zoom.started) {
        zoom.firstFrame = window.requestAnimationFrame(() => {
          zoom.secondFrame = window.requestAnimationFrame(() => {
            zoom.started = true;
            setHasStarted(true);
          });
        });
      }
      scheduleNextSlide();
    }

    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener("blur", syncPlayback);
    window.addEventListener("focus", syncPlayback);
    syncPlayback();

    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("blur", syncPlayback);
      window.removeEventListener("focus", syncPlayback);
      window.cancelAnimationFrame(zoom.firstFrame);
      window.cancelAnimationFrame(zoom.secondFrame);
      window.clearTimeout(playback.timer);
      playback.pausedAnimations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <div
      ref={scene}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg className="absolute size-0" focusable="false">
        <defs>
          <filter id="campus-tones" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR
                type="discrete"
                tableValues="0 0.18 0.34 0.5 0.66 0.82 1"
              />
              <feFuncG
                type="discrete"
                tableValues="0 0.18 0.34 0.5 0.66 0.82 1"
              />
              <feFuncB
                type="discrete"
                tableValues="0 0.18 0.34 0.5 0.66 0.82 1"
              />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 filter-[url(#campus-tones)_saturate(0.55)_contrast(1.08)]">
        {HomeBackgroundImages.map((imageSource, index) => {
          const isActive = index === slides.active;
          const shouldStayZoomed =
            hasStarted && (isActive || index === slides.previous);

          return (
            <Image
              key={imageSource}
              src={imageSource}
              alt=""
              fill
              preload={index === 0}
              sizes="100vw"
              style={{
                transitionDuration: `${fadeDurationMilliseconds}ms, ${
                  shouldStayZoomed ? zoomDurationMilliseconds : 0
                }ms`,
                transitionTimingFunction: "ease-in-out, linear",
              }}
              className={`object-cover object-[62%_center] transition-[opacity,scale] ${
                isActive ? "opacity-75" : "opacity-0"
              } ${shouldStayZoomed ? "scale-[1.08]" : "scale-100"} motion-reduce:scale-100! motion-reduce:transition-opacity!`}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 bg-primary-soft/10 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-secondary-main)_0.6px,transparent_0.8px)] bg-size-[3px_3px] opacity-30" />
    </div>
  );
}
