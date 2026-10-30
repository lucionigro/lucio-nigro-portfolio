import { HomeRoom } from "@/components/portfolio/home-room";
import { StructuredData } from "@/components/portfolio/structured-data";
import { pageMetadata } from "@/lib/portfolio-seo";
export const metadata = pageMetadata("home");
export default function Home() { return <><StructuredData route="home"/><HomeRoom/></>; }
