import type { MediaItem } from "./media";

export interface Project {
  slug: string;
  title: string;
  year?: string;
  summary?: string;
  media: MediaItem[];
}

// Empty catalog. Add entries here and the /work index picks them up
// automatically. NOTE: when the first entry lands, also (re)add
// src/app/work/[slug]/page.tsx — a dynamic route under `output: "export"`
// must prerender at least one page, so the file can't exist while this
// list is empty (it fails the build). Reference implementation:
//
//   import type { Metadata } from "next";
//   import { notFound } from "next/navigation";
//   import { getProject, getProjects } from "@/lib/projects";
//   import ProjectMediaView from "@/components/media/ProjectMediaView";
//
//   export function generateStaticParams() {
//     return getProjects().map((p) => ({ slug: p.slug }));
//   }
//
//   export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
//     const project = getProject((await params).slug);
//     return { title: project ? project.title : "Not found" };
//   }
//
//   export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
//     const project = getProject((await params).slug);
//     if (!project) notFound();
//     return (
//       <div className="min-h-full bg-black px-6 pt-12">
//         {project.media.map((item, i) => (
//           <ProjectMediaView key={`${item.src}-${i}`} item={item} />
//         ))}
//       </div>
//     );
//   }
//
// {
//   slug: "night-signals",
//   title: "Night Signals",
//   year: "2026",
//   media: [
//     { kind: "video", src: "/media/video/night-signals.mp4", alt: "...", poster: "/media/image/night-signals.jpg" },
//     { kind: "image", src: "/media/image/still-01.jpg", alt: "..." },
//     { kind: "audio", src: "/media/audio/score.mp3", alt: "..." },
//   ],
// }

export const projects: Project[] = [];

export function getProjects(): Project[] {
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
