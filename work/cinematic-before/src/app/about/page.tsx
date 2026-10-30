import { AboutPage } from "@/components/portfolio/content-pages";
import { StructuredData } from "@/components/portfolio/structured-data";
import { pageMetadata } from "@/lib/portfolio-seo";
export const metadata = pageMetadata("about");
export default function About() { return <><StructuredData route="about"/><AboutPage/></>; }
