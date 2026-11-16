import type { Metadata } from 'next';
import HeicConverterTool from '@/components/HeicToJpg/HeicConverterTool';
import { Lock, Zap, ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'HEIC to JPG Converter - Free, Batch & 100% In-Browser Privacy',
  description:
    'Convert iPhone and Apple HEIC photos to JPG or PNG in your web browser. Free batch conversion with zero cloud uploads for maximum security and instant speed.',
  keywords: [
    'heic to jpg',
    'convert heic to jpg',
    'heic to jpg converter',
    'apple photo to jpg',
    'iphone heic to jpg',
    'heif to jpg',
    'batch heic to jpg',
    'free heic converter',
  ],
  alternates: getCanonicalMetadata('/heic-to-jpg'),
  openGraph: {
    title: 'HEIC to JPG Converter | NimbleFile',
    description:
      'Convert Apple HEIC photos to JPG locally in your browser. Fast, batch-ready, and 100% private with no server file uploads.',
    url: '/heic-to-jpg',
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
      'Free in-browser HEIC to JPG image converter supporting batch conversion of Apple .heic and .heif photos directly on your computer or phone.',
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
          text: 'HEIC (High Efficiency Image Container) is the default image format used by Apple devices running iOS 11 and later. It uses modern HEVC compression algorithms to store photos at high quality and half the file size of traditional JPEGs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why should I convert HEIC photos to JPG?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'While HEIC offers excellent compression, many non-Apple platforms, older Windows systems, web forms, and document portals do not natively support HEIC files. Converting them to JPG ensures universal compatibility.',
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
      <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#203247]">
          HEIC to JPG Converter
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Convert iPhone and Apple HEIC/HEIF photos into standard JPG or PNG images. Fast, batch-ready, and 100% private with no server file uploads.
        </p>
      </section>

      {/* Interactive Tool Card */}
      <section aria-label="HEIC to JPG Tool">
        <HeicConverterTool />
      </section>

      {/* Trust & Performance Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#DDF5E9] text-[#36A879] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-[#203247]">100% Private Processing</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Your photos are processed directly in your browser. They are never transmitted to external servers, cloud databases, or third-party APIs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#E5F0FF] text-[#3979E6] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-[#203247]">Instant Local Speed</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Conversion runs via compiled WebAssembly directly on your CPU. No waiting for network upload and download queues.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FFE7A3]/50 text-[#B87D09] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-[#203247]">Batch Processing</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Queue multiple iPhone photos at once. Sequential memory-safe processing prevents browser tab crashes on mobile devices.
          </p>
        </div>
      </div>

      {/* How to use */}
      <section className="bg-white rounded-3xl border border-[#E5EAF1] p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#203247]">
          How to convert HEIC to JPG online
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#E5F0FF] text-[#3979E6] text-xs font-bold flex items-center justify-center font-mono">
              1
            </div>
            <h3 className="text-sm font-bold text-[#203247]">Select HEIC Photos</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Drag and drop your .heic or .heif files from your iPhone, Mac, or PC into the upload area above.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#E5F0FF] text-[#3979E6] text-xs font-bold flex items-center justify-center font-mono">
              2
            </div>
            <h3 className="text-sm font-bold text-[#203247]">Adjust Quality</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Choose your target JPEG compression quality (default 92%) or switch to lossless PNG output.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-[#E5F0FF] text-[#3979E6] text-xs font-bold flex items-center justify-center font-mono">
              3
            </div>
            <h3 className="text-sm font-bold text-[#203247]">Download Converted JPGs</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Click &quot;Convert to JPG&quot;. Download individual images immediately or bundle all files into a single ZIP.
            </p>
          </div>
        </div>
      </section>

      {/* Educational Guide */}
      <section className="bg-white rounded-3xl border border-[#E5EAF1] p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-[#203247]">
          Understanding the HEIC format
        </h2>

        <div className="text-xs sm:text-sm text-[#64748B] space-y-4 leading-relaxed">
          <p>
            <strong>HEIC</strong> (High Efficiency Image Container) is Apple&apos;s implementation of the HEIF standard. Apple devices take photos in HEIC by default because it achieves approximately double the compression efficiency of standard JPEG at equal visual fidelity.
          </p>

          <h3 className="text-sm font-bold text-[#203247] pt-2">
            Why Convert HEIC to JPG?
          </h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Windows Compatibility:</strong> Many Windows photo viewers and older systems require additional paid extensions to view HEIC files.
            </li>
            <li>
              <strong>Web Forms and Application Portals:</strong> Most government recruitment portals, university admission forms, and e-commerce listings strictly mandate JPG or PNG uploads.
            </li>
            <li>
              <strong>Software Compatibility:</strong> Desktop photo editing tools, design suites, and office apps often require standard JPEG format.
            </li>
          </ul>

          <div className="p-4 rounded-2xl bg-[#FFE7A3]/30 border border-[#FFE7A3] text-[#203247] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-[#B87D09] shrink-0" />
              <span>Notes on In-Browser Conversion</span>
            </div>
            <p>
              1. <strong>Metadata Handling:</strong> During in-browser decoding, EXIF metadata (camera model, GPS coordinates) is stripped to protect privacy and prevent errors.
            </p>
            <p>
              2. <strong>Memory Usage:</strong> Decoding high-resolution photos demands temporary memory. We process batch files sequentially to prevent mobile browser crashes.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white rounded-3xl border border-[#E5EAF1] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#3979E6]" />
          <h2 className="text-xl font-bold text-[#203247]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-[#E5EAF1] text-sm">
          <div className="py-4 space-y-1">
            <h3 className="font-bold text-[#203247]">
              Is this HEIC to JPG converter free to use?
            </h3>
            <p className="text-[#64748B] text-xs leading-relaxed">
              Yes, 100% free with no account creation, email requirement, or hidden paywalls.
            </p>
          </div>

          <div className="py-4 space-y-1">
            <h3 className="font-bold text-[#203247]">
              Are my photos uploaded to a cloud server?
            </h3>
            <p className="text-[#64748B] text-xs leading-relaxed">
              Never. All processing happens on your local device inside your web browser. If you disconnect your internet connection after loading the page, the tool continues to convert files offline.
            </p>
          </div>

          <div className="py-4 space-y-1">
            <h3 className="font-bold text-[#203247]">
              Can I convert multiple HEIC files at once?
            </h3>
            <p className="text-[#64748B] text-xs leading-relaxed">
              Yes. You can select or drag multiple HEIC files. The tool processes each photo sequentially to avoid mobile browser memory limits, and lets you download all results in a single ZIP file.
            </p>
          </div>

          <div className="py-4 space-y-1">
            <h3 className="font-bold text-[#203247]">
              Does this tool support Live Photos or HEIC image bursts?
            </h3>
            <p className="text-[#64748B] text-xs leading-relaxed">
              The converter extracts and decodes the primary still photo from Apple HEIC container files. Embedded video components of Apple Live Photos are ignored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
