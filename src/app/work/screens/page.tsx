import Link from "next/link";
import type { Metadata } from "next";
import { withBasePath } from "@/lib/media";

export const metadata: Metadata = { title: "e=g=g=s=c=r=e=e=n=s" };

export default function ScreensPage() {
  return (
    <div className="min-h-full bg-black px-6 pt-12">
      <div className="mb-8">
        <Link
          href="/work"
          className="guide px-2 py-1 font-nanum text-[11px] tracking-[0.2em] text-white/70 transition-colors duration-300 hover:text-highlight"
        >
          ← Back
        </Link>
        <h1 className="guide mt-4 font-nanum text-sm tracking-[0.2em] text-white">
          e=g=g=s=c=r=e=e=n=s
        </h1>
      </div>
      <img
        src={withBasePath("/media/image/work/screens/icon.jpeg")}
        alt="e=g=g=s=c=r=e=e=n=s"
        className="guide block h-auto w-full select-none"
        draggable={false}
      />
    </div>
  );
}