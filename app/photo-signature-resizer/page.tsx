import type { Metadata } from 'next';
import ResizerTool from '@/components/PhotoSignatureResizer/ResizerTool';
import AdSlot from '@/components/AdSlot';
import { HelpCircle, CheckCircle, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Photo & Signature Resizer (Exact Pixels & KB) - 100% Free',
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
  alternates: {
    canonical: 'https://quickfile.io/photo-signature-resizer',
  },
  openGraph: {
    title: 'Photo & Signature Resizer (Exact Pixels & KB)',
    description:
      'Easily resize images to exact pixel dimensions and target KB limits for government exams and portal uploads. Client-side processing.',
    url: 'https://quickfile.io/photo-signature-resizer',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Photo and Signature Resizer',
  url: 'https://quickfile.io/photo-signature-resizer',
  description:
    'Free client-side tool to resize photos and signatures to exact pixel dimensions and target file sizes in KB for online application forms.',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Exact width and height in pixels',
    'Target file size in KB with smart iterative compression',
    'Common exam, visa, and passport photo presets',
    'Fit modes: Exact fit, padding with background, or center crop',
    '100% Client-side processing with zero server uploads',
  ],
};

export default function PhotoSignatureResizerPage() {
  return (
    <div className="space-y-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Ad Slot */}
      <AdSlot slotId="resizer-top-banner" format="leaderboard" />

      {/* Header & Tool Intro */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Milestone 1 • Photo & Signature Specialist</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Photo & Signature Resizer
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Resize and compress your photograph or signature to exact pixel dimensions (W × H) and file size limits (KB) required for competitive exams, job portals, and visa forms.
        </p>
      </section>

      {/* The Resizer Interactive Tool */}
      <section aria-label="Photo and Signature Resizer Tool">
        <ResizerTool />
      </section>

      {/* Mid-Tool Ad Slot */}
      <AdSlot slotId="resizer-mid-banner" format="banner" />

      {/* Comprehensive Educational & SEO Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            How to Resize Photos and Signatures for Online Portals
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most government job forms (SSC, UPSC, State PSC, IBPS) and visa applications mandate stringent constraints on photograph and digital signature uploads. Submitting an image that deviates by even a single pixel or exceeds the target KB limit can cause portal rejection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-brand-600 font-bold text-base">Step 1</div>
            <h3 className="font-bold text-slate-900 text-sm">Upload Your Raw Image</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your camera selfie, scanned passport photo, or signed white paper in JPG or PNG format.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-brand-600 font-bold text-base">Step 2</div>
            <h3 className="font-bold text-slate-900 text-sm">Choose Preset or Custom Values</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select one of the built-in presets (e.g. 200×230 px @ 50 KB) or type the exact width, height, and target KB requested by your notification.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="text-brand-600 font-bold text-base">Step 3</div>
            <h3 className="font-bold text-slate-900 text-sm">Download Ready Image</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Check the live preview and dimensions. Click Download to save the perfectly dimensioned, compressed file immediately.
            </p>
          </div>
        </div>

        {/* Common Portal Guidelines Table */}
        <div className="pt-4 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">
            Reference Guide: Common Application Requirements
          </h3>
          <p className="text-xs text-slate-500">
            Note: The specifications below are compiled from public exam portals. Always double-check your official notification guidelines.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Portal / Exam Type</th>
                  <th className="p-3">Dimensions (Width × Height)</th>
                  <th className="p-3">Allowed File Size</th>
                  <th className="p-3">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-medium text-slate-900">Govt Exam Photo (SSC / UPSC)</td>
                  <td className="p-3">200 × 230 pixels</td>
                  <td className="p-3">20 KB – 50 KB</td>
                  <td className="p-3">JPEG / JPG</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Exam Portal Signature</td>
                  <td className="p-3">140 × 60 pixels</td>
                  <td className="p-3">10 KB – 20 KB</td>
                  <td className="p-3">JPEG / JPG</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">US Passport / Visa</td>
                  <td className="p-3">600 × 600 pixels (2×2 in)</td>
                  <td className="p-3">Under 240 KB</td>
                  <td className="p-3">JPEG</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Indian Passport / Visa</td>
                  <td className="p-3">413 × 531 pixels (35×45 mm)</td>
                  <td className="p-3">Under 100 KB</td>
                  <td className="p-3">JPEG</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">PAN Card Photo (NSDL)</td>
                  <td className="p-3">213 × 213 pixels</td>
                  <td className="p-3">Under 50 KB</td>
                  <td className="p-3">JPEG</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">PAN Card Signature (NSDL)</td>
                  <td className="p-3">400 × 200 pixels</td>
                  <td className="p-3">Under 50 KB</td>
                  <td className="p-3">JPEG</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tool-Specific FAQs */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Why does my uploaded signature have a dark or black background?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If your original signature is a transparent PNG and converted to JPEG, naive converters fill transparent areas with black. QuickFile automatically replaces transparency with a clean white background so your signature stays sharp and legible.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              How does the target file size (KB) algorithm work?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When you specify a target size (e.g. 50 KB), our client-side engine performs a fast binary search over Canvas compression factors to find the highest possible visual quality that remains under your threshold.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Is it safe to upload my signature or passport photograph here?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yes. All image processing takes place 100% inside your browser using the HTML5 Canvas API. The file is never sent to any server, database, or third-party service.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              What if the output size is still above my target limit?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If an image contains too many pixels for an extremely low target size (e.g., a 2000×2000 image targeted to 10 KB), JPEG compression reaches its floor. Simply reduce the pixel dimensions (e.g., to 200×230 px) to meet the file size requirement.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <AdSlot slotId="resizer-bottom-leaderboard" format="leaderboard" />
    </div>
  );
}
