# QuickFile.io - 100% Free Client-Side File & Image Utilities

A production-ready, privacy-first web utility platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Browser APIs**.

All processing runs 100% locally in the user's browser using HTML5 Canvas and `pdf-lib`. No database, no user accounts, and zero remote file uploads.

---

## 🛠️ The Four Services

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

3. **Images to PDF Converter (`/images-to-pdf`)**
   - Multiple image uploads with drag-and-drop.
   - Interactive page reordering (move up/down) and removal.
   - Page sizes: A4, US Letter, and Fit to Image.
   - Orientation: Portrait, Landscape, and Auto-orientation.
   - Margin controls (None, Small, Normal).
   - Live PDF preview iframe and instant PDF download.

4. **PDF Split & Merge (`/pdf-split-merge`)**
   - **Merge**: Combine multiple PDF documents in a customized order.
   - **Split**: Extract specific page ranges (e.g., `1-3, 5`) or split all pages into individual PDFs packaged into a ZIP archive.
   - Embedded preview iframe and fast client-side export.

---

## 🔒 Privacy & Security

- **Zero Server Uploads**: Files never leave the client's device.
- **Magic-Byte Binary Validation**: Header inspections detect true MIME signatures (`JPEG`, `PNG`, `WebP`, `PDF`) to prevent file spoofing.
- **Memory Safety**: Automated revocation of `URL.createObjectURL` references to prevent browser memory leaks on mobile devices.
- **Security Headers**: Standard HTTP security headers configured in `next.config.mjs`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- pnpm (recommended) or npm

### Installation
```bash
pnpm install
```

### Running Locally
```bash
# Development server
pnpm dev

# Production build
pnpm build
pnpm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 License
MIT
