import JSZip from 'jszip';
import { sanitizeFilename } from './file-validation';

/**
 * Triggers a browser download of a Blob with automatic memory cleanup
 */
export function downloadBlob(blob: Blob, rawFilename: string): void {
  const filename = sanitizeFilename(rawFilename);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Safely clean up DOM element and revoke object URL
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export interface ZipFileEntry {
  filename: string;
  blob: Blob;
}

/**
 * Bundles multiple blobs into a single ZIP archive using JSZip and triggers download
 */
export async function downloadZipArchive(
  files: ZipFileEntry[],
  zipFilename: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();

  files.forEach((file, index) => {
    const cleanName = sanitizeFilename(file.filename, `file_${index + 1}`);
    zip.file(cleanName, file.blob);
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  downloadBlob(zipBlob, zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`);
}
