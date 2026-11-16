import type { Metadata } from 'next';
import PdfSplitMergeTool from '@/components/PdfSplitMerge/PdfSplitMergeTool';
import { HelpCircle } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'PDF Split & Merge (Extract Pages & Combine) - Free & Private',
  description:
    'Merge multiple PDF documents or extract custom page ranges for free. Fast, secure, and runs entirely in your browser with zero file uploads.',
  keywords: [
    'pdf split and merge',
    'merge pdf free',
    'split pdf online',
    'extract pdf pages',
    'combine pdf files',
    'client side pdf merger',
    'private pdf tools',
  ],
  alternates: getCanonicalMetadata('/pdf-split-merge'),
  openGraph: {
    title: 'PDF Split & Merge (Extract Pages & Combine) | NimbleFile',
    description:
      'Easily combine multiple PDFs or extract custom page ranges privately on your device.',
    url: '/pdf-split-merge',
  },
};

export default function PdfSplitMergePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NimbleFile PDF Split & Merge',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free in-browser PDF split and merge tool to combine multiple documents in custom order or extract page ranges into separate files.',
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
          PDF Split & Merge
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Combine multiple PDF files into one organized document, or split and extract specific page ranges instantly without sending confidential files to the cloud.
        </p>
      </section>

      {/* Interactive Tool */}
      <section aria-label="PDF Split and Merge Tool">
        <PdfSplitMergeTool />
      </section>

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5EAF1] shadow-sm space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#203247] mb-2">
            Secure, browser-side PDF manipulation
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Most online PDF tools upload your sensitive legal contracts, tax documents, and financial records to external servers. NimbleFile processes every page locally using pdf-lib inside your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#E5EAF1]">
          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Flexible Page Extraction</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Extract exactly the pages you need by typing page numbers and ranges (e.g. &quot;1-3, 5, 8&quot;) to create a lightweight, targeted PDF.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Seamless PDF Merging</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Order your PDF files with simple arrow buttons to combine disparate invoices, reports, or chapters into a single master document.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <h3 className="font-bold text-[#203247] text-sm">Strict Document Privacy</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Files are parsed directly in your device RAM and discarded when you close the tab. No server logs or storage buckets exist.
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
              Can I split a PDF and download all pages as separate files?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Yes. Choose &quot;Split Every Page into Files&quot; and our tool will generate a single-page PDF for every page in the document and package them together into a convenient ZIP archive.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              Is there a page count or document limit?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Because processing happens in your device memory, you can merge dozens of documents up to 50 MB total without arbitrary paywalls or page limits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
