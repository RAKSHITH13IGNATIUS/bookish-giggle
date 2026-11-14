export interface ToolInfo {
  id: string;
  name: string;
  slug: string;
  category: 'image' | 'pdf';
  shortDescription: string;
  badge?: string;
  icon: string;
}

export interface Preset {
  id: string;
  name: string;
  category: 'photo' | 'signature';
  width: number;
  height: number;
  targetMaxKB?: number;
  targetMinKB?: number;
  format: 'image/jpeg' | 'image/png';
  description: string;
  officialNote?: string;
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  compressionRatio: number;
  reachedTarget: boolean;
  actualQuality: number;
}

// Service 2: Image Compressor & Resizer Types
export interface BatchImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  result?: ProcessedImageResult;
}

export interface BatchCompressionSettings {
  resizeMode: 'none' | 'percentage' | 'dimensions';
  scalePercentage: number; // 10 to 100
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio: boolean;
  format: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.1 to 1.0
  enableTargetKB: boolean;
  targetKB?: number;
}

// Service 3: Images to PDF Types
export type PdfPageSize = 'a4' | 'letter' | 'fit';
export type PdfOrientation = 'portrait' | 'landscape' | 'auto';
export type PdfMargin = 'none' | 'small' | 'normal';

export interface ImageToPdfItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export interface ImageToPdfSettings {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMargin;
}

// Service 4: PDF Split & Merge Types
export interface PdfDocumentItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount: number;
}

export interface SplitRange {
  start: number;
  end: number;
}
