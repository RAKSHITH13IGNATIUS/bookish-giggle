import type { Metadata } from 'next';
import CompressorTool from '@/components/ImageCompressor/CompressorTool';
import { HelpCircle } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Image Compressor & Resizer (Batch JPG, PNG, WebP) - Free & Private',
  description:
    'Compress and resize multiple JPG, PNG, and WebP images online for free. Adjust quality, scale percentages, and download as a ZIP with 100% browser-side privacy.',
  keywords: [
    'image compressor',
    'image resizer',
    'compress jpeg',
    'compress png',
    'batch image compressor',
    'webp converter',
    'photo compression online',
    'reduce image size',
  ],
  alternates: getCanonicalMetadata('/image-compressor-resizer'),
  openGraph: {
    title: 'Image Compressor & Resizer (Batch JPG, PNG, WebP) | NimbleFile',
    description:
      'Batch compress and resize images directly in your browser. Fast, private, and free with ZIP archive download.',
    url: '/image-compressor-resizer',
  },
};

export default function ImageCompressorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NimbleFile Image Compressor & Resizer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free client-side image compressor and resizer tool supporting batch compression for JPG, PNG, and WebP files with customizable quality and ZIP download.',
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Tool Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#203247] tracking-tight">
          Image Compressor & Resizer
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Reduce image file sizes while preserving sharp visual detail. Batch process JPG, PNG, and WebP files with instant ZIP download.
        </p>
      </section>

      {/* Interactive Tool */}
      <section aria-label="Image Compressor and Resizer Tool">
        <CompressorTool />
      </section>

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5EAF1] shadow-sm space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#203247] mb-2">
            Why choose in-browser image compression?
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Most online image compression tools send personal photos, design assets, and confidential graphics to cloud servers. NimbleFile uses HTML5 Canvas and browser-native encoders directly on your device CPU/GPU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#E5EAF1]">
          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">JPG vs WebP Compression</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Converting camera photos from standard JPEG to modern WebP format provides a 25% to 35% smaller file size at equivalent visual fidelity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Stepped Downsampling</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              When scaling high-resolution images down by more than 50%, our engine applies progressive multi-pass resampling to prevent jagged moiré artifacts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Batch ZIP Archiving</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Easily process dozens of images simultaneously and download them in a single compressed ZIP archive with one click.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#3979E6]" />
          <h2 className="text-xl font-bold text-[#203247]">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              What is the optimal compression quality?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              We recommend 75% to 85% for general websites and mobile sharing. This delivers roughly 60% file size reduction with virtually no perceptible loss in quality.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              Does compressing PNGs make them blurry?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              PNG is a lossless format. When you resize PNGs, pixel clarity is preserved. If you need drastic size reductions for graphics, converting to WebP or JPEG is recommended.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
