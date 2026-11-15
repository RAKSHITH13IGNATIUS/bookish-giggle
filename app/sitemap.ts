import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/constants';
import { getProductionSiteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getProductionSiteUrl();

  // If no production URL is configured, return empty to prevent generating incorrect URLs
  if (!baseUrl) {
    return [];
  }

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...toolRoutes,
  ];
}
