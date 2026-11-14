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
  ArrowRight,
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove single item from queue
  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.result?.dataUrl) URL.revokeObjectURL(target.result.dataUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  // Clear all items
  const clearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.result?.dataUrl) URL.revokeObjectURL(item.result.dataUrl);
    });
    setItems([]);
  };

  // Process a single image
  const processItem = async (
    item: BatchImageItem,
    currentSettings: BatchCompressionSettings
  ): Promise<ProcessedImageResult> => {
    const img = await loadImage(item.file);
    let targetW = item.originalWidth;
    let targetH = item.originalHeight;

    if (currentSettings.resizeMode === 'percentage') {
      const factor = currentSettings.scalePercentage / 100;
      targetW = Math.max(10, Math.round(item.originalWidth * factor));
      targetH = Math.max(10, Math.round(item.originalHeight * factor));
    } else if (currentSettings.resizeMode === 'dimensions') {
      if (currentSettings.targetWidth && currentSettings.targetHeight) {
        targetW = currentSettings.targetWidth;
        targetH = currentSettings.targetHeight;
      }
    }

    // Determine output format
    let targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
    if (currentSettings.format === 'original') {
      if (item.file.type === 'image/png') targetFormat = 'image/png';
      else if (item.file.type === 'image/webp') targetFormat = 'image/webp';
      else targetFormat = 'image/jpeg';
    } else {
      targetFormat = currentSettings.format;
    }

    const options: ResizeOptions = {
      width: targetW,
      height: targetH,
      fitMode: 'stretch',
      format: targetFormat,
      quality: currentSettings.quality,
      targetKB: currentSettings.enableTargetKB ? currentSettings.targetKB : undefined,
    };

    return processPhotoOrSignature(img, item.file, options);
  };

  // Process all queued images
  const processAll = async () => {
    if (items.length === 0 || isProcessingBatch) return;
    setIsProcessingBatch(true);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      item.status = 'processing';
      setItems([...updated]);

      try {
        const res = await processItem(item, settings);
        registerObjectUrl(res.dataUrl);
        item.status = 'done';
        item.result = res;
      } catch (err: any) {
        item.status = 'error';
        item.errorMessage = err.message || 'Processing failed';
      }

      setItems([...updated]);
    }

    setIsProcessingBatch(false);
  };

  // Download individual processed item
  const downloadItem = (item: BatchImageItem) => {
    if (!item.result) return;
    const ext = item.result.format === 'image/webp' ? 'webp' : item.result.format === 'image/png' ? 'png' : 'jpg';
    const base = item.name.substring(0, item.name.lastIndexOf('.')) || 'image';
    const filename = `${base}_compressed.${ext}`;
    downloadBlob(item.result.blob, filename);
  };

  // Download all as ZIP
  const downloadAllAsZip = async () => {
    const readyItems = items.filter((item) => item.result);
    if (readyItems.length === 0) return;

    const zipEntries: ZipFileEntry[] = readyItems.map((item, idx) => {
      const ext = item.result!.format === 'image/webp' ? 'webp' : item.result!.format === 'image/png' ? 'png' : 'jpg';
      const base = item.name.substring(0, item.name.lastIndexOf('.')) || `image_${idx + 1}`;
      return {
        filename: `${base}_compressed.${ext}`,
        blob: item.result!.blob,
      };
    });

    await downloadZipArchive(zipEntries, 'compressed_images.zip');
  };

  // Totals calculation
  const totalOriginalSize = items.reduce((sum, item) => sum + item.originalSize, 0);
  const totalProcessedSize = items.reduce((sum, item) => sum + (item.result?.sizeBytes || 0), 0);
  const processedCount = items.filter((item) => item.status === 'done').length;
  const overallReduction =
    totalOriginalSize > 0 && processedCount > 0
      ? Math.round((1 - totalProcessedSize / totalOriginalSize) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white ${
          dragActive
            ? 'border-brand-600 bg-brand-50/50 scale-[1.01]'
            : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/50 shadow-sm'
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
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Select or Drag & Drop Multiple Images
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md mx-auto">
          Batch compress JPG, PNG, and WebP images. 100% processed client-side in your browser.
        </p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
          <FileImage className="w-4 h-4" />
          <span>Select Images for Batch Compression</span>
        </div>
      </div>

      {/* Batch Controls and Queue */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-slate-900 text-sm">Batch Compression Settings</span>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors min-h-[44px] px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All ({items.length})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quality Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Compression Quality
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
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
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <p className="text-[11px] text-slate-400">
                  80% offers optimal balance between crispness and file size reduction.
                </p>
              </div>

              {/* Resize Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Resize Dimensions
                </label>
                <select
                  value={settings.resizeMode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, resizeMode: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <span className="text-xs font-mono font-bold text-slate-700 w-12 text-right">
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
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                    <input
                      type="number"
                      placeholder="Max Height"
                      value={settings.targetHeight || ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, targetHeight: Number(e.target.value) }))
                      }
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, format: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="original">Keep Original Formats</option>
                  <option value="image/webp">Convert to WebP (Smallest Size)</option>
                  <option value="image/jpeg">Convert to JPG / JPEG</option>
                  <option value="image/png">Convert to PNG</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  WebP provides up to 30% smaller files than JPEG at identical quality.
                </p>
              </div>
            </div>

            {/* Target KB limit */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="targetKbCheckBatch"
                  checked={settings.enableTargetKB}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, enableTargetKB: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="targetKbCheckBatch" className="text-xs font-semibold text-slate-800 cursor-pointer">
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
                    className="w-24 px-2 py-1 text-xs font-mono text-center rounded-lg border border-slate-200"
                  />
                  <span className="text-xs text-slate-500">KB per image</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900">{items.length}</strong> {items.length === 1 ? 'image' : 'images'} queued • Original Total:{' '}
              <strong className="text-slate-900">{formatBytes(totalOriginalSize)}</strong>
              {processedCount > 0 && (
                <span>
                  {' '}
                  → Compressed: <strong className="text-brand-700">{formatBytes(totalProcessedSize)}</strong>{' '}
                  <span className="text-emerald-700 font-bold">(-{overallReduction}%)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isProcessingBatch}
                onClick={processAll}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
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
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
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
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
              >
                {/* Thumbnail & File Name */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate max-w-[220px] sm:max-w-[280px]">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.originalWidth} × {item.originalHeight} px • {formatBytes(item.originalSize)}
                    </div>
                  </div>
                </div>

                {/* Status / Output Comparison */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {item.status === 'processing' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Compressing...</span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{item.errorMessage || 'Error'}</span>
                    </div>
                  )}

                  {item.status === 'done' && item.result && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end">
                        <span>{formatBytes(item.result.sizeBytes)}</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          -{item.result.compressionRatio}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
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
                        className="p-2 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:text-brand-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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
