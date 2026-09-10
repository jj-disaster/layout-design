"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { works } from "@/lib/works";
import type { Work } from "@/lib/works";
import { withBasePath } from "@/lib/media";
import FadeInImage from "@/components/work/FadeInImage";

interface RowItem {
  label: string;
  box?: string;
  src?: string;
  year?: string;
  /** Natural width/height — used to reserve the image box while loading. */
  ratio?: number;
}

export type KeyedItem = string | RowItem;
export type Column = KeyedItem | KeyedItem[];

// Rows are full-bleed by default; this caps how wide any single row can grow.
// Tune the default here or pass `maxWidth` per row.
export const MAX_ROW_WIDTH = 1200;

// Desktop: a stacked column (array of items) must never be taller than the
// tallest single-image column in its row. Flex-only CSS can't express that
// (a stack's content always inflates the row), so we measure the tallest
// single column and:
//   - pin each stack's wrapper to that height,
//   - give each stacked image an explicit pixel height (distributed across
//     the capped height) so its width auto-scales from the aspect ratio and
//     the wrappers hug the real image size instead of the natural one.
export function Row({
  columns,
  maxWidth = MAX_ROW_WIDTH,
}: {
  columns: Column[];
  maxWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const STACK_GAP = 24; // md:gap-6
    let frame = 0;
    const clearInline = () => {
      for (const el of row.querySelectorAll<HTMLElement>("[data-stack], [data-stack] img")) {
        el.style.height = "";
      }
    };
    const apply = () => {
      if (!window.matchMedia("(min-width: 768px)").matches) {
        clearInline();
        return;
      }
      const cols = Array.from(row.children) as HTMLElement[];
      let h = 0;
      for (const el of cols) {
        if (el.dataset.stack) continue;
        const figure = el.querySelector("figure");
        h = Math.max(h, (figure ?? el).offsetHeight);
      }
      for (const el of cols) {
        if (!el.dataset.stack) continue;
        const figures = Array.from(el.querySelectorAll("figure")) as HTMLElement[];
        const imgs = Array.from(el.querySelectorAll("figure img")) as HTMLElement[];
        if (h <= 0 || figures.length === 0) continue;
        el.style.height = `${h}px`;
        const captionH = figures.reduce((s, f) => {
          const cap = f.querySelector("figcaption") as HTMLElement | null;
          return s + (cap ? cap.offsetHeight : 0);
        }, 0);
        const imgH = (h - (figures.length - 1) * STACK_GAP - captionH) / figures.length;
        if (imgH > 0) {
          imgs.forEach((img) => {
            img.style.height = `${imgH}px`;
          });
        }
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };
    schedule();
    const imgs = row.querySelectorAll("img");
    imgs.forEach((img) => img.addEventListener("load", schedule));
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(row);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      imgs.forEach((img) => img.removeEventListener("load", schedule));
    };
  }, []);

  return (
    <div
      ref={ref}
      className="contents md:flex md:flex-row md:items-stretch md:justify-center md:gap-6 md:px-6 md:py-4"
      style={{ maxWidth, marginLeft: "auto", marginRight: "auto" }}
    >
      {columns.map((column, c) => {
        const stacked = Array.isArray(column);
        const items = stacked ? column : [column];
        return (
          <div
            key={c}
            data-stack={stacked || undefined}
            className="guide mb-6 flex flex-col gap-6 break-inside-avoid md:mb-0 md:min-w-0 md:flex-col md:justify-end md:gap-6"
          >
            {items.map((entry) => (
              <Figure key={typeof entry === "string" ? entry : entry.label} entry={entry} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function asItem(entry: KeyedItem): { entry: string; item: RowItem } {
  if (typeof entry === "string") {
    const work = works.find((w) => w.slug === entry);
    return {
      entry,
      item: {
        label: work?.label ?? entry,
        src: work?.src,
        year: work?.year,
        ratio: work ? work.width / work.height : undefined,
      },
    };
  }
  return { entry: entry.label, item: entry };
}

function ImageSlot({ item }: { item: RowItem }) {
  if (item.src) {
    return (
      <FadeInImage
        src={withBasePath(item.src)}
        alt={item.label}
        style={item.ratio ? { aspectRatio: `${item.ratio}` } : undefined}
        className="guide skeleton ws-img block h-auto w-full select-none md:h-auto md:max-h-[80vh] md:max-w-full md:min-h-0 md:w-auto"
      />
    );
  }
  return <div className={`guide w-full ${item.box}`} />;
}

function Figure({ entry }: { entry: KeyedItem }) {
  const { entry: key, item } = asItem(entry);
  const work: Work | undefined =
    typeof entry === "string" ? works.find((w) => w.slug === entry) : undefined;
  const content = (
    <>
      {/* Image slot — height follows the image's aspect ratio */}
      <ImageSlot item={item} />
      {/* Small label below */}
      <figcaption className="guide flex items-baseline gap-1.5 px-1 py-2 font-nanum text-[11px] tracking-[0.2em] text-white/70 md:shrink-0">
        {item.label}
        {item.year && (
          <span className="text-white/35">{item.year}</span>
        )}
      </figcaption>
    </>
  );
  return (
    <figure
      key={key}
      className="guide md:flex md:min-h-0 md:min-w-0 md:flex-col md:items-center"
    >
      {work ? (
        <Link
          href={`/work/${work.slug}`}
className="guide md:flex md:min-h-0 md:min-w-0 md:flex-col md:items-center"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </figure>
  );
}