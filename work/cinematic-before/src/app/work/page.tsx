import { WorkPage } from "@/components/portfolio/content-pages";
import { StructuredData } from "@/components/portfolio/structured-data";
import { pageMetadata } from "@/lib/portfolio-seo";
export const metadata = pageMetadata("work");
export default function Work() { return <><StructuredData route="work"/><WorkPage/></>; }
