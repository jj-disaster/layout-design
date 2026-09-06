"use client";

import { useEffect, useRef } from "react";

// Fixed full-bleed WebGPU particle background (ported from
// Clouds-Test-Project). three.js falls back to its WebGL2 backend on its
// own when WebGPU is unavailable; only if both fail does this render
// nothing, leaving the page's black background as the fallback.
export default function CloudBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let cleanup: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      const { createCloudBackground } = await import("./cloudSim");
      if (cancelled) return;
      const dispose = await createCloudBackground(container);
      if (cancelled) {
        dispose?.();
        return;
      }
      cleanup = dispose;
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
