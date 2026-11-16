'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  Trash2,
  FileImage,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Archive,
  Sparkles,
} from 'lucide-react';
import { BatchImageItem, BatchCompressionSettings, ProcessedImageResult } from '@/lib/types';
import {
  loadImage,
  processPhotoOrSignature,
  formatBytes,
  ResizeOptions,
} from '@/lib/image-processing';
import { validateImageFile } from '@/lib/file-validation';
import { downloadBlob, downloadZipArchive, ZipFileEntry } from '@/lib/download-utils';
import { recordToolUsage } from '@/components/RecentTools';

export default function CompressorTool() {
  const [items, setItems] = useState<BatchImageItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch Settings
  const [settings, setSettings] = useState<BatchCompressionSettings>({
    resizeMode: 'none',
    scalePercentage: 80,
    maintainAspectRatio: true,
    format: 'original',
    quality: 0.8,
    enableTargetKB: false,
    targetKB: 100,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrls = useRef<string[]>([]);

  useEffect(() => {
    recordToolUsage('image-compressor-resizer');
    return () => {
      activeObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      activeObjectUrls.current = [];
    };
  }, []);

  const registerObjectUrl = (url: string) => {
    activeObjectUrls.current.push(url);
    return url;
  };

  // Add files to batch queue
  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: BatchImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = await validateImageFile(file, ['jpeg', 'png', 'webp']);

      if (!validation.valid) {
        setErrorMessage(validation.error || `File ${file.name} is invalid.`);
        continue;
      }

      try {
        const img = await loadImage(file);
        const previewUrl = registerObjectUrl(URL.createObjectURL(file));

        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth || img.width,
          originalHeight: img.naturalHeight || img.height,
          previewUrl,
          status: 'idle',
        });
      } catch (err: any) {
        console.error('Error loading image', err);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove single item
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear entire queue
  const clearAll = () => {
    setItems([]);
    setErrorMessage(null);
  };

  // Compress individual item using Canvas engine
  const compressSingleItem = async (
    item: BatchImageItem,
    batchSettings: BatchCompressionSettings
  ): Promise<ProcessedImageResult> => {
    const img = await loadImage(item.file);
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (batchSettings.resizeMode === 'percentage') {
      const scale = (batchSettings.scalePercentage || 100) / 100;
      targetWidth = Math.max(1, Math.round(originalWidth * scale));
      targetHeight = Math.max(1, Math.round(originalHeight * scale));
    } else if (batchSettings.resizeMode === 'dimensions') {
      if (batchSettings.targetWidth && batchSettings.targetHeight) {
        targetWidth = batchSettings.targetWidth;
        targetHeight = batchSettings.targetHeight;
      } else if (batchSettings.targetWidth) {
        const ratio = batchSettings.targetWidth / originalWidth;
        targetWidth = batchSettings.targetWidth;
        targetHeight = Math.round(originalHeight * ratio);
      } else if (batchSettings.targetHeight) {
        const ratio = batchSettings.targetHeight / originalHeight;
        targetHeight = batchSettings.targetHeight;
        targetWidth = Math.round(originalWidth * ratio);
      }
    }

    let outFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
    if (batchSettings.format === 'original') {
      if (item.file.type === 'image/png') outFormat = 'image/png';
      else if (item.file.type === 'image/webp') outFormat = 'image/webp';
      else outFormat = 'image/jpeg';
    } else {
      outFormat = batchSettings.format as 'image/jpeg' | 'image/png' | 'image/webp';
    }

    const options: ResizeOptions = {
      width: targetWidth,
      height: targetHeight,
      fitMode: 'stretch',
      format: outFormat,
      quality: batchSettings.quality,
      targetKB: batchSettings.enableTargetKB ? batchSettings.targetKB : undefined,
    };

    return await processPhotoOrSignature(img, item.file, options);
  };

  // Process all queued items sequentially to prevent tab freezing
  const processAll = async () => {
    if (items.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    setErrorMessage(null);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const current = updated[i];
      current.status = 'processing';
      setItems([...updated]);

      try {
        const res = await compressSingleItem(current, settings);
        current.result = res;
        current.status = 'done';
      } catch (err: any) {
        current.status = 'error';
        current.errorMessage = err.message || 'Compression failed';
      }

      setItems([...updated]);
    }

    setIsProcessingBatch(false);
  };

  // Download single item
  const downloadItem = (item: BatchImageItem) => {
    if (!item.result) return;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    let ext = 'jpg';
    if (item.result.format === 'image/png') ext = 'png';
    else if (item.result.format === 'image/webp') ext = 'webp';

    const filename = `${baseName}-compressed.${ext}`;
    downloadBlob(item.result.blob, filename);
  };

  // Download all completed items in a ZIP archive
  const downloadAllAsZip = async () => {
    const completed = items.filter((item) => item.status === 'done' && item.result);
    if (completed.length === 0) return;

    const zipEntries: ZipFileEntry[] = completed.map((item) => {
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      let ext = 'jpg';
      if (item.result?.format === 'image/png') ext = 'png';
      else if (item.result?.format === 'image/webp') ext = 'webp';

      return {
        filename: `${baseName}-compressed.${ext}`,
        blob: item.result!.blob,
      };
    });

    await downloadZipArchive(zipEntries, 'compressed-images.zip');
  };

  // Metrics summary
  const totalOriginalSize = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalProcessedSize = items.reduce((acc, curr) => {
    if (curr.result) return acc + curr.result.sizeBytes;
    return acc + curr.originalSize;
  }, 0);
  const processedCount = items.filter((i) => i.status === 'done').length;
  const overallReduction =
    totalOriginalSize > 0
      ? Math.round(((totalOriginalSize - totalProcessedSize) / totalOriginalSize) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FFB6A6]/20 border border-[#FFB6A6] text-[#203247] text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold ml-2 text-[#64748B] hover:text-[#203247]">✕</button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-white ${
          dragActive
            ? 'border-[#3979E6] bg-[#E5F0FF]/50 scale-[1.01]'
            : 'border-[#E5EAF1] hover:border-[#3979E6]/50 hover:bg-[#F7FAFF] shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />
        <div className="w-16 h-16 rounded-2xl bg-[#DDF5E9] text-[#36A879] mx-auto flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#203247] mb-1">
          Select or Drop Multiple Images
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] mb-5 max-w-md mx-auto">
          Batch compress JPG, PNG, and WebP images. 100% processed client-side in your browser.
        </p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3979E6] hover:bg-[#2B68D1] text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
          <FileImage className="w-4 h-4" />
          <span>Select Images for Batch Compression</span>
        </div>
      </div>

      {/* Batch Controls and Queue */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5EAF1] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#3979E6]" />
                <span className="font-bold text-[#203247] text-sm">Batch Compression Settings</span>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-[#64748B] hover:text-[#E5634D] flex items-center gap-1 transition-colors min-h-[44px] px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all ({items.length})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quality Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider">
                    Compression Quality
                  </label>
                  <span className="text-xs font-mono font-bold text-[#3979E6] bg-[#E5F0FF] px-2 py-0.5 rounded-full">
                    {Math.round(settings.quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={98}
                  value={Math.round(settings.quality * 100)}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, quality: Number(e.target.value) / 100 }))
                  }
                  className="w-full h-1.5 bg-[#E5EAF1] rounded-lg appearance-none cursor-pointer accent-[#3979E6]"
                />
                <p className="text-[11px] text-[#64748B]">
                  80% offers optimal balance between crisp detail and file reduction.
                </p>
              </div>

              {/* Resize Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block">
                  Resize Dimensions
                </label>
                <select
                  value={settings.resizeMode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, resizeMode: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#E5EAF1] bg-white text-[#203247] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#3979E6]"
                >
                  <option value="none">Original Resolution (No Resize)</option>
                  <option value="percentage">Scale by Percentage</option>
                  <option value="dimensions">Max Width & Height</option>
                </select>

                {settings.resizeMode === 'percentage' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={settings.scalePercentage}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, scalePercentage: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-[#E5EAF1] rounded-lg appearance-none cursor-pointer accent-[#3979E6]"
                    />
                    <span className="text-xs font-mono font-bold text-[#203247] w-12 text-right">
                      {settings.scalePercentage}%
                    </span>
                  </div>
                )}

                {settings.resizeMode === 'dimensions' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="number"
                      placeholder="Max Width"
                      value={settings.targetWidth || ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, targetWidth: Number(e.target.value) }))
                      }
                      className="px-2 py-1.5 text-xs rounded-xl border border-[#E5EAF1] text-[#203247]"
                    />
                    <input
                      type="number"
                      placeholder="Max Height"
                      value={settings.targetHeight || ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, targetHeight: Number(e.target.value) }))
                      }
                      className="px-2 py-1.5 text-xs rounded-xl border border-[#E5EAF1] text-[#203247]"
                    />
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block">
                  Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, format: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#E5EAF1] bg-white text-[#203247] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#3979E6]"
                >
                  <option value="original">Keep Original Formats</option>
                  <option value="image/webp">Convert to WebP (Smallest Size)</option>
                  <option value="image/jpeg">Convert to JPG / JPEG</option>
                  <option value="image/png">Convert to PNG</option>
                </select>
                <p className="text-[11px] text-[#64748B]">
                  WebP provides up to 30% smaller files than JPEG at identical quality.
                </p>
              </div>
            </div>

            {/* Target KB limit */}
            <div className="pt-2 border-t border-[#E5EAF1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="targetKbCheckBatch"
                  checked={settings.enableTargetKB}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, enableTargetKB: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-[#3979E6] focus:ring-[#3979E6] border-[#E5EAF1]"
                />
                <label htmlFor="targetKbCheckBatch" className="text-xs font-semibold text-[#203247] cursor-pointer">
                  Target Specific File Size Limit (KB)
                </label>
              </div>
              {settings.enableTargetKB && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={5000}
                    value={settings.targetKB}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, targetKB: Math.max(1, Number(e.target.value)) }))
                    }
                    className="w-24 px-2 py-1 text-xs font-mono text-center rounded-xl border border-[#E5EAF1] text-[#203247]"
                  />
                  <span className="text-xs text-[#64748B]">KB per image</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-3xl bg-white border border-[#E5EAF1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#64748B]">
              <strong className="text-[#203247]">{items.length}</strong> {items.length === 1 ? 'image' : 'images'} queued • Original Total:{' '}
              <strong className="text-[#203247]">{formatBytes(totalOriginalSize)}</strong>
              {processedCount > 0 && (
                <span>
                  {' '}
                  → Compressed: <strong className="text-[#3979E6]">{formatBytes(totalProcessedSize)}</strong>{' '}
                  <span className="text-[#36A879] font-bold">(-{overallReduction}%)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isProcessingBatch}
                onClick={processAll}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3979E6] hover:bg-[#2B68D1] disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
              >
                {isProcessingBatch ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compress All Images</span>
                  </>
                )}
              </button>

              {processedCount > 0 && (
                <button
                  type="button"
                  onClick={downloadAllAsZip}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#36A879] hover:bg-[#2F946A] text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download ZIP ({processedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Items Queue List */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-[#E5EAF1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
              >
                {/* Thumbnail & File Name */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#E5EAF1] bg-[#F7FAFF] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#203247] truncate max-w-[220px] sm:max-w-[280px]">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {item.originalWidth} × {item.originalHeight} px • {formatBytes(item.originalSize)}
                    </div>
                  </div>
                </div>

                {/* Status / Output Comparison */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {item.status === 'processing' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3979E6]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Compressing...</span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E5634D]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{item.errorMessage || 'Error'}</span>
                    </div>
                  )}

                  {item.status === 'done' && item.result && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#203247] flex items-center gap-1 justify-end">
                        <span>{formatBytes(item.result.sizeBytes)}</span>
                        <span className="text-[11px] font-bold text-[#36A879] bg-[#DDF5E9] px-2 py-0.5 rounded-full">
                          -{item.result.compressionRatio}%
                        </span>
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        {item.result.width} × {item.result.height} px • {item.result.format.replace('image/', '').toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.result && (
                      <button
                        type="button"
                        onClick={() => downloadItem(item)}
                        className="p-2 rounded-xl border border-[#E5EAF1] hover:border-[#36A879] hover:bg-[#DDF5E9] text-[#203247] hover:text-[#36A879] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl text-[#94A3B8] hover:text-[#E5634D] hover:bg-[#FFB6A6]/20 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
