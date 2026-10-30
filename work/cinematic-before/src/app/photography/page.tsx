import { PhotographyPage } from "@/components/portfolio/content-pages";
import { StructuredData } from "@/components/portfolio/structured-data";
import { pageMetadata } from "@/lib/portfolio-seo";
export const metadata = pageMetadata("photography");
export default function Photography() { return <><StructuredData route="photography"/><PhotographyPage/></>; }
