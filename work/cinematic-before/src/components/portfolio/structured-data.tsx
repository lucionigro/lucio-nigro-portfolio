import { pageSchema, type PortfolioRoute } from "@/lib/portfolio-seo";
export function StructuredData({ route }: { route: PortfolioRoute }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema(route)).replace(/</g, "\\u003c") }} />;
}
