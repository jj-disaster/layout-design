import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWork, works } from "@/lib/works";
import { withBasePath } from "@/lib/media";

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const work = getWork((await params).slug);
  return { title: work ? work.label : "Not found" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const work = getWork((await params).slug);
  if (!work) notFound();

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
          {work.label}
        </h1>
      </div>
      <img
        src={withBasePath(work.src)}
        alt={work.label}
        className="guide block h-auto w-full select-none"
        draggable={false}
      />
    </div>
  );
}