import type { Metadata } from "next";
import { siteProfile, profileSchema } from "./site-profile";
import { getRoomItems } from "./room-content";

export const routeInfo = {
  home: { path: "/", title: siteProfile.title, description: siteProfile.description },
  work: { path: "/work", title: "Work — Lucio Nigro", description: "Lucio Nigro’s software engineering experience: payment infrastructure, capital markets settlement, and AI agents at Belong, Banco Hipotecario, and QServices." },
  about: { path: "/about", title: "About — Lucio Nigro", description: "Meet Lucio Nigro, a software engineer working on payments and AI. Music, cinema, books, and the interests behind his interactive room." },
  photography: { path: "/photography", title: "Photography — Lucio Nigro", description: "Film photographs by Lucio Nigro: forests, waterfalls, mountain lakes, a bookshop, flowers, and everyday moments, photographed with a Canon AV-1." },
};
export type PortfolioRoute = keyof typeof routeInfo;
export function pageMetadata(route: PortfolioRoute): Metadata {
  const info = routeInfo[route], url = new URL(info.path, siteProfile.url).href;
  const image = route === "photography" ? "/assets/photography/mountain-lake.jpg" : "/assets/pixel-room-v7.png";
  return {
    title: info.title, description: info.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: siteProfile.name, title: info.title, description: info.description, locale: "en_US", alternateLocale: ["es_AR"], images: [{ url: image, alt: route === "photography" ? "A mountain lake photographed by Lucio Nigro" : "Lucio’s original illustrated room" }] },
    twitter: { card: "summary_large_image", title: info.title, description: info.description, images: [image] },
  };
}
export function pageSchema(route: PortfolioRoute) {
  const info = routeInfo[route], url = new URL(info.path, siteProfile.url).href;
  const person = `${siteProfile.url}#person`, website = `${siteProfile.url}#website`;
  const page = {
    "@type": route === "home" || route === "about" ? "ProfilePage" : route === "photography" ? "CollectionPage" : "WebPage",
    "@id": `${url}#page`, url, name: info.title, description: info.description,
    inLanguage: "en", isPartOf: { "@id": website }, about: { "@id": person },
    ...(route === "home" || route === "about" ? { mainEntity: { "@id": person } } : {}),
    ...(route === "photography" ? { hasPart: getRoomItems("en").find(item => item.id === "photo")!.gallery!.map(photo => ({
      "@type": "ImageObject", contentUrl: new URL(photo.src, siteProfile.url).href,
      caption: photo.caption ?? photo.alt, width: photo.width, height: photo.height, creator: { "@id": person },
    })) } : {}),
  };
  return { "@context": "https://schema.org", "@graph": [profileSchema["@graph"][0], profileSchema["@graph"][1], page] };
}
