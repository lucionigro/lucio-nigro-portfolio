import type { MetadataRoute } from "next";
import { routeInfo } from "@/lib/portfolio-seo";
import { siteProfile } from "@/lib/site-profile";
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(routeInfo).map(route => ({ url: new URL(route.path, siteProfile.url).href }));
}
