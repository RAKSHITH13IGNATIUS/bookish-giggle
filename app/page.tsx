import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'NimbleFile - Simple Tools for Everyday Files',
  description:
    'Free online photo resizer, signature compressor, HEIC to JPG converter, image optimizer, and PDF tools. Runs entirely in your browser with zero file uploads.',
  alternates: getCanonicalMetadata('/'),
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NimbleFile',
    alternateName: 'NimbleFile Tools',
    description: 'Simple, fast, and privacy-conscious online file utilities.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
