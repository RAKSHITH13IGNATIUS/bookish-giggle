import type { Metadata } from 'next';
import HeicConverterTool from '@/components/HeicToJpg/HeicConverterTool';
import { ShieldCheck, Zap, Lock, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'HEIC to JPG Converter Online - Free and Private',
  description:
    'Convert HEIC and HEIF photos to JPG in your browser. Process images locally without uploading your files.',
  keywords: [
    'heic to jpg',
    'heic converter',
    'convert heic to jpg',
    'heif to jpg',
    'iphone photo to jpg',
    'free heic converter',
    'private heic to jpg',
    'batch heic to jpg',
  ],
  alternates: getCanonicalMetadata('/heic-to-jpg'),
  openGraph: {
    title: 'HEIC to JPG Converter Online - Free & Private | NimbleFile',
    description:
      'Convert iPhone and Apple HEIC photos to standard JPG images directly in your browser with zero server uploads.',
    url: '/heic-to-jpg',
    type: 'website',
  },
};

export default function HeicToJpgPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NimbleFile HEIC to JPG Converter',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free, in-browser tool to convert Apple HEIC and HEIF photos into universally compatible JPG images without uploading files to remote servers.',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a HEIC file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'HEIC (High Efficiency Image Container) is the default image format used by Apple devices running iOS 11 and later. It uses modern HEVC video compression algorithms to store photos at higher quality and half the file size of traditional JPEGs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why should I convert HEIC photos to JPG?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'While HEIC offers excellent compression, many non-Apple platforms, older Windows systems, web forms, and document portals do not natively support HEIC files. Converting them to JPG ensures universal compatibility with any device or application.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are my photos uploaded to your servers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All conversion operations happen locally inside your web browser using WebAssembly. Your photos never leave your device or transit across the internet.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is EXIF camera metadata preserved?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. When converting HEIC files in the browser, EXIF metadata (such as GPS coordinates, camera serial numbers, and exposure settings) is stripped. This protects your privacy and prevents file corruption.',
        },
      },
    ],
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>In-Browser Client-Side Conversion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Convert HEIC to JPG
        </h1>
        <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
          Convert iPhone and Apple HEIC/HEIF photos into standard JPG or PNG images. Fast, batch-ready, and 100% private with no server file uploads.
        </p>
      </div>

      {/* Interactive Tool Card */}
      <section aria-label="HEIC to JPG Tool">
        <HeicConverterTool />
      </section>

      {/* Trust & Performance Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">100% Private Processing</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your photos are processed directly in your browser. They are never transmitted to external servers, cloud databases, or third-party APIs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Instant Local Speed</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Conversion runs via compiled WebAssembly directly on your CPU. No waiting for network upload and download queues.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Batch Processing</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Queue multiple iPhone photos at once. Sequential memory-safe processing prevents browser tab crashes on mobile devices.
          </p>
        </div>
      </div>

      {/* How to use */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          How to Convert HEIC to JPG Online
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Select HEIC Photos</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag and drop your .heic or .heif files from your iPhone, Mac, or PC into the upload area above.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Adjust Quality</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose your target JPEG compression quality (default 92%) or switch to lossless PNG output.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Download Converted JPGs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click &quot;Convert to JPG&quot;. Download individual images immediately or bundle all files into a single ZIP.
            </p>
          </div>
        </div>
      </section>

      {/* Educational Guide */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Understanding the HEIC Format
        </h2>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
          <p>
            <strong>HEIC</strong> (High Efficiency Image Container) is Apple&apos;s implementation of the HEIF (High Efficiency Image File) standard. Since iOS 11 and macOS High Sierra, Apple devices take photos in HEIC by default instead of JPEG because HEIC achieves approximately double the compression efficiency of standard JPEG at equal visual fidelity.
          </p>

          <h3 className="text-base font-bold text-slate-800 pt-2">
            Why Convert HEIC to JPG?
          </h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Windows Compatibility:</strong> Default Windows photo viewers and legacy versions of Windows 10/11 require paid codec extensions from the Microsoft Store to display HEIC files.
            </li>
            <li>
              <strong>Web Forms and Application Portals:</strong> Most government recruitment portals, university admission forms, and e-commerce listings strictly mandate JPG or PNG uploads.
            </li>
            <li>
              <strong>Software Compatibility:</strong> Many desktop photo editing tools, design suites, and office applications do not support HEIC importing.
            </li>
          </ul>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Known Limitations of In-Browser Conversion</span>
            </div>
            <p>
              1. <strong>Metadata Handling:</strong> During in-browser decoding, EXIF metadata (camera model, GPS coordinates, shutter details) is discarded to protect privacy and prevent canvas errors.
            </p>
            <p>
              2. <strong>Memory Usage:</strong> Decoding high-resolution photos (such as 48 MP iPhone RAW photos) demands substantial temporary RAM. We process batch files sequentially to prevent mobile browser crashes.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
          <div className="py-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">
              Is this HEIC to JPG converter free to use?
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Yes, 100% free with no account creation, email requirement, or hidden paywalls.
            </p>
          </div>

          <div className="py-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">
              Are my photos uploaded to a cloud server?
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Never. All processing happens on your local device inside your web browser. If you disconnect your internet connection after loading the page, the tool continues to convert files offline.
            </p>
          </div>

          <div className="py-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">
              Can I convert multiple HEIC files at once?
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Yes. You can select or drag multiple HEIC files. The tool processes each photo sequentially to avoid mobile browser memory limits, and lets you download all results in a single ZIP file.
            </p>
          </div>

          <div className="py-4 space-y-1.5">
            <h3 className="font-semibold text-slate-900">
              Does this tool support Live Photos or HEIC image bursts?
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              The converter extracts and decodes the primary still photo from Apple HEIC container files. Embedded video components of Apple Live Photos are ignored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
