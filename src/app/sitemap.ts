import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";

// Override at build time if the deploy target ever changes:
//   NEXT_PUBLIC_SITE_URL=https://example.com npm run build
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jj-disaster.github.io/portfolio";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = ["", "/work", "/other"].map(
    (route) => ({ url: `${SITE_URL}${route}`, lastModified: now }),
  );
  for (const project of getProjects()) {
    entries.push({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: now,
    });
  }
  return entries;
}
