import { ToolInfo, Preset } from './types';

export const TOOLS: ToolInfo[] = [
  {
    id: 'photo-signature-resizer',
    name: 'Photo & Signature Resizer',
    slug: '/photo-signature-resizer',
    category: 'image',
    shortDescription: 'Resize photos & signatures to exact pixel dimensions and target KB size for job, exam, and passport portals.',
    badge: 'Popular',
    icon: 'Crop',
  },
  {
    id: 'image-compressor-resizer',
    name: 'Image Compressor & Resizer',
    slug: '/image-compressor-resizer',
    category: 'image',
    shortDescription: 'Compress JPG, PNG & WebP images with customizable quality, percentage scaling, and batch download.',
    badge: 'Batch',
    icon: 'Maximize2',
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF Converter',
    slug: '/images-to-pdf',
    category: 'pdf',
    shortDescription: 'Convert multiple images into a clean, custom-formatted PDF with page sizes, margins, and reordering.',
    badge: 'Essential',
    icon: 'FileImage',
  },
  {
    id: 'pdf-split-merge',
    name: 'PDF Split & Merge',
    slug: '/pdf-split-merge',
    category: 'pdf',
    shortDescription: 'Combine multiple PDF documents or extract custom page ranges entirely in your browser.',
    badge: 'Fast',
    icon: 'FileText',
  },
];

export const PHOTO_SIGNATURE_PRESETS: Preset[] = [
  // Photos
  {
    id: 'passport-us',
    name: 'US Passport / Visa (2x2 in)',
    category: 'photo',
    width: 600,
    height: 600,
    targetMaxKB: 240,
    format: 'image/jpeg',
    description: '600x600 px (2x2 inches @ 300 DPI), max 240 KB',
    officialNote: 'Standard US State Department digital photo requirement.',
  },
  {
    id: 'passport-in',
    name: 'Indian Passport / OCI / Visa',
    category: 'photo',
    width: 413,
    height: 531,
    targetMaxKB: 100,
    format: 'image/jpeg',
    description: '35x45 mm (~413x531 px), max 100 KB',
    officialNote: 'Standard 35mm x 45mm dimension at 300 DPI.',
  },
  {
    id: 'ssc-upsc-photo',
    name: 'Govt Exam Photo (SSC / UPSC / IBPS)',
    category: 'photo',
    width: 200,
    height: 230,
    targetMaxKB: 50,
    targetMinKB: 20,
    format: 'image/jpeg',
    description: '200x230 px, between 20 KB and 50 KB',
    officialNote: 'Common format required across major government examination portals.',
  },
  {
    id: 'pan-card-photo',
    name: 'PAN Card Photo (NSDL / UTIITSL)',
    category: 'photo',
    width: 213,
    height: 213,
    targetMaxKB: 50,
    format: 'image/jpeg',
    description: '213x213 px (2.5x3.5 cm ~ 213x213 px), max 50 KB',
    officialNote: 'Standard photo size for PAN card online applications.',
  },
  {
    id: 'avatar-professional',
    name: 'Professional Profile / Avatar',
    category: 'photo',
    width: 400,
    height: 400,
    targetMaxKB: 200,
    format: 'image/jpeg',
    description: '400x400 px, crisp square profile under 200 KB',
    officialNote: 'Suitable for LinkedIn, GitHub, CVs, and corporate portals.',
  },

  // Signatures
  {
    id: 'exam-signature-std',
    name: 'Exam Portal Signature (140x60 px)',
    category: 'signature',
    width: 140,
    height: 60,
    targetMaxKB: 20,
    targetMinKB: 10,
    format: 'image/jpeg',
    description: '140x60 px, between 10 KB and 20 KB',
    officialNote: 'Widely specified by SSC, Banking, and State Public Service portals.',
  },
  {
    id: 'pan-signature',
    name: 'PAN Card Signature (NSDL)',
    category: 'signature',
    width: 400,
    height: 200,
    targetMaxKB: 50,
    format: 'image/jpeg',
    description: '400x200 px (2:1 ratio), max 50 KB',
    officialNote: 'NSDL standard online upload dimension for digital signatures.',
  },
  {
    id: 'doc-signature-clean',
    name: 'Document / PDF Signature (High-Res)',
    category: 'signature',
    width: 600,
    height: 240,
    targetMaxKB: 80,
    format: 'image/png',
    description: '600x240 px, clear signature for electronic documents',
    officialNote: 'High resolution signature suitable for digital document signing.',
  },
];

// PDF Standard Dimensions in Points (1/72 inch)
export const PDF_PAGE_DIMENSIONS = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

export const PDF_MARGIN_POINTS = {
  none: 0,
  small: 20,
  normal: 40,
};
