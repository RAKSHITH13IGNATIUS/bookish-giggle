import { PDFDocument } from 'pdf-lib';
import { ImageToPdfItem, ImageToPdfSettings, PdfPageSize } from './types';
import { PDF_PAGE_DIMENSIONS, PDF_MARGIN_POINTS } from './constants';
import { detectMagicBytes } from './file-validation';
import { loadImage, canvasToBlob } from './image-processing';

/**
 * Converts any image (including WebP) to an embeddable PNG or JPEG byte array for pdf-lib
 */
async function getEmbeddableImage(
  item: ImageToPdfItem,
  pdfDoc: PDFDocument
): Promise<{ image: any; width: number; height: number }> {
  const magic = await detectMagicBytes(item.file);
  const buffer = await item.file.arrayBuffer();

  if (magic === 'jpeg') {
    const embedded = await pdfDoc.embedJpg(buffer);
    return { image: embedded, width: embedded.width, height: embedded.height };
  } else if (magic === 'png') {
    const embedded = await pdfDoc.embedPng(buffer);
    return { image: embedded, width: embedded.width, height: embedded.height };
  } else {
    // WebP or other browser-supported format: render to canvas and export to PNG
    const img = await loadImage(item.file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create canvas context for image conversion');
    ctx.drawImage(img, 0, 0);

    const pngBlob = await canvasToBlob(canvas, 'image/png');
    const pngBuffer = await pngBlob.arrayBuffer();
    const embedded = await pdfDoc.embedPng(pngBuffer);
    return { image: embedded, width: embedded.width, height: embedded.height };
  }
}

/**
 * Converts an array of image items into a customized PDF document
 */
export async function convertImagesToPdf(
  items: ImageToPdfItem[],
  settings: ImageToPdfSettings,
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error('Please select at least one image to convert.');
  }

  const pdfDoc = await PDFDocument.create();
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const { image, width: imgW, height: imgH } = await getEmbeddableImage(item, pdfDoc);

    // Determine target page dimensions
    let pageWidth: number;
    let pageHeight: number;

    if (settings.pageSize === 'fit') {
      // Use image dimensions in points (72 DPI)
      pageWidth = imgW;
      pageHeight = imgH;
    } else {
      const baseDim = PDF_PAGE_DIMENSIONS[settings.pageSize as 'a4' | 'letter'] || PDF_PAGE_DIMENSIONS.a4;
      let isLandscape = false;

      if (settings.orientation === 'auto') {
        isLandscape = imgW > imgH;
      } else {
        isLandscape = settings.orientation === 'landscape';
      }

      pageWidth = isLandscape ? baseDim.height : baseDim.width;
      pageHeight = isLandscape ? baseDim.width : baseDim.height;
    }

    const margin = PDF_MARGIN_POINTS[settings.margin] ?? 0;
    const availW = Math.max(10, pageWidth - 2 * margin);
    const availH = Math.max(10, pageHeight - 2 * margin);

    // Compute aspect-ratio preserved scaling
    const scale = Math.min(availW / imgW, availH / imgH);
    const scaledW = imgW * scale;
    const scaledH = imgH * scale;

    // Center image on the page
    const x = margin + (availW - scaledW) / 2;
    const y = margin + (availH - scaledH) / 2;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x,
      y,
      width: scaledW,
      height: scaledH,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Merges multiple PDF documents into a single PDF
 */
export async function mergePdfDocuments(
  pdfFiles: File[],
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  if (pdfFiles.length < 2) {
    throw new Error('Please upload at least 2 PDF documents to merge.');
  }

  const mergedDoc = await PDFDocument.create();
  const total = pdfFiles.length;

  for (let i = 0; i < total; i++) {
    const file = pdfFiles[i];
    const buffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);

    copiedPages.forEach((page) => mergedDoc.addPage(page));

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  const mergedBytes = await mergedDoc.save();
  return new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Parses user page range input such as "1-3, 5, 8-10" into 0-indexed page numbers
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const selectedIndices = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    throw new Error('Please enter a valid page range (e.g. 1-3, 5).');
  }

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range: "${part}". Ensure numbers are valid.`);
      }

      for (let p = start; p <= Math.min(end, totalPages); p++) {
        selectedIndices.add(p - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} is out of bounds (document has ${totalPages} pages).`);
      }
      selectedIndices.add(pageNum - 1);
    }
  }

  const result = Array.from(selectedIndices).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error('No valid pages found within document bounds.');
  }
  return result;
}

/**
 * Extracts specified pages from a PDF into a new PDF
 */
export async function extractPdfPages(
  file: File,
  pageIndices: number[]
): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const copied = await newDoc.copyPages(srcDoc, pageIndices);
  copied.forEach((p) => newDoc.addPage(p));

  const pdfBytes = await newDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Splits a PDF into individual 1-page PDF documents
 */
export async function splitAllPdfPages(
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<{ filename: string; blob: Blob }[]> {
  const buffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const baseName = file.name.replace(/\.pdf$/i, '');
  const outputs: { filename: string; blob: Blob }[] = [];

  for (let i = 0; i < totalPages; i++) {
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(srcDoc, [i]);
    singleDoc.addPage(page);

    const bytes = await singleDoc.save();
    outputs.push({
      filename: `${baseName}_page_${i + 1}.pdf`,
      blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalPages) * 100));
    }
  }

  return outputs;
}

/**
 * Gets page count of a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  return doc.getPageCount();
}
