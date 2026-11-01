import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/portfolio/site-shell";
import { siteProfile } from "@/lib/site-profile";
import { portfolioSocialImage } from "@/lib/portfolio-seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteProfile.url),
  title: siteProfile.title,
  description: siteProfile.description,
  authors: [{ name: siteProfile.name, url: siteProfile.url }],
  alternates: { canonical: siteProfile.url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website", url: siteProfile.url, siteName: siteProfile.name,
    title: siteProfile.title, description: siteProfile.description,
    locale: "en_US", alternateLocale: ["es_AR"],
    images: [portfolioSocialImage],
  },
  twitter: {
    card: "summary_large_image", title: siteProfile.title,
    description: siteProfile.description, images: [portfolioSocialImage.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
