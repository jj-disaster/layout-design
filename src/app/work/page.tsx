import Link from "next/link";

// Temporary placement demo — uses the same `guide` outlines as home.
// Goal: rows where each row's height fits its tallest image, and adding
// an image to a row adds a column automatically.
// To use: add/remove entries in DEMO_ROWS. Heights simulate different
// image aspect ratios — replace the inner div with <img>/<ProjectMediaView/>.
const DEMO_ROWS = [
  [
    { label: "01 / Tall", box: "h-96" },
    { label: "02 / Short", box: "h-56" },
  ],
  [
    { label: "03 / Medium", box: "h-72" },
    { label: "04 / Tall", box: "h-[28rem]" },
    { label: "05 / Short", box: "h-48" },
  ],
  [
    { label: "06 / Wide", box: "h-64" },
    { label: "07 / Square", box: "h-64" },
    { label: "08 / Medium", box: "h-80" },
    { label: "09 / Short", box: "h-52" },
  ],
];

export default function Page() {
  return (
    <div className="h-full overflow-y-auto bg-black pt-12">
      {/* TEMP: view single-work template outline */}
      <div className="guide flex justify-center px-6 pt-6">
        <Link
          href="/work/demo"
          className="guide px-4 py-2 font-nanum text-[11px] tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white/[0.06] hover:text-[#dd9ff5]"
        >
          VIEW TEMPLATE →
        </Link>
      </div>
      <div className="flex flex-col">
        {DEMO_ROWS.map((row, r) => (
          // One row = one flex line. Height = tallest item (items-end
          // bottom-aligns smaller images; swap to items-start for top).
          <div key={r} className="guide flex flex-col gap-6 px-6 py-8 md:flex-row md:items-end">
            {row.map((item) => (
              <figure key={item.label} className="guide flex min-w-0 flex-1 flex-col">
                {/* Image slot — variable height */}
                <div className={`guide w-full ${item.box}`} />
                {/* Small label below */}
                <figcaption className="guide px-1 py-2 font-nanum text-[11px] tracking-[0.2em] text-white/70">
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
