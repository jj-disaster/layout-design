"use client";

import { useEffect, useRef } from "react";

// Fades the image in via `.fade-in.is-visible` when it scrolls into view.
// Falls back to immediately visible if IntersectionObserver is unavailable.
interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function FadeInImage({ src, alt, className = "" }: FadeInImageProps) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      draggable={false}
      className={`${className} fade-in`}
    />
  );
}