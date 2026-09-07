// Asset URL handling for a statically-exported site.
//
// next/link and the router respect `basePath` automatically, but raw
// <img>/<video>/<audio> src strings do NOT. Route every media URL through
// withBasePath() so files resolve both locally (no base path) and on
// GitHub Pages (PAGES_BASE_PATH=/layout-design, exposed as
// NEXT_PUBLIC_BASE_PATH in next.config.ts).

export function withBasePath(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type MediaKind = "image" | "video" | "audio";

export interface MediaItem {
  kind: MediaKind;
  /** App-absolute path, e.g. "/media/video/loop.mp4". */
  src: string;
  alt: string;
  /** Video only: still frame shown before playback. */
  poster?: string;
  caption?: string;
}
