# NimbleFile - Simple Tools for Everyday Files

A production-ready, privacy-first web utility platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Browser APIs**.

All processing runs 100% locally in the user's browser using HTML5 Canvas, `pdf-lib`, and `heic2any`. No database, no user accounts, and zero remote file uploads.

---

## 🛠️ The Five Services

1. **Photo & Signature Resizer (`/photo-signature-resizer`)**
   - Exact pixel dimensions ($W \times H$) with aspect ratio lock/unlock.
   - 3 Fit Modes: Exact Fit (portal matching), Padding (margins preserved), and Crop Fill (center crop).
   - Target file size limit (KB) with iterative binary search compression.
   - Reference presets for official applications (Govt Exam SSC/UPSC, US/Indian Passport, Signatures, PAN Card).
   - Live metrics comparison (Original vs Processed dimensions, file size, reduction %).

2. **Image Compressor & Resizer (`/image-compressor-resizer`)**
   - Supports JPG, PNG, and WebP.
   - Batch image queue with before-and-after comparison.
   - Quality slider (10% to 98%).
   - Scaling by percentage or custom dimensions.
   - Target KB limit per image.
   - Single download or batch ZIP archive export.

3. **HEIC to JPG Converter (`/heic-to-jpg`)**
   - Converts Apple iPhone & iPad HEIC and HEIF photos to standard JPG or PNG images.
   - 100% browser-side decoding via WebAssembly (`heic2any`).
   - Memory-safe sequential batch processing for mobile devices.
   - Quality adjustment slider (80% compact to 100% maximum).
   - Single download or batch ZIP export.

4. **Images to PDF Converter (`/images-to-pdf`)**
   - Multiple image uploads with drag-and-drop.
   - Interactive page reordering (move up/down) and removal.
   - Page sizes: A4, US Letter, and Fit to Image.
   - Orientation: Portrait, Landscape, and Auto-orientation.
   - Margin controls (None, Small, Normal).
   - Live PDF preview iframe and instant PDF download.

5. **PDF Split & Merge (`/pdf-split-merge`)**
   - **Merge**: Combine multiple PDF documents in a customized order.
   - **Split**: Extract specific page ranges (e.g., `1-3, 5`) or split all pages into individual PDFs packaged into a ZIP archive.
   - Embedded preview iframe and fast client-side export.

---

## 🔒 Privacy & Security

- **Zero Server Uploads**: Files never leave the client's device.
- **Magic-Byte Binary Validation**: Header inspections detect true MIME signatures (`JPEG`, `PNG`, `WebP`, `PDF`, `HEIC`) to prevent file spoofing.
- **Memory Safety**: Automated revocation of `URL.createObjectURL` references to prevent browser memory leaks on mobile devices.
- **Security Headers**: Standard HTTP security headers configured in `next.config.mjs`.

---

## 🌐 Environment Configuration

- `SITE_URL`: Set to your production canonical domain (e.g. `https://nimblefile.com`). When set, production canonical URLs and XML sitemaps will use this origin, and `robots.txt` will allow search engine crawling. When unset (such as on Vercel preview deployments or local dev), `robots.txt` disallows indexing to protect staging environments from duplicate indexing.

---

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```
