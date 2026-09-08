import { Row } from "@/components/work/Row";
import type { Column } from "@/components/work/Row";

// A row is an array of columns laid out side by side. A column is a single
// work (string), a placeholder ({ label, box }), or an ARRAY of those to
// stack multiple images vertically in the same column. On desktop a stacked
// column is capped to the height of the row's tallest single column. E.g.
// one tall image on the left with two wides stacked on the right:
//   [["tall-1"], ["wide-1", "wide-2"]]
const ROWS: Column[][] = [
  ["void", ["keyboard", "screens"]],
  ["mir"],
  ["guestbook","jword"],
];

export default function Page() {
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-black pt-12">
      {/* Mobile: 2-column masonry driven by image height (column-major order).
          Desktop (md+): flex rows — each row's height fits its tallest single
          column; stacked columns are pinned to that height. */}
      <div className="relative columns-2 gap-6 px-4 md:flex md:flex-col md:gap-0 md:px-0">
        {/* Column guides (mobile masonry only) */}
        <div aria-hidden="true" className="guide-col guide-col-left md:hidden" />
        <div aria-hidden="true" className="guide-col guide-col-right md:hidden" />
        {ROWS.map((row, r) => (
          <Row key={r} columns={row} />
        ))}
      </div>
    </div>
  );
}