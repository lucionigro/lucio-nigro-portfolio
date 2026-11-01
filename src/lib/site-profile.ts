// Public facts already present in the portfolio; no inferred personal details.
export const siteProfile = {
  url: "https://www.lucionigro.com/",
  name: "Lucio Nigro",
  role: "Product Engineer",
  title: "Lucio Nigro - Product Engineer",
  description: "Product Engineer building payment systems and AI agents. Explore Lucio Nigro’s work, music, cinema, books, and film photography in an interactive 3D room.",
  email: "lnigrot@gmail.com",
  sameAs: ["https://github.com/lucionigro", "https://www.linkedin.com/in/lucionigro/"],
};
const id = (fragment: string) => `${siteProfile.url}#${fragment}`;
export const profileSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person", "@id": id("person"),
      name: siteProfile.name, url: siteProfile.url,
      jobTitle: siteProfile.role,
      description: "Product Engineer working on payment systems and AI agents.",
      worksFor: { "@type": "Organization", name: "Belong" },
      email: siteProfile.email, sameAs: siteProfile.sameAs,
    },
    {
      "@type": "WebSite", "@id": id("website"),
      url: siteProfile.url, name: siteProfile.name,
      inLanguage: ["en", "es"], publisher: { "@id": id("person") },
    },
    {
      "@type": "ProfilePage", "@id": id("profile"),
      url: siteProfile.url, name: siteProfile.title,
      description: siteProfile.description, inLanguage: "en",
      isPartOf: { "@id": id("website") }, mainEntity: { "@id": id("person") },
    },
  ],
};
