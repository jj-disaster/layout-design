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
}

export const works: Work[] = [
  {
    slug: "guestbook",
    label: "Guest Book",
    year: "2025",
    src: "/media/image/work/guestbook/guestbook.png",
  },
  {
    slug: "void",
    label: "Void",
    year: "2025-26",
    src: "/media/image/work/void/void.png",
  },
  {
    slug: "keyboard",
    label: "fountain-to-be/rain",
    year: "2026",
    src: "/media/image/work/keyboard/icon.jpg",
  },
  {
    slug: "screens",
    label: "e=g=g=s=c=r=e=e=n=s",
    year: "2026",
    src: "/media/image/work/screens/icon.jpeg",
  },
  {
    slug: "mir",
    label: "Machine Lab Show",
    year: "2026",
    src: "/media/image/work/Mir/mir.0.png",
  },
  {
    slug: "jword",
    label: "J-Word",
    year: "2026",
    src: "/media/image/work/Jword/jword.jpg",
  }
];

export function getWork(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}