'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  FileCheck,
  Download,
  Trash2,
  AlertCircle,
  RefreshCw,
  Archive,
  ShieldCheck,
  CheckCircle2,
  FileImage,
  Info,
} from 'lucide-react';
import { validateHeicFile } from '@/lib/file-validation';
import { convertHeicFile, revokeObjectUrl, HeicConversionResult } from '@/lib/heic-processing';
import { downloadBlob, downloadZipArchive } from '@/lib/download-utils';

interface QueueItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  error?: string;
  result?: HeicConversionResult;
}

export default function HeicConverterTool() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.92);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke created blob URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.result?.url) {
          revokeObjectUrl(item.result.url);
        }
      });
    };
  }, [queue]);

  const handleFilesAdded = useCallback(async (files: FileList | File[]) => {
    setGlobalError(null);
    const newItems: QueueItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = await validateHeicFile(file);

      if (!validation.valid) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          originalSize: file.size,
          status: 'failed',
          error: validation.error || 'Invalid HEIC/HEIF file.',
        });
      } else {
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          originalSize: file.size,
          status: 'pending',
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.result?.url) {
        revokeObjectUrl(item.result.url);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    queue.forEach((item) => {
      if (item.result?.url) {
        revokeObjectUrl(item.result.url);
      }
    });
    setQueue([]);
    setGlobalError(null);
    setCurrentProcessingIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process files sequentially to safeguard mobile device memory
  const convertAll = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setGlobalError(null);

    const pendingItems = queue.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) {
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      if (current.status !== 'pending') continue;

      setCurrentProcessingIndex(i);

      // Mark converting
      setQueue((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'converting' } : item))
      );

      try {
        const result = await convertHeicFile(current.file, {
          toType: outputFormat,
          quality: outputFormat === 'image/jpeg' ? quality : undefined,
        });

        setQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'completed', result } : item))
        );
      } catch (err: any) {
        const message = err?.message || 'Conversion failed.';
        setQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'failed', error: message } : item))
        );
      }
    }

    setCurrentProcessingIndex(null);
    setIsProcessing(false);
  };

  const downloadItem = (item: QueueItem) => {
    if (!item.result?.blob) return;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
    downloadBlob(item.result.blob, `${baseName}.${ext}`);
  };

  const downloadAllZip = async () => {
    const completedItems = queue.filter((i) => i.status === 'completed' && i.result?.blob);
    if (completedItems.length === 0) return;

    const filesToZip = completedItems.map((item) => {
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
      return {
        filename: `${baseName}.${ext}`,
        blob: item.result!.blob,
      };
    });

    await downloadZipArchive(filesToZip, 'nimblefile-converted-photos.zip');
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const pendingCount = queue.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/60 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".heic,.heif,.hif,image/heic,image/heif"
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesAdded(e.target.files);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-800">
              Drop Apple HEIC or HEIF photos here, or <span className="text-brand-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-600">
              Supports standard iPhone and iPad .heic and .heif photos up to 50 MB each
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Files never leave your browser</span>
          </div>
        </div>
      </div>

      {globalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Control Bar & Options (Only visible when items exist) */}
      {queue.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Conversion Settings ({queue.length} {queue.length === 1 ? 'file' : 'files'} selected)
              </h3>
              <p className="text-xs text-slate-600">
                {completedCount} converted, {pendingCount} waiting
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="convert-heic-btn"
                type="button"
                onClick={convertAll}
                disabled={isProcessing || pendingCount === 0}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Converting {currentProcessingIndex !== null ? `(${currentProcessingIndex + 1}/${queue.length})` : ''}...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4" />
                    <span>Convert {pendingCount > 0 ? `(${pendingCount})` : ''} to JPG</span>
                  </>
                )}
              </button>

              {completedCount > 1 && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download ZIP ({completedCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Output Format
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/jpeg')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    outputFormat === 'image/jpeg'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  JPG (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/png')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    outputFormat === 'image/png'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  PNG (Lossless)
                </button>
              </div>
            </div>

            {/* Quality Slider (for JPG) */}
            {outputFormat === 'image/jpeg' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    JPEG Quality
                  </label>
                  <span className="text-xs font-mono font-medium text-slate-600">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  disabled={isProcessing}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Compact (80%)</span>
                  <span>Standard (92%)</span>
                  <span>Max (100%)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File List */}
      {queue.length > 0 && (
        <div className="space-y-2.5">
          {queue.map((item, index) => {
            const isCurrentConverting = currentProcessingIndex === index;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0">
                  {item.result?.url ? (
                    <img
                      src={item.result.url}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <FileImage className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                      {item.result && (
                        <>
                          <span>→</span>
                          <span className="font-medium text-emerald-600">
                            {(item.result.size / 1024).toFixed(1)} KB
                          </span>
                          {item.result.width > 0 && (
                            <span className="text-slate-600">
                              ({item.result.width} × {item.result.height} px)
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status & Action */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.status === 'pending' && (
                    <span className="text-xs font-medium text-slate-600 px-2.5 py-1 rounded-full bg-slate-100">
                      Waiting
                    </span>
                  )}

                  {item.status === 'converting' && (
                    <span className="text-xs font-medium text-brand-700 px-2.5 py-1 rounded-full bg-brand-50 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Converting...
                    </span>
                  )}

                  {item.status === 'completed' && (
                    <>
                      <span className="text-xs font-medium text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Converted
                      </span>
                      <button
                        type="button"
                        data-action="download-jpg"
                        onClick={() => downloadItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </>
                  )}

                  {item.status === 'failed' && (
                    <div className="text-right">
                      <span className="text-xs font-medium text-rose-700 px-2.5 py-1 rounded-full bg-rose-50 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Failed
                      </span>
                      {item.error && (
                        <p className="text-[11px] text-rose-600 max-w-[200px] truncate mt-0.5" title={item.error}>
                          {item.error}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={isCurrentConverting}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational / Privacy notice callout */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            Privacy and Conversion Details
          </p>
          <p className="leading-relaxed">
            All HEIC decoding is performed on your device via client-side WebAssembly. Your photos are never sent across the network or stored on any server.
            Note: Original camera EXIF metadata (such as GPS coordinates and device model) is omitted during in-browser JPEG encoding.
          </p>
        </div>
      </div>
    </div>
  );
}
