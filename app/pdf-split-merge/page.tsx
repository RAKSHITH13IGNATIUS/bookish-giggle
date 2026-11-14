import type { Metadata } from 'next';
import PdfSplitMergeTool from '@/components/PdfSplitMerge/PdfSplitMergeTool';
import AdSlot from '@/components/AdSlot';
import { HelpCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PDF Split & Merge - Combine or Extract PDF Pages Online',
  description:
    'Merge multiple PDF documents or split and extract specific page ranges directly in your browser. 100% private, free, and secure with zero cloud uploads.',
  keywords: [
    'pdf merge',
    'merge pdf online',
    'split pdf',
    'extract pages from pdf',
    'combine pdf files',
    'separate pdf pages',
    'free pdf utility',
  ],
  alternates: {
    canonical: 'https://quickfile.io/pdf-split-merge',
  },
  openGraph: {
    title: 'PDF Split & Merge - QuickFile.io',
    description:
      'Fast in-browser PDF manipulation. Merge, split, or extract pages securely on your device.',
    url: 'https://quickfile.io/pdf-split-merge',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF Split and Merge',
  url: 'https://quickfile.io/pdf-split-merge',
  description:
    'Free client-side tool to combine multiple PDF files into one or split PDF documents into custom page ranges and individual pages.',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Merge multiple PDF documents in custom order',
    'Extract custom page ranges (e.g. 1-3, 5)',
    'Split all pages into individual files in a ZIP archive',
    'Integrated PDF preview iframe',
    '100% Client-side local execution with zero server uploads',
  ],
};

export default function PdfSplitMergePage() {
  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Ad Slot */}
      <AdSlot slotId="pdf-splitmerge-top-banner" format="leaderboard" />

      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PDF Manipulation Suite</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          PDF Split & Merge
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Combine multiple PDF files into one organized document, or split and extract specific page ranges instantly without sending your confidential files to the cloud.
        </p>
      </section>

      {/* Interactive Tool */}
      <section aria-label="PDF Split and Merge Tool">
        <PdfSplitMergeTool />
      </section>

      {/* Mid Ad Slot */}
      <AdSlot slotId="pdf-splitmerge-mid-banner" format="banner" />

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Secure, Browser-Side PDF Manipulation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most online PDF tools upload your sensitive legal contracts, tax documents, and financial papers to external servers. QuickFile processes every page locally using pdf-lib inside your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Flexible Page Extraction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Extract exactly the pages you need by typing page numbers and ranges (e.g. &quot;1-3, 5, 8&quot;) to create a lightweight, targeted PDF.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Seamless PDF Merging</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Order your PDF files with simple arrow buttons to combine disparate invoices, reports, or chapters into a single master document.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Strict Document Privacy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Files are parsed directly in your device RAM and discarded when you close the tab. No server logs or storage buckets exist.
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
              Can I split a PDF and download all pages as separate files?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yes. Choose &quot;Split Every Page into Files&quot; and our tool will generate a single-page PDF for every page in the document and package them together into a convenient ZIP archive.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Is there a page count or document limit?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Because processing happens in your device memory, you can merge dozens of documents up to 50 MB total without arbitrary paywalls or page limits.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <AdSlot slotId="pdf-splitmerge-bottom-leaderboard" format="leaderboard" />
    </div>
  );
}
