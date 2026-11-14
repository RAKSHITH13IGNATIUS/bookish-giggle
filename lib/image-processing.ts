import { ProcessedImageResult } from './types';

export interface ResizeOptions {
  width: number;
  height: number;
  fitMode: 'stretch' | 'contain' | 'cover';
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  targetKB?: number;
  quality?: number; // 0.1 to 1.0
  backgroundColor?: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image. The file may be corrupt or an unsupported format.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Resizes an image onto a canvas using Squoosh's stepped downsampling algorithm.
 * When downscaling by more than 2x, stepped downsampling prevents aliasing and produces crisp results.
 */
export function drawImageWithSteppedDownscale(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  fitMode: 'stretch' | 'contain' | 'cover',
  backgroundColor?: string
): HTMLCanvasElement {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  // Calculate draw dimensions based on fitMode
  let renderW = targetWidth;
  let renderH = targetHeight;
  let dx = 0;
  let dy = 0;

  if (fitMode === 'contain') {
    const scale = Math.min(targetWidth / srcW, targetHeight / srcH);
    renderW = srcW * scale;
    renderH = srcH * scale;
    dx = (targetWidth - renderW) / 2;
    dy = (targetHeight - renderH) / 2;
  } else if (fitMode === 'cover') {
    const scale = Math.max(targetWidth / srcW, targetHeight / srcH);
    renderW = srcW * scale;
    renderH = srcH * scale;
    dx = (targetWidth - renderW) / 2;
    dy = (targetHeight - renderH) / 2;
  }

  // Final Canvas
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = Math.round(targetWidth);
  finalCanvas.height = Math.round(targetHeight);
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) throw new Error('Canvas 2D context not available');

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';

  if (backgroundColor) {
    finalCtx.fillStyle = backgroundColor;
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  }

  // Stepped downsampling if downscaling by > 2x
  if (srcW > renderW * 2 || srcH > renderH * 2) {
    let curW = srcW;
    let curH = srcH;

    let stepCanvas = document.createElement('canvas');
    stepCanvas.width = curW;
    stepCanvas.height = curH;
    let stepCtx = stepCanvas.getContext('2d');
    if (!stepCtx) throw new Error('Intermediate canvas context unavailable');
    stepCtx.drawImage(img, 0, 0);

    while (curW > renderW * 2 || curH > renderH * 2) {
      curW = Math.max(Math.round(curW / 2), Math.round(renderW));
      curH = Math.max(Math.round(curH / 2), Math.round(renderH));

      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = curW;
      nextCanvas.height = curH;
      const nextCtx = nextCanvas.getContext('2d');
      if (!nextCtx) break;

      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(stepCanvas, 0, 0, curW, curH);

      stepCanvas = nextCanvas;
      stepCtx = nextCtx;
    }

    finalCtx.drawImage(stepCanvas, Math.round(dx), Math.round(dy), Math.round(renderW), Math.round(renderH));
  } else {
    finalCtx.drawImage(img, Math.round(dx), Math.round(dy), Math.round(renderW), Math.round(renderH));
  }

  return finalCanvas;
}

/**
 * Converts canvas to Blob with target format and quality
 */
export function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      format,
      quality
    );
  });
}

/**
 * Processes an image with exact dimensions and target file size or quality setting
 */
export async function processPhotoOrSignature(
  img: HTMLImageElement,
  originalFile: File,
  options: ResizeOptions
): Promise<ProcessedImageResult> {
  const canvas = drawImageWithSteppedDownscale(
    img,
    options.width,
    options.height,
    options.fitMode,
    options.format === 'image/jpeg' ? options.backgroundColor || '#ffffff' : undefined
  );

  const targetMaxBytes = options.targetKB ? options.targetKB * 1024 : undefined;
  const isLossy = options.format === 'image/jpeg' || options.format === 'image/webp';
  let finalBlob: Blob;
  let finalQuality = options.quality ?? 0.92;
  let reachedTarget = true;

  if (isLossy) {
    if (!targetMaxBytes) {
      finalBlob = await canvasToBlob(canvas, options.format, finalQuality);
    } else {
      // Binary search for optimal quality to satisfy target KB
      let minQ = 0.05;
      let maxQ = 0.98;
      let bestBlob: Blob | null = null;
      let bestQuality = minQ;

      for (let i = 0; i < 8; i++) {
        const midQ = (minQ + maxQ) / 2;
        const currentBlob = await canvasToBlob(canvas, options.format, midQ);

        if (currentBlob.size <= targetMaxBytes) {
          bestBlob = currentBlob;
          bestQuality = midQ;
          minQ = midQ; // Try higher quality
        } else {
          maxQ = midQ; // File too large, reduce quality
        }
      }

      if (bestBlob) {
        finalBlob = bestBlob;
        finalQuality = bestQuality;
      } else {
        finalQuality = 0.05;
        finalBlob = await canvasToBlob(canvas, options.format, 0.05);
        reachedTarget = finalBlob.size <= targetMaxBytes;
      }
    }
  } else {
    // PNG format (lossless)
    finalBlob = await canvasToBlob(canvas, 'image/png');
    if (targetMaxBytes && finalBlob.size > targetMaxBytes) {
      reachedTarget = false;
    }
  }

  const dataUrl = URL.createObjectURL(finalBlob);
  const compressionRatio = originalFile.size > 0 ? (1 - finalBlob.size / originalFile.size) * 100 : 0;

  return {
    blob: finalBlob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    sizeBytes: finalBlob.size,
    format: options.format,
    compressionRatio: Math.round(compressionRatio * 10) / 10,
    reachedTarget,
    actualQuality: Math.round(finalQuality * 100),
  };
}
