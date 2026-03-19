// components/seo/JsonLd.tsx — JSON-LD structured data for SEO
interface JsonLdProps { data: Record<string, unknown> | Record<string, unknown>[]; }
export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
const BASE = "https://daogtechhub.com";
export function productSchema({ id, name, description, price, image, category, brand, condition, availability, ratingValue, ratingCount, url }: { id: string; name: string; description: string; price: number; image: string; category: string; brand?: string; condition?: string; availability?: boolean; ratingValue?: number; ratingCount?: number; url: string; }) {
  return {
    "@context": "https://schema.org", "@type": "Product",
    name, description, category,
    image: image.startsWith("http") ? image : `${BASE}${image}`,
    url: `${BASE}${url}`,
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    offers: {
      "@type": "Offer", price, priceCurrency: "NGN",
      availability: availability !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BASE}${url}`, seller: { "@type": "Organization", name: "DAOG Tech Hub" },
      itemCondition: condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    },
    ...(ratingValue && ratingCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue, ratingCount, bestRating: 5, worstRating: 1 } } : {}),
  };
}
export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url.startsWith("http") ? c.url : `${BASE}${c.url}` })) };
}
export function organizationSchema() {
  return { "@context": "https://schema.org", "@type": "Organization", name: "DAOG Tech Hub", url: BASE, logo: `${BASE}/images/logo.webp`, description: "Nigeria's #1 premium marketplace.", address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" } };
}
export function websiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", name: "DAOG Tech Hub", url: BASE, potentialAction: { "@type": "SearchAction", target: `${BASE}/gadgets?search={search_term_string}`, "query-input": "required name=search_term_string" } };
}
