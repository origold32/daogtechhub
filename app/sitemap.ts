// app/sitemap.ts
// Dynamic XML sitemap — Next.js 14 MetadataRoute.Sitemap
// Includes static pages + all product detail pages for SEO indexing.

import { MetadataRoute } from "next";

const BASE_URL = "https://daogtechhub.com";

async function fetchIds(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}${path}?pageSize=500`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((item: { id: string }) => item.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/gadgets`,       lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/jerseys`,       lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/cars`,          lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/realestate`,    lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/auth`,          lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/legal/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/legal/cookies`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/legal/refund`,  lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Fetch product IDs for dynamic pages
  // NOTE: in production these fetch from the live API; during build they
  // fall back to empty arrays if the DB isn't reachable.
  const [gadgetIds, jerseyIds, carIds, estateIds] = await Promise.all([
    fetchIds("/api/gadgets"),
    fetchIds("/api/jerseys"),
    fetchIds("/api/cars"),
    fetchIds("/api/realestate"),
  ]);

  const productPages: MetadataRoute.Sitemap = [
    ...gadgetIds.map((id) => ({
      url: `${BASE_URL}/gadgets/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...jerseyIds.map((id) => ({
      url: `${BASE_URL}/jerseys/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...carIds.map((id) => ({
      url: `${BASE_URL}/cars/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...estateIds.map((id) => ({
      url: `${BASE_URL}/realestate/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return [...staticPages, ...productPages];
}
