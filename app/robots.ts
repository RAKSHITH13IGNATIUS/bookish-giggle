import { MetadataRoute } from 'next';
import { getProductionSiteUrl, isProductionEnvironment } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getProductionSiteUrl();
  const isProduction = isProductionEnvironment();

  // If in preview deployment, development, or unconfigured environment, prevent indexing
  if (!isProduction || !siteUrl) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
