import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://quickfile.io';

  const toolRoutes = TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...toolRoutes,
  ];
}
