// Data model + seeding for the grid-based works layout. /work/design is the
// authoring tool (click-drag to rearrange, resize to rescale); its exported
// JSON gets committed here as WORKS_LAYOUT and consumed by the public gallery.

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface GridConfig {
  cols: number;
  rowHeight: number;
  margin: [number, number];
}

export const DEFAULT_GRID: GridConfig = { cols: 12, rowHeight: 24, margin: [6, 6] };

// Footer strip reserved inside each block for the work's text label, so the
// box's aspect ratio = image + label rather than image alone.
export const LABEL_HEIGHT = 24;

const STORAGE_KEY = "layout-design:works:draft";

// Current gallery structure: each row is an array of columns; an array column
// is a vertical stack. Mirrors the ROWS in src/app/work/page.tsx.
export const WORK_STRUCTURE: (string | string[])[][] = [
  ["void", ["keyboard", "screens"]],
  ["mir"],
  ["guestbook", "jword"],
];

// Reading order of every work (flattened structure) — used for the mobile
// layout seed and as the fallback masonry order.
export const WORK_ORDER: string[] = WORK_STRUCTURE.flatMap((row) =>
  row.flatMap((col) => (Array.isArray(col) ? col : [col]))
);

// Pixel width of a single grid column under a given container width.
export function columnWidth(width: number, cfg: GridConfig): number {
  return (width - cfg.margin[0] * (cfg.cols - 1)) / cfg.cols;
}

// Grid height (in rows) a block of `w` columns needs to hold the image at its
// natural aspect ratio plus the label strip — the inverse of react-grid-layout's
// pixel height formula.
export function fitHeight(
  width: number,
  cfg: GridConfig,
  w: number,
  aspect: number,
  labelPx: number = LABEL_HEIGHT
): number {
  const colW = columnWidth(width, cfg);
  const blockW = colW * w + cfg.margin[0] * (w - 1);
  const cellH = blockW / aspect + labelPx;
  return Math.max(3, Math.round((cellH + cfg.margin[1]) / (cfg.rowHeight + cfg.margin[1])));
}

// Seed a freeform layout from the column/stack structure above, preserving
// the current rhythm: columns sit side by side and centered, stacked members
// share a column, and each block's height follows its image's aspect ratio.
export function defaultLayout(
  width: number,
  aspects: Record<string, number>,
  cfg: GridConfig = DEFAULT_GRID
): LayoutItem[] {
  const items: LayoutItem[] = [];
  let y = 0; // running bottom, in row units
  for (const row of WORK_STRUCTURE) {
    const colW = Math.max(1, Math.floor(cfg.cols / row.length));
    let x = Math.floor((cfg.cols - colW * row.length) / 2);
    let rowH = 0;
    for (const col of row) {
      const slugs = Array.isArray(col) ? col : [col];
      let top = 0;
      for (const slug of slugs) {
        const aspect = aspects[slug] ?? 1;
        const h = fitHeight(width, cfg, colW, aspect);
        items.push({ i: slug, x, y: y + top, w: colW, h });
        top += h;
      }
      rowH = Math.max(rowH, top);
      x += colW;
    }
    y += rowH;
  }
  return items;
}

// Mobile seed: the current gallery uses a 2-column masonry (column-major
// order). Mirror that here — two 6-wide columns, filled down column by column.
export function defaultMobileLayout(
  width: number,
  aspects: Record<string, number>,
  cfg: GridConfig = DEFAULT_GRID,
  slugs: string[] = WORK_ORDER
): LayoutItem[] {
  const colW = Math.max(1, Math.floor(cfg.cols / 2));
  const half = Math.ceil(slugs.length / 2);
  const items: LayoutItem[] = [];
  const colY = [0, 0];
  slugs.forEach((slug, i) => {
    const col = i < half ? 0 : 1;
    const h = fitHeight(width, cfg, colW, aspects[slug] ?? 1);
    items.push({ i: slug, x: col === 0 ? 0 : cfg.cols - colW, y: colY[col], w: colW, h });
    colY[col] += h;
  });
  return items;
}

// Export order is reading order: top-to-bottom, then left-to-right. This is
// also the sequence the mobile masonry falls back to.
export function sortItems(items: LayoutItem[]): LayoutItem[] {
  return [...items].sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

export type LayoutVariant = "desktop" | "mobile";

export interface LayoutDraft {
  desktop: LayoutItem[];
  mobile: LayoutItem[];
}

export function loadDraft(): LayoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== "object" || parsed === null) return null;
    const d = parsed as Record<string, unknown>;
    const desktop = d.desktop;
    const mobile = d.mobile;
    if (
      !Array.isArray(desktop) ||
      !Array.isArray(mobile) ||
      !desktop.every(validItem) ||
      !mobile.every(validItem)
    ) {
      return null;
    }
    return { desktop: desktop as LayoutItem[], mobile: mobile as LayoutItem[] };
  } catch {
    return null;
  }
}

export function saveDraft(draft: LayoutDraft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable */
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function validItem(v: unknown): v is LayoutItem {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.i === "string" &&
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    typeof o.w === "number" &&
    typeof o.h === "number"
  );
}