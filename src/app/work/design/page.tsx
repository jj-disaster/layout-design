import { notFound } from "next/navigation";
import WorksCanvas from "@/components/work/WorksCanvas";

// The grid builder is an authoring tool, not viewer-facing: only render it in
// dev builds. NODE_ENV is inlined at build time, so production static exports
// get the not-found page instead.
export default function WorksDesignPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-black pt-12">
      <WorksCanvas />
    </div>
  );
}