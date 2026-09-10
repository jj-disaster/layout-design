"use client";

import { useEffect, useRef, useState } from "react";
import GridLayout, { useContainerWidth } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { noOverlapCompactor } from "react-grid-layout/core";
import type { LayoutConstraint } from "react-grid-layout/core";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { works, getWork } from "@/lib/works";
import { withBasePath } from "@/lib/media";
import {
  defaultLayout,
  defaultMobileLayout,
  fitHeight,
  loadDraft,
  saveDraft,
  clearDraft,
  sortItems,
  DEFAULT_GRID,
  LABEL_HEIGHT,
} from "@/lib/works-layout";
import type {
  GridConfig,
  LayoutDraft,
  LayoutItem,
  LayoutVariant,
} from "@/lib/works-layout";

const VARIANTS: LayoutVariant[] = ["desktop", "mobile"];

export default function WorksCanvas() {
  const { width, containerRef, mounted: widthMounted } = useContainerWidth();
  const [variant, setVariant] = useState<LayoutVariant>("desktop");
  const [itemsBy, setItemsBy] = useState<LayoutDraft>({ desktop: [], mobile: [] });
  const [cfg, setCfg] = useState<GridConfig>({ ...DEFAULT_GRID });
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [dragOn, setDragOn] = useState(true);
  const [resizeOn, setResizeOn] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const seededRef = useRef(false);
  const itemsRef = useRef<LayoutDraft>({ desktop: [], mobile: [] });

  // Commit only when the layout actually changed. Passing a fresh array back
  // to the `layout` prop every render makes GridLayout re-diff every time and
  // drifts positions, so we compare before committing.
  const commitItems = (next: LayoutItem[]) => {
    const draft = { ...itemsRef.current, [variant]: next };
    itemsRef.current = draft;
    setItemsBy(draft);
  };

  // Measure each work image's aspect ratio so blocks can match it.
  useEffect(() => {
    let alive = true;
    let pending = works.length;
    const found: Record<string, number> = {};
    const maybeDone = () => {
      if (alive && --pending <= 0) {
        setAspects(found);
        setReady(true);
      }
    };
    for (const w of works) {
      const img = new Image();
      img.onload = () => {
        if (w.slug in found) return;
        found[w.slug] = img.naturalWidth / img.naturalHeight;
        maybeDone();
      };
      img.onerror = () => {
        if (w.slug in found) return;
        found[w.slug] = 1.5; // fallback: landscape-ish
        maybeDone();
      };
      img.src = withBasePath(w.src);
    }
    return () => {
      alive = false;
    };
  }, []);

  // Seed both variants once images are measured and the container has a width.
  useEffect(() => {
    if (!ready || width <= 0 || seededRef.current) return;
    seededRef.current = true;
    const drafted = loadDraft();
    const draft: LayoutDraft = drafted ?? {
      desktop: defaultLayout(width, aspects, cfg),
      mobile: defaultMobileLayout(width, aspects, cfg),
    };
    itemsRef.current = draft;
    setItemsBy(draft);
  }, [ready, width, aspects]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = itemsBy[variant];

  const onLayoutChange = (next: Layout) => {
    const cur = itemsRef.current[variant];
    if (cur.length !== next.length) {
      commitItems(
        next.map(({ i, x, y, w, h }) => ({ i: String(i), x, y, w, h })) as LayoutItem[]
      );
      return;
    }
    let changed = false;
    for (let k = 0; k < next.length; k++) {
      const a = cur[k];
      const b = next[k];
      if (a.i !== b.i || a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h) {
        changed = true;
        break;
      }
    }
    if (changed) {
      commitItems(
        next.map(({ i, x, y, w, h }) => ({ i: String(i), x, y, w, h })) as LayoutItem[]
      );
    }
  };

  const defaultFor = (v: LayoutVariant) =>
    v === "mobile"
      ? defaultMobileLayout(width, aspects, cfg)
      : defaultLayout(width, aspects, cfg);

  const resetLayout = () => commitItems(defaultFor(variant));
  const fitAll = () =>
    commitItems(
      itemsRef.current[variant].map((it) => ({
        ...it,
        h: fitHeight(width, cfg, it.w, aspects[it.i] ?? 1),
      }))
    );
  const save = () => {
    saveDraft(itemsRef.current);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 900);
  };
  const clear = () => {
    clearDraft();
    commitItems(defaultFor(variant));
  };
  const copy = async () => {
    await navigator.clipboard.writeText(buildExport(itemsRef.current)).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  };

  const maxY = items.reduce((m, it) => Math.max(m, it.y + it.h), 0);
  const gridRows = Math.max(6, maxY + 2);

  // Every block must keep the ratio of image + label: given the target width
  // `w`, the block height is derived from image aspect + the label strip. We
  // enforce it during resize so boxes can only grow/shrink proportionally.
  const constraintFor = (slug: string): LayoutConstraint => ({
    name: "image+label",
    constrainSize(item, w, h, handle, ctx) {
      const aspect = aspects[slug] ?? 1;
      const [mx, my] = ctx.margin;
      const colW = (ctx.containerWidth - mx * (ctx.cols - 1)) / ctx.cols;
      const blockW = colW * w + mx * Math.max(0, w - 1);
      const cellH = blockW / aspect + LABEL_HEIGHT;
      const hRows = Math.max(1, Math.round((cellH + my) / (ctx.rowHeight + my)));
      return { w, h: hRows };
    },
  });

  const renderItems: LayoutItem[] = items.map((it) => ({
    ...it,
    constraints: [constraintFor(it.i)],
  }));

  return (
    <div className="px-4 md:px-6">
      {/* Width source for the grid */}
      <div ref={containerRef} className="relative">
        <div className="design-toolbar">
          <a className="design-chip" href="/work">
            ← works
          </a>
          {VARIANTS.map((v) => (
            <button
              key={v}
              className={`design-chip ${variant === v ? "is-on" : ""}`}
              onClick={() => setVariant(v)}
            >
              {v}
            </button>
          ))}
          <span className="design-label basis-full md:basis-auto">grid</span>
          <input
            className="design-input"
            type="number"
            min={1}
            max={64}
            value={cfg.cols}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 1) setCfg((c) => ({ ...c, cols: Math.round(v) }));
            }}
          />
          <span className="design-label">row</span>
          <input
            className="design-input"
            type="number"
            min={4}
            max={160}
            value={cfg.rowHeight}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 4) setCfg((c) => ({ ...c, rowHeight: Math.round(v) }));
            }}
          />
          <span className="design-label">gap</span>
          <input
            className="design-input"
            type="number"
            min={0}
            max={60}
            value={cfg.margin[0]}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              setCfg((c) => ({ ...c, margin: [Math.min(60, v), c.margin[1]] }));
            }}
          />
          <input
            className="design-input"
            type="number"
            min={0}
            max={60}
            value={cfg.margin[1]}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              setCfg((c) => ({ ...c, margin: [c.margin[0], Math.min(60, v)] }));
            }}
          />
          <button
            className={`design-chip ${dragOn ? "is-on" : ""}`}
            onClick={() => setDragOn((v) => !v)}
          >
            drag
          </button>
          <button
            className={`design-chip ${resizeOn ? "is-on" : ""}`}
            onClick={() => setResizeOn((v) => !v)}
          >
            resize
          </button>
          <button
            className={`design-chip ${showGrid ? "is-on" : ""}`}
            onClick={() => setShowGrid((v) => !v)}
          >
            grid
          </button>
          <button
            className={`design-chip ${showLabels ? "is-on" : ""}`}
            onClick={() => setShowLabels((v) => !v)}
          >
            labels
          </button>
          <button className="design-chip" onClick={fitAll}>
            fit all
          </button>
          <button className="design-chip" onClick={resetLayout}>
            reset
          </button>
          <button className="design-chip" onClick={save}>
            {savedFlash ? "saved" : "save draft"}
          </button>
          <button className="design-chip" onClick={clear}>
            clear draft
          </button>
          <button className="design-chip" onClick={copy}>
            {copied ? "copied" : "copy json"}
          </button>
          <span className="design-hint">
            {[itemsBy.desktop.length, itemsBy.mobile.length].every((n) => n > 0)
              ? `${itemsBy.desktop.length}+${itemsBy.mobile.length} blocks · ${width}px · ${cfg.cols} cols`
              : "loading"}
          </span>
        </div>

        {widthMounted && width > 0 && ready ? (
          <>
            {showGrid && <GridLines width={width} cfg={cfg} rows={gridRows} />}
            <GridLayout
              key={`${variant}:${cfg.cols}:${cfg.rowHeight}:${cfg.margin[0]}:${cfg.margin[1]}`}
              className="grid-layout-canvas"
              width={width}
              layout={renderItems}
              gridConfig={{
                cols: cfg.cols,
                rowHeight: cfg.rowHeight,
                margin: cfg.margin,
                containerPadding: null,
                maxRows: Infinity,
              }}
              dragConfig={{ enabled: dragOn, bounded: false, threshold: 3 }}
              resizeConfig={{ enabled: resizeOn, handles: ["se"] }}
              compactor={noOverlapCompactor}
              onLayoutChange={onLayoutChange}
            >
              {renderItems.map((it) => cell(it, showLabels))}
            </GridLayout>
          </>
        ) : (
          <div className="py-10 text-center text-[11px] tracking-[0.2em] text-white/40">
            loading…
          </div>
        )}
      </div>
    </div>
  );
}

function cell(it: LayoutItem, showLabels: boolean) {
  const work = getWork(it.i);
  const inner = work ? (
    <>
      <img
        src={withBasePath(work.src)}
        alt={work.label}
        draggable={false}
        className="pointer-events-none min-h-0 w-full flex-1 select-none object-contain"
      />
      {showLabels && (
        <span className="flex shrink-0 items-baseline gap-1.5 border-t border-white/15 px-1.5 text-[10px] leading-[22px] tracking-[0.2em] text-white/70">
          {work.label}
          <span className="text-white/40">{work.year}</span>
          <span className="ml-auto text-white/30">
            {it.w}×{it.h}
          </span>
        </span>
      )}
    </>
  ) : (
    <span className="flex h-full w-full items-center justify-center text-[10px] tracking-[0.2em] text-white/40">
      {it.i}
    </span>
  );
  return (
    <div
      key={it.i}
      className="relative flex h-full w-full flex-col overflow-hidden border border-white/10"
    >
      {inner}
    </div>
  );
}

function GridLines({
  width,
  cfg,
  rows,
}: {
  width: number;
  cfg: GridConfig;
  rows: number;
}) {
  const [gx, gy] = cfg.margin;
  const colW = (width - gx * (cfg.cols - 1)) / cfg.cols;
  const h = rows * (cfg.rowHeight + gy);
  const verticals = [];
  for (let c = 0; c <= cfg.cols; c++) {
    verticals.push(
      <div
        key={`v${c}`}
        className="bg-white/5"
        style={{ left: c * (colW + gx), top: 0, width: 1, height: h }}
      />
    );
  }
  const horizontals = [];
  for (let r = 0; r <= rows; r++) {
    horizontals.push(
      <div
        key={`h${r}`}
        className="bg-white/5"
        style={{ left: 0, top: r * (cfg.rowHeight + gy), width, height: 1 }}
      />
    );
  }
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      {verticals}
      {horizontals}
    </div>
  );
}

function buildExport(draft: LayoutDraft): string {
  const desktop = JSON.stringify(sortItems(draft.desktop), null, 2);
  const mobile = JSON.stringify(sortItems(draft.mobile), null, 2);
  return (
    `// Generated in /work/design — click-drag to rearrange, resize to rescale.\n` +
    `// Paste into src/lib/works-layout.ts and rebuild to publish.\n\n` +
    `export const WORKS_LAYOUTS: Record<"desktop" | "mobile", LayoutItem[]> = {\n` +
    `  desktop: ${desktop},\n` +
    `  mobile: ${mobile},\n` +
    `};\n`
  );
}