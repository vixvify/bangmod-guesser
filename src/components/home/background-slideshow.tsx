"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HomeBackgroundImages } from "@/lib/data";

const slideshowIntervalMilliseconds = 6000;

export function BackgroundSlideshow() {
  const [slides, setSlides] = useState<{
    active: number;
    previous: number | null;
  }>({ active: 0, previous: null });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSlides(({ active }) => ({
        active: (active + 1) % HomeBackgroundImages.length,
        previous: active,
      }));
    }, slideshowIntervalMilliseconds);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {HomeBackgroundImages.map((imageSource, index) => (
        <Image
          key={imageSource}
          src={imageSource}
          alt=""
          fill
          preload={index === 0}
          sizes="100vw"
          // Keep the outgoing image's animation until it is fully invisible.
          className={`object-cover object-[62%_center] transition-opacity duration-1600 ease-in-out ${
            index === slides.active ? "opacity-75" : "opacity-0"
          } ${
            index === slides.active || index === slides.previous
              ? "animate-home-background-zoom motion-reduce:animate-none"
              : ""
          }`}
        />
      ))}
    </div>
  );
}
