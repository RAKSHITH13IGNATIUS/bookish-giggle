import type { Metadata } from 'next';
import ResizerTool from '@/components/PhotoSignatureResizer/ResizerTool';
import { HelpCircle, CheckCircle, ShieldCheck, BookOpen } from 'lucide-react';
import { getCanonicalMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Photo & Signature Resizer (Exact Pixels & KB) - Free & Private',
  description:
    'Resize photos and signatures to exact width, height in pixels and target file size in KB for job applications, passport forms, and exams. 100% browser-side privacy.',
  keywords: [
    'photo and signature resizer',
    'resize photo in kb',
    'exam photo resizer',
    'signature resizer for exam',
    'resize photo to 20kb to 50kb',
    'passport photo 600x600',
    'pan card photo resizer',
    'signature resize 140x60',
  ],
  alternates: getCanonicalMetadata('/photo-signature-resizer'),
  openGraph: {
    title: 'Photo & Signature Resizer (Exact Pixels & KB) | NimbleFile',
    description:
      'Easily resize images to exact pixel dimensions and target KB limits for government exams and portal uploads. Client-side processing.',
    url: '/photo-signature-resizer',
  },
};

export default function PhotoSignatureResizerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NimbleFile Photo & Signature Resizer',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free browser-based photo and signature resizer tool that compresses images to exact pixel dimensions and target file sizes in KB for online application portals.',
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header & Tool Intro */}
      <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#203247] tracking-tight">
          Photo & Signature Resizer
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Resize and compress your photograph or signature to exact pixel dimensions and file size limits (KB) required for competitive exams, job portals, and visa forms.
        </p>
      </section>

      {/* The Resizer Interactive Tool */}
      <section aria-label="Photo and Signature Resizer Tool">
        <ResizerTool />
      </section>

      {/* Educational & SEO Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5EAF1] shadow-sm space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#203247] mb-2">
            How to resize photos and signatures for online forms
          </h2>
          <p className="text-[#64748B] leading-relaxed text-sm">
            Government examination portals (UPSC, SSC, IBPS, State PSCs), passport services, and university admissions require strictly formatted identity images. They typically reject uploads that deviate from exact width/height ratios or exceed maximum file size limits (e.g. 50 KB for photos or 20 KB for signatures).
          </p>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E5EAF1]">
          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5F0FF] flex items-center justify-center shrink-0 text-[#3979E6]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[#203247] text-sm">Exact Pixel Dimensions</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Specify exact width and height values in pixels (e.g., 200×230 px or 600×600 px). You can lock or unlock the aspect ratio, and transparent signatures are automatically backed with clean white.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5F0FF] flex items-center justify-center shrink-0 text-[#3979E6]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[#203247] text-sm">Target KB Optimization</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Enter your desired file size ceiling in KB. Our browser-side binary search compressor iteratively calibrates JPEG quality to produce the sharpest possible image just below your limit.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#DDF5E9] flex items-center justify-center shrink-0 text-[#36A879]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[#203247] text-sm">100% Client-Side Privacy</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your government ID photos and signature scans never leave your computer. Processing occurs entirely in memory via the browser Canvas API with zero server uploads.
              </p>
            </div>
          </div>

          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFE7A3]/50 flex items-center justify-center shrink-0 text-[#B87D09]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[#203247] text-sm">Preset Library</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Select from one-click presets for US Visas, Indian Passports, PAN Cards, UPSC, and SSC applications. Presets pre-fill standard dimensions and maximum KB limits automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Step by step */}
        <div className="space-y-3 pt-6 border-t border-[#E5EAF1]">
          <h3 className="font-bold text-[#203247] text-sm uppercase tracking-wider">Step-by-Step Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            <li><strong>Upload Image:</strong> Drag and drop your JPG or PNG photo or signature into the upload area above.</li>
            <li><strong>Select Preset or Enter Dimensions:</strong> Choose a standard template from the preset selector or manually type in width and height in pixels.</li>
            <li><strong>Set Maximum Size (KB):</strong> Provide your target file size ceiling (e.g., 50 KB for photos or 20 KB for signatures).</li>
            <li><strong>Preview Result:</strong> Review the live preview, rendered dimensions, and calculated file size.</li>
            <li><strong>Download:</strong> Click &quot;Download Resized Image&quot; to save your portal-ready file instantly.</li>
          </ol>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#3979E6]" />
          <h2 className="text-xl font-bold text-[#203247]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              Why do exam portals reject photo uploads?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Automated portal validators check two strict criteria: pixel dimensions (e.g. 200×230 px) and byte size (e.g. 20 KB to 50 KB). If your photo is even 1 pixel off or 1 byte above 50 KB, the submission will fail. This tool adjusts both parameters simultaneously.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              How does signature background whitening work?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Transparent PNG signatures or poorly lit camera phone shots often produce dark or grey backgrounds when converted to JPEG. Our Canvas engine composites signatures over a pure #FFFFFF white background.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              Are my photos and signatures saved on your server?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No. We do not store or transmit any files. Everything executes locally in your browser memory. You can even disconnect your Wi-Fi after the page loads and the tool will continue working.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs space-y-1.5">
            <h3 className="font-bold text-sm text-[#203247]">
              What if the output size is still above my target limit?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              If an image contains too many pixels for an extremely low target size (e.g., a 2000×2000 image targeted to 10 KB), JPEG compression reaches its floor. Simply reduce the pixel dimensions (e.g., to 200×230 px) to meet the file size requirement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
