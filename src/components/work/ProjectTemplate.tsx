// Single-work outline: title + subtitle + image reel + text only.
// Center-aligned. Add entries to `images` and the reel grows horizontally.
export interface ReelImage {
  label: string;
  color: string;
}

export default function ProjectTemplate({
  title = "PROJECT TITLE",
  subtitle = "SUBTITLE",
  images = [],
}: {
  title?: string;
  subtitle?: string;
  images?: ReelImage[];
}) {
  return (
    <div className="h-full overflow-y-auto bg-black pt-12">
      <article className="guide mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-10">
        {/* 1 — Title area */}
        <header className="guide flex w-full flex-col items-center gap-4 py-6 text-center">
          <div className="guide flex h-10 w-3/4 items-center justify-center font-nanum text-xs tracking-[0.2em] text-white">
            {title}
          </div>
          {/* Subtitle box under header */}
          <div className="guide flex h-16 w-full items-center justify-center px-4 text-center font-nanum text-[11px] tracking-[0.2em] text-white/60">
            {subtitle}
          </div>
        </header>

        {/* 2 — Image reel: horizontal scroll, grows as images are added */}
        <section className="guide flex w-full flex-col items-center gap-2 py-4">
          <div className="guide flex w-full items-center justify-center py-1 font-nanum text-[11px] tracking-[0.2em] text-white/60">
            IMAGE REEL — SCROLL →
          </div>
          <div className="guide flex w-full snap-x snap-mandatory gap-6 overflow-x-auto p-4">
            {images.map((img) => (
              <div
                key={img.label}
                style={{ background: img.color }}
                className="flex h-[65vh] w-full shrink-0 snap-center items-center justify-center font-nanum text-[11px] tracking-[0.2em] text-black"
              >
                {img.label}
              </div>
            ))}
          </div>
        </section>

        {/* 3 — Text area */}
        <section className="guide flex w-full flex-col items-center gap-2 py-6">
          <div className="guide h-3 w-11/12" />
          <div className="guide h-3 w-10/12" />
          <div className="guide h-3 w-10/12" />
          <div className="guide h-3 w-2/3" />
          <div className="guide mt-1 px-1 py-1 font-nanum text-[11px] tracking-[0.2em] text-white/60">
            TEXT
          </div>
        </section>
      </article>
    </div>
  );
}
