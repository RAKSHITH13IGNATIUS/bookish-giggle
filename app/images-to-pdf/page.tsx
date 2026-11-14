import type { Metadata } from 'next';
import ImagesToPdfTool from '@/components/ImagesToPdf/ImagesToPdfTool';
import AdSlot from '@/components/AdSlot';
import { HelpCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Images to PDF Converter - Free, High Quality, No Uploads',
  description:
    'Convert JPG, PNG, and WebP images to a clean, professionally formatted PDF. Customize page size (A4, Letter), margins, orientation, and order. 100% private in-browser.',
  keywords: [
    'images to pdf',
    'jpg to pdf',
    'png to pdf',
    'convert photo to pdf',
    'combine pictures to pdf',
    'free image to pdf converter',
    'client side pdf converter',
  ],
  alternates: {
    canonical: 'https://quickfile.io/images-to-pdf',
  },
  openGraph: {
    title: 'Images to push the code to this  PDF Converter - QuickFile.io',
    description:
      'Turn multiple pictures into a neat PDF document. 100% private, runs entirely on your device with zero file uploads.',
    url: 'https://quickfile.io/images-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Images to PDF Converter',
  url: 'https://quickfile.io/images-to-pdf',
  description:
    'Free in-browser tool to convert multiple images to PDF with page size, margin, and layout customization.',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Multiple image selection & drag-and-drop',
    'Interactive page reordering',
    'A4, US Letter, and Fit-to-image page sizing',
    'Portrait, Landscape, and Auto-orientation',
    'Custom page margins',
    'Live PDF preview iframe',
    '100% client-side privacy',
  ],
};

export default function ImagesToPdfPage() {
  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Ad Slot */}
      <AdSlot slotId="img2pdf-top-banner" format="leaderboard" />

      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Document Creation Suite</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Images to PDF Converter
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Convert multiple JPG, PNG, and WebP pictures into a unified, high-resolution PDF. Reorder pages and customize paper size and margins instantly.
        </p>
      </section>

      {/* Tool Component */}
      <section aria-label="Images to PDF Tool">
        <ImagesToPdfTool />
      </section>

      {/* Mid Ad Slot */}
      <AdSlot slotId="img2pdf-mid-banner" format="banner" />

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            How to Create Clean PDFs from Images
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether preparing application documents, digitizing receipts, or compiling photo portfolios, QuickFile builds standard ISO 32000 compliant PDF documents using pure client-side vector and raster embedding via pdf-lib.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">A4 & US Letter Standards</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized dimensions ensure your document prints cleanly on office printers without clipping headers or footers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Auto-Orientation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our layout engine detects whether an image is wider than it is tall, automatically selecting landscape or portrait orientation per page.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Zero Server Uploads</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Confidential bank statements, medical bills, and identity cards are converted 100% in your local browser memory.
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
              Can I reorder the images after uploading?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yes. Use the up and down arrow buttons next to each image to order the pages exactly as you want before generating your PDF.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Does converting to PDF reduce image resolution?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No. Raw image data is embedded directly into the PDF container without lossy re-compression, preserving the original sharpness of your photos.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <AdSlot slotId="img2pdf-bottom-leaderboard" format="leaderboard" />
    </div>
  );
}
