import type { Metadata } from 'next';
import CompressorTool from '@/components/ImageCompressor/CompressorTool';
import { HelpCircle, Sparkles } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Image Compressor & Resizer (JPG, PNG, WebP) - Free & Private',
  description:
    'Compress and resize multiple JPG, PNG, and WebP images in your browser with customizable quality, dimension scaling, and ZIP export. 100% free and private.',
  keywords: [
    'image compressor',
    'image resizer',
    'batch image compression',
    'compress webp',
    'compress png without losing quality',
    'compress jpg to target size',
    'bulk image resize',
  ],
  alternates: getCanonicalMetadata('/image-compressor-resizer'),
  openGraph: {
    title: 'Image Compressor & Resizer (JPG, PNG, WebP) | NimbleFile',
    description:
      'Fast in-browser batch image optimizer. Reduce image file sizes without uploading your photos to a server.',
    url: '/image-compressor-resizer',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NimbleFile Image Compressor and Resizer',
  description:
    'Free client-side tool to batch compress and resize JPG, PNG, and WebP images with custom quality controls and ZIP archive download.',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'JPG, PNG, and WebP batch compression',
    'Percentage and pixel dimension downscaling',
    'Lossless and lossy quality sliders',
    'Target file size (KB) iterative optimization',
    'Single and batch ZIP export',
    '100% Client-side processing with zero server uploads',
  ],
};

export default function ImageCompressorPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Tool Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Batch Image Suite</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Image Compressor & Resizer
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Reduce image file sizes by up to 80% while preserving crisp visual detail. Batch process JPG, PNG, and WebP files with instant ZIP download.
        </p>
      </section>

      {/* Interactive Tool */}
      <section aria-label="Image Compressor and Resizer Tool">
        <CompressorTool />
      </section>

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Why Choose Client-Side Image Compression?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most online image compression tools send your personal photos, design assets, and confidential graphics to cloud servers for processing. NimbleFile uses HTML5 Canvas and browser-native encoders directly on your device CPU/GPU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">JPG vs WebP Compression</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Converting camera photos from standard JPEG to WebP format often provides a 25% to 35% smaller file size at equivalent visual fidelity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Stepped Downsampling</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When scaling high-resolution images down by more than 50%, our engine applies progressive multi-pass resampling to prevent jagged moiré patterns.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Batch ZIP Archiving</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Easily process dozens of images simultaneously and download them in a single compressed ZIP archive with one click.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              What is the optimal compression quality?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We recommend 75% to 85% for general websites and mobile sharing. This delivers roughly 60% file size reduction with virtually no perceptible loss in quality.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Does compressing PNGs make them blurry?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              PNG is a lossless format. When you resize PNGs, pixel clarity is preserved. If you need drastic size reductions for graphics, converting to WebP or JPEG is recommended.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
