'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
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
  };

  const convertAll = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setGlobalError(null);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed' || item.status === 'failed') continue;

      setCurrentProcessingIndex(i);
      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'converting', error: undefined } : q))
      );

      try {
        const result = await convertHeicFile(item.file, {
          toType: outputFormat,
          quality: outputFormat === 'image/jpeg' ? quality : undefined,
        });

        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'completed',
                  result,
                }
              : q
          )
        );
      } catch (err: any) {
        const errMsg = err?.message || 'Conversion failed.';
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'failed',
                  error: errMsg,
                }
              : q
          )
        );
      }
    }

    setCurrentProcessingIndex(null);
    setIsProcessing(false);
  };

  const downloadItem = (item: QueueItem) => {
    if (!item.result?.blob) return;
    const baseName = item.name.replace(/\.(heic|heif|hif)$/i, '');
    const extension = outputFormat === 'image/png' ? 'png' : 'jpg';
    downloadBlob(item.result.blob, `${baseName}.${extension}`);
  };

  const downloadAllZip = async () => {
    const completedItems = queue.filter(
      (item): item is QueueItem & { result: HeicConversionResult } =>
        item.status === 'completed' && Boolean(item.result?.blob)
    );

    if (completedItems.length === 0) return;

    const extension = outputFormat === 'image/png' ? 'png' : 'jpg';
    const zipEntries = completedItems.map((item) => ({
      filename: `${item.name.replace(/\.(heic|heif|hif)$/i, '')}.${extension}`,
      blob: item.result.blob,
    }));

    await downloadZipArchive(zipEntries, 'converted_heic_images.zip');
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const pendingCount = queue.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-[#3979E6] bg-[#E5F0FF]/50 scale-[1.01]'
            : 'border-[#E5EAF1] hover:border-[#3979E6]/50 bg-white hover:bg-[#F7FAFF] shadow-sm'
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
          <div className="w-16 h-16 rounded-2xl bg-[#FFB6A6]/25 text-[#E5634D] flex items-center justify-center transition-transform group-hover:scale-105">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-[#203247]">
              Select or Drop Apple HEIC or HEIF Photos
            </p>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Supports iPhone and iPad .heic and .heif photos up to 50 MB each
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF5E9] border border-[#36A879]/20 text-[#36A879] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Files never leave your browser</span>
          </div>
        </div>
      </div>

      {globalError && (
        <div className="p-4 rounded-2xl bg-[#FFB6A6]/20 border border-[#FFB6A6] text-[#203247] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#E5634D] shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Control Bar & Options (Only visible when items exist) */}
      {queue.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E5EAF1] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#203247]">
                Conversion Settings ({queue.length} {queue.length === 1 ? 'file' : 'files'} selected)
              </h3>
              <p className="text-xs text-[#64748B]">
                {completedCount} converted, {pendingCount} waiting
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="convert-heic-btn"
                type="button"
                onClick={convertAll}
                disabled={isProcessing || pendingCount === 0}
                className="px-5 py-2.5 rounded-xl bg-[#3979E6] text-white text-xs font-semibold hover:bg-[#2B68D1] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 min-h-[44px]"
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
                  className="px-4 py-2.5 rounded-xl bg-[#36A879] hover:bg-[#2F946A] text-white text-xs font-semibold transition-all flex items-center gap-1.5 min-h-[44px]"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download ZIP ({completedCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl text-[#64748B] hover:text-[#E5634D] hover:bg-[#FFB6A6]/10 text-xs font-medium transition-colors min-h-[44px]"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5EAF1] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#203247] mb-1.5">
                Output Format
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/jpeg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors min-h-[38px] ${
                    outputFormat === 'image/jpeg'
                      ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247] font-semibold'
                      : 'border-[#E5EAF1] text-[#64748B] hover:bg-[#F7FAFF]'
                  }`}
                >
                  JPG (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/png')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors min-h-[38px] ${
                    outputFormat === 'image/png'
                      ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247] font-semibold'
                      : 'border-[#E5EAF1] text-[#64748B] hover:bg-[#F7FAFF]'
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
                  <label className="text-xs font-semibold text-[#203247]">
                    JPEG Quality
                  </label>
                  <span className="text-xs font-mono font-medium text-[#3979E6]">
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
                  className="w-full h-1.5 bg-[#E5EAF1] rounded-lg appearance-none cursor-pointer accent-[#3979E6]"
                />
                <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
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
                className="bg-white rounded-2xl border border-[#E5EAF1] p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0">
                  {item.result?.url ? (
                    <img
                      src={item.result.url}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E5EAF1] shrink-0 bg-[#F7FAFF]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#F7FAFF] border border-[#E5EAF1] flex items-center justify-center text-[#94A3B8] shrink-0">
                      <FileImage className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-[#203247] truncate max-w-[220px] sm:max-w-[320px]">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                      <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                      {item.result && (
                        <>
                          <span>→</span>
                          <span className="font-semibold text-[#36A879]">
                            {(item.result.size / 1024).toFixed(1)} KB
                          </span>
                          {item.result.width > 0 && (
                            <span className="text-[#64748B]">
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
                    <span className="text-xs font-medium text-[#64748B] px-2.5 py-1 rounded-full bg-[#F7FAFF] border border-[#E5EAF1]">
                      Waiting
                    </span>
                  )}

                  {item.status === 'converting' && (
                    <span className="text-xs font-semibold text-[#3979E6] px-2.5 py-1 rounded-full bg-[#E5F0FF] flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Converting...
                    </span>
                  )}

                  {item.status === 'completed' && (
                    <>
                      <span className="text-xs font-semibold text-[#36A879] px-2.5 py-1 rounded-full bg-[#DDF5E9] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#36A879]" />
                        Converted
                      </span>
                      <button
                        type="button"
                        data-action="download-jpg"
                        onClick={() => downloadItem(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#36A879] hover:bg-[#2F946A] text-white text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </>
                  )}

                  {item.status === 'failed' && (
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#E5634D] px-2.5 py-1 rounded-full bg-[#FFB6A6]/20 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#E5634D]" />
                        Failed
                      </span>
                      {item.error && (
                        <p className="text-[11px] text-[#E5634D] max-w-[200px] truncate mt-0.5" title={item.error}>
                          {item.error}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={isCurrentConverting}
                    className="p-2 text-[#94A3B8] hover:text-[#E5634D] hover:bg-[#FFB6A6]/10 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF1] text-xs text-[#64748B] flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-[#3979E6] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#203247]">
            Privacy & Conversion Notes
          </p>
          <p className="leading-relaxed">
            All HEIC decoding is performed on your device via client-side WebAssembly. Your photos are never sent across the network or stored on any server.
            Note: Original camera EXIF metadata (such as GPS coordinates) is stripped during in-browser JPEG encoding for your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
