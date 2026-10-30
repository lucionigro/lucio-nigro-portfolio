import type { MetadataRoute } from "next";
import { siteProfile } from "@/lib/site-profile";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteProfile.url}sitemap.xml` };
}
