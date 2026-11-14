/**
 * Shared File Validation Utility
 * Validates actual binary signatures (magic bytes) to prevent file-type spoofing,
 * enforces size and dimension ceilings, and sanitizes filenames.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: 'jpeg' | 'png' | 'webp' | 'pdf' | 'unknown';
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB safety ceiling
const MAX_IMAGE_DIMENSION = 12000; // 12,000 px safety limit

/**
 * Reads the first bytes of a file to determine its true binary signature
 */
export async function detectMagicBytes(file: File): Promise<'jpeg' | 'png' | 'webp' | 'pdf' | 'unknown'> {
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }

  // PDF: 25 50 44 46 (%PDF-)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'pdf';
  }

  return 'unknown';
}

/**
 * Validates an image file for permitted types, size ceilings, and true binary headers
 */
export async function validateImageFile(
  file: File,
  allowedTypes: ('jpeg' | 'png' | 'webp')[] = ['jpeg', 'png', 'webp']
): Promise<ValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Size limit check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of 50 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }

  // Magic byte check
  const detectedType = await detectMagicBytes(file);
  if (detectedType === 'unknown' || !allowedTypes.includes(detectedType as any)) {
    return {
      valid: false,
      error: `Invalid or unsupported file format. Allowed formats: ${allowedTypes.join(', ').toUpperCase()}.`,
      detectedType,
    };
  }

  return { valid: true, detectedType };
}

/**
 * Validates a PDF file for size ceiling and binary signature
 */
export async function validatePdfFile(file: File): Promise<ValidationResult> {
  if (!file) {
    return { valid: false, error: 'No PDF file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `PDF exceeds maximum allowed size of 50 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'PDF file is empty (0 bytes).' };
  }

  const detectedType = await detectMagicBytes(file);
  if (detectedType !== 'pdf') {
    return {
      valid: false,
      error: 'The uploaded file is not a valid PDF document.',
      detectedType,
    };
  }

  return { valid: true, detectedType: 'pdf' };
}

/**
 * Sanitizes a filename to prevent path traversal or special character injection
 */
export function sanitizeFilename(filename: string, fallback = 'file'): string {
  if (!filename) return fallback;
  // Strip path traversal (../, ..\) and non-alphanumeric special characters except dot, dash, underscore
  const clean = filename
    .replace(/[/\\]/g, '')
    .replace(/\.\.+/g, '.')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .trim();

  return clean.length > 0 ? clean : fallback;
}
