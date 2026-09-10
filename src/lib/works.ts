// Central catalog for the /work index and per-work pages.
// Add new works here; the index and detail routes pick them up automatically.
export interface Work {
  slug: string;
  /** Display label (also the alt text). */
  label: string;
  /** Year the work was made — shown after the label on the /work index. */
  year: string;
  /** App-absolute media path, e.g. "/media/image/work/.../file.png". */
  src: string;
  /** Natural pixel dimensions — used to reserve space while loading. */
  width: number;
  height: number;
}

export const works: Work[] = [
  {
    slug: "guestbook",
    label: "Guest Book",
    year: "2025",
    src: "/media/image/work/guestbook/guestbook.png",
    width: 1080,
    height: 1920,
  },
  {
    slug: "void",
    label: "Void",
    year: "2025-26",
    src: "/media/image/work/void/void.jpeg",
    width: 1080,
    height: 1920,
  },
  {
    slug: "keyboard",
    label: "fountain-to-be/rain",
    year: "2026",
    src: "/media/image/work/keyboard/icon.jpg",
    width: 5184,
    height: 3456,
  },
  {
    slug: "screens",
    label: "e=g=g=s=c=r=e=e=n=s",
    year: "2026",
    src: "/media/image/work/screens/icon.jpeg",
    width: 5184,
    height: 3456,
  },
  {
    slug: "mir",
    label: "Machine Lab Show",
    year: "2026",
    src: "/media/image/work/Mir/mir.jpg",
    width: 5120,
    height: 720,
  },
  {
    slug: "jword",
    label: "J-Word",
    year: "2026",
    src: "/media/image/work/Jword/icon.jpg",
    width: 4240,
    height: 2832,
  }
];

export function getWork(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}