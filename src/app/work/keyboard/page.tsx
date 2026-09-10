import Link from "next/link";
import type { Metadata } from "next";
import { withBasePath } from "@/lib/media";

export const metadata: Metadata = { title: "fountain-to-be/rain" };

export default function KeyboardPage() {
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
          fountain-to-be/rain
        </h1>
      </div>
      <img
        src={withBasePath("/media/image/work/keyboard/icon.jpg")}
        alt="fountain-to-be/rain"
        className="guide block h-auto w-full select-none"
        draggable={false}
      />
    </div>
  );
}