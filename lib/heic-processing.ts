/**
 * Client-Side HEIC / HEIF to JPEG / PNG Conversion Engine
 *
 * Utilizes `heic2any` via dynamic import so that the 1.35 MB libheif decoding engine
 * is loaded exclusively on-demand when the user executes conversion.
 * Never evaluated during SSR or on unrelated pages.
 */

export interface HeicConversionOptions {
  toType?: 'image/jpeg' | 'image/png';
  quality?: number; // 0.1 to 1.0 (only applies to image/jpeg)
}

export interface HeicConversionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  format: 'image/jpeg' | 'image/png';
}

/**
 * Converts a HEIC / HEIF file to standard JPEG or PNG in the browser
 */
export async function convertHeicFile(
  file: File | Blob,
  options: HeicConversionOptions = {}
): Promise<HeicConversionResult> {
  if (typeof window === 'undefined') {
    throw new Error('HEIC conversion can only be performed in a browser environment.');
  }

  const toType = options.toType || 'image/jpeg';
  const quality = typeof options.quality === 'number' ? Math.max(0.1, Math.min(1.0, options.quality)) : 0.92;

  // Dynamically import heic2any only on invocation
  const heic2anyModule = await import('heic2any');
  const heic2any = heic2anyModule.default || (heic2anyModule as any);

  let outputResult: Blob | Blob[];
  try {
    outputResult = await heic2any({
      blob: file,
      toType,
      quality,
      multiple: false as any,
    });
  } catch (err: any) {
    const message = err?.message || String(err);
    if (message.toLowerCase().includes('format') || message.toLowerCase().includes('corrupt')) {
      throw new Error('Could not decode HEIC file. The image may be damaged or use an unsupported codec.');
    }
    if (message.toLowerCase().includes('memory') || message.toLowerCase().includes('allocation')) {
      throw new Error('Device memory limit reached while decoding image. Try converting one image at a time.');
    }
    throw new Error(`HEIC decoding failed: ${message}`);
  }

  // Handle single vs array output
  const outputBlob: Blob = Array.isArray(outputResult) ? outputResult[0] : outputResult;

  if (!outputBlob || outputBlob.size === 0) {
    throw new Error('Conversion yielded an empty output image.');
  }

  const url = URL.createObjectURL(outputBlob);

  // Measure dimensions
  const dimensions = await measureImageDimensions(url);

  return {
    blob: outputBlob,
    url,
    width: dimensions.width,
    height: dimensions.height,
    size: outputBlob.size,
    format: toType,
  };
}

/**
 * Measures the pixel dimensions of an image URL and cleans up temporary elements
 */
async function measureImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      // Fallback if measurement fails
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

/**
 * Safely revokes an Object URL to prevent browser memory leaks
 */
export function revokeObjectUrl(url?: string | null): void {
  if (url && typeof window !== 'undefined' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  }
}
