import type { MetadataRoute } from "next";
import { list } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/projects/", "/blog/", "/archive/", "/about/"].map((p) => ({ url: `${site.url}${p || "/"}` }));
  const posts = list("posts").map((e) => ({ url: `${site.url}/blog/${e.slug}/`, lastModified: e.date }));
  const archive = list("archive").map((e) => ({ url: `${site.url}/archive/${e.slug}/`, lastModified: e.date }));
  return [...pages, ...posts, ...archive];
}
