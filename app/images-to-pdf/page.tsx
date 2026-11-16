import type { Metadata } from 'next';
import ImagesToPdfTool from '@/components/ImagesToPdf/ImagesToPdfTool';
import { HelpCircle } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Images to PDF Converter (JPG, PNG, WebP to PDF) - Free & Private',
  description:
    'Convert multiple JPG, PNG, and WebP images to a single high-quality PDF document for free. Customize page sizes, margins, orientation, and reorder pages client-side.',
  keywords: [
    'images to pdf',
    'jpg to pdf',
    'png to pdf',
    'convert photo to pdf',
    'batch image to pdf',
    'pdf maker free',
    'client side pdf converter',
  ],
  alternates: getCanonicalMetadata('/images-to-pdf'),
  openGraph: {
    title: 'Images to PDF Converter (JPG, PNG, WebP) | NimbleFile',
    description:
      'Convert pictures to a single clean PDF document. Reorder pages and customize margins locally in your browser.',
    url: '/images-to-pdf',
  },
};

export default function ImagesToPdfPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NimbleFile Images to PDF Converter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free in-browser tool to convert multiple images (JPG, PNG, WebP) into an organized PDF with drag-and-drop ordering, page sizing, and margin controls.',
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#203247] tracking-tight">
          Images to PDF Converter
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Convert multiple JPG, PNG, and WebP pictures into a unified, high-resolution PDF. Reorder pages and customize paper size and margins instantly.
        </p>
      </section>

      {/* Tool Component */}
      <section aria-label="Images to PDF Tool">
        <ImagesToPdfTool />
      </section>

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5EAF1] shadow-sm space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#203247] mb-2">
            How to create clean PDFs from images
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Whether preparing application documents, digitizing receipts, or compiling photo portfolios, NimbleFile builds standard ISO 32000 compliant PDF documents using pure client-side vector and raster embedding via pdf-lib.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#E5EAF1]">
          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">A4 & US Letter Standards</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Standardized dimensions ensure your document prints cleanly on office printers without clipping headers or footers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Auto-Orientation</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Our layout engine detects whether an image is wider than it is tall, automatically selecting landscape or portrait orientation per page.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Zero Server Uploads</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Confidential bank statements, medical bills, and identity cards are converted 100% in your local browser memory.
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
              Can I reorder the images after uploading?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Yes. Use the up and down arrow buttons next to each image to order the pages exactly as you want before generating your PDF.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              Does converting to PDF reduce image resolution?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No. Raw image data is embedded directly into the PDF container without lossy re-compression, preserving the original sharpness of your photos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
