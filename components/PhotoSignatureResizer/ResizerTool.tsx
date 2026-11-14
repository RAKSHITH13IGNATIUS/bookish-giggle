'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  RotateCcw,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  FileImage,
  Sliders,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Preset, ProcessedImageResult } from '@/lib/types';
import {
  loadImage,
  processPhotoOrSignature,
  formatBytes,
  ResizeOptions,
} from '@/lib/image-processing';
import { validateImageFile } from '@/lib/file-validation';
import { downloadBlob } from '@/lib/download-utils';
import PresetSelector from './PresetSelector';
import { recordToolUsage } from '@/components/RecentTools';

export default function ResizerTool() {
  // Input state
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Settings state
  const [width, setWidth] = useState<number>(600);
  const [height, setHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [fitMode, setFitMode] = useState<'stretch' | 'contain' | 'cover'>('stretch');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [enableTargetSize, setEnableTargetSize] = useState<boolean>(true);
  const [targetKB, setTargetKB] = useState<number>(50);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  // Output state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'processed' | 'original'>('processed');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrls = useRef<string[]>([]);

  // Track usage for Recent Tools
  useEffect(() => {
    recordToolUsage('photo-signature-resizer');
    return () => {
      // Clean up object URLs on unmount
      activeObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      activeObjectUrls.current = [];
    };
  }, []);

  // Helper to register object URL for cleanup
  const registerObjectUrl = (url: string) => {
    activeObjectUrls.current.push(url);
    return url;
  };

  // Handle file selection with magic-byte validation
  const handleFile = async (selectedFile: File) => {
    // Shared magic-byte validation
    const validation = await validateImageFile(selectedFile, ['jpeg', 'png']);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const img = await loadImage(selectedFile);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Revoke old preview URL if exists
      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }

      const previewUrl = registerObjectUrl(URL.createObjectURL(selectedFile));

      setFile(selectedFile);
      setImageElement(img);
      setOriginalDimensions({ width: w, height: h });
      setOriginalPreviewUrl(previewUrl);
      setAspectRatio(w / h);

      if (!selectedPresetId) {
        setWidth(w);
        setHeight(h);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Preset Selection
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
    setFormat(preset.format);
    if (preset.targetMaxKB) {
      setEnableTargetSize(true);
      setTargetKB(preset.targetMaxKB);
    } else {
      setEnableTargetSize(false);
    }
    setLockAspectRatio(false);
  };

  // Width / Height changes with aspect ratio lock
  const handleWidthChange = (newWidth: number) => {
    const val = Math.max(1, Math.round(newWidth));
    setWidth(val);
    setSelectedPresetId(undefined);
    if (lockAspectRatio && aspectRatio > 0) {
      setHeight(Math.max(1, Math.round(val / aspectRatio)));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const val = Math.max(1, Math.round(newHeight));
    setHeight(val);
    setSelectedPresetId(undefined);
    if (lockAspectRatio && aspectRatio > 0) {
      setWidth(Math.max(1, Math.round(val * aspectRatio)));
    }
  };

  // Re-run processing whenever options change
  const triggerProcessing = useCallback(async () => {
    if (!imageElement || !file) return;

    setIsProcessing(true);
    try {
      const options: ResizeOptions = {
        width,
        height,
        fitMode,
        format,
        targetKB: enableTargetSize ? targetKB : undefined,
      };

      // Clean up previous result data URL
      if (result?.dataUrl) {
        URL.revokeObjectURL(result.dataUrl);
      }

      const res = await processPhotoOrSignature(imageElement, file, options);
      registerObjectUrl(res.dataUrl);
      setResult(res);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Compression failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageElement, file, width, height, fitMode, format, enableTargetSize, targetKB]);

  // Debounced effect for processing when inputs adjust
  useEffect(() => {
    if (!imageElement || !file) return;
    const timer = setTimeout(() => {
      triggerProcessing();
    }, 180);
    return () => clearTimeout(timer);
  }, [triggerProcessing, imageElement, file]);

  // Download handler
  const handleDownload = () => {
    if (!result || !file) return;
    const ext = result.format === 'image/png' ? 'png' : 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    const filename = `${baseName}_resized_${result.width}x${result.height}.${ext}`;
    downloadBlob(result.blob, filename);
  };

  // Reset to upload state
  const handleReset = () => {
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (result?.dataUrl) URL.revokeObjectURL(result.dataUrl);
    setFile(null);
    setImageElement(null);
    setResult(null);
    setOriginalPreviewUrl(null);
    setSelectedPresetId(undefined);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-10">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Upload Zone (if no file chosen) */}
      {!file ? (
        <div className="max-w-3xl mx-auto">
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
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Select or Drag & Drop Photo or Signature
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md mx-auto">
              Supports JPG, JPEG, and PNG. Validates file header signatures locally. Zero server uploads.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
              <FileImage className="w-4 h-4" />
              <span>Browse Image from Device</span>
            </div>
          </div>

          {/* Preset guidelines reference */}
          <div className="mt-10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Supported Presets & Reference Specifications
            </h4>
            <PresetSelector
              onSelectPreset={(preset) => {
                handleSelectPreset(preset);
                fileInputRef.current?.click();
              }}
              selectedPresetId={selectedPresetId}
            />
          </div>
        </div>
      ) : (
        /* Workspace when file is uploaded */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  <span className="font-bold text-slate-900 text-sm">Resize & Compression Controls</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors min-h-[44px] px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Image</span>
                </button>
              </div>

              {/* Exact Dimensions in Pixels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Dimensions (Pixels)
                  </label>
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors min-h-[36px] ${
                      lockAspectRatio
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lockAspectRatio ? (
                      <>
                        <Lock className="w-3 h-3" /> Locked Ratio
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Free Ratio
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={8000}
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={8000}
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Fit Mode */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Fit Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'stretch', label: 'Exact Fit', desc: 'Official portal standard' },
                      { id: 'contain', label: 'Padding', desc: 'White margins' },
                      { id: 'cover', label: 'Crop Fill', desc: 'Center crop' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFitMode(m.id)}
                      className={`p-2 rounded-xl text-left border transition-all min-h-[44px] ${
                        fitMode === m.id
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{m.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target File Size in KB */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="targetKBCheck"
                      checked={enableTargetSize}
                      onChange={(e) => setEnableTargetSize(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                    />
                    <label htmlFor="targetKBCheck" className="text-xs font-semibold text-slate-900 cursor-pointer">
                      Target File Size Limit (KB)
                    </label>
                  </div>
                  {enableTargetSize && (
                    <span className="text-xs font-mono font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                      {targetKB} KB
                    </span>
                  )}
                </div>

                {enableTargetSize && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5}
                        max={1000}
                        step={5}
                        value={targetKB}
                        onChange={(e) => setTargetKB(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                      />
                      <input
                        type="number"
                        min={5}
                        max={5000}
                        value={targetKB}
                        onChange={(e) => setTargetKB(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-xs font-mono text-center rounded-lg border border-slate-200 bg-white min-h-[38px]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Smart iterative binary search adjusts JPEG quality factor to stay under limit.
                    </p>
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('image/jpeg')}
                    className={`p-2.5 rounded-xl border text-left transition-all min-h-[44px] ${
                      format === 'image/jpeg'
                        ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">JPG / JPEG</div>
                    <div className="text-[10px] text-slate-400">Supports Target KB (Recommended)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('image/png')}
                    className={`p-2.5 rounded-xl border text-left transition-all min-h-[44px] ${
                      format === 'image/png'
                        ? 'border-brand-600 bg-brand-50/70 text-brand-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">PNG</div>
                    <div className="text-[10px] text-slate-400">Lossless lines</div>
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Apply Preset
                </span>
                <PresetSelector
                  onSelectPreset={handleSelectPreset}
                  selectedPresetId={selectedPresetId}
                />
              </div>
            </div>
          </div>

          {/* Preview & Download Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              {/* Header with Metrics Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Original</div>
                  <div className="text-xs font-bold text-slate-800">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {file ? formatBytes(file.size) : '0 KB'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-brand-600">Processed Output</div>
                  <div className="text-xs font-bold text-brand-900">
                    {result ? `${result.width} × ${result.height} px` : `${width} × ${height} px`}
                  </div>
                  <div className="text-[11px] font-semibold text-brand-700">
                    {result ? formatBytes(result.sizeBytes) : 'Computing...'}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                  {result?.reachedTarget ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target Met</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Exceeds Target</span>
                    </div>
                  )}
                  {result && (
                    <div className="text-[10px] text-slate-500">
                      {result.compressionRatio > 0 ? `-${result.compressionRatio}% size` : 'No reduction'}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning if Target could not be satisfied */}
              {result && !result.reachedTarget && enableTargetSize && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Image reached minimum quality at {formatBytes(result.sizeBytes)}. Reduce pixel dimensions to satisfy target limit of {targetKB} KB.
                  </p>
                </div>
              )}

              {/* Preview Canvas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-brand-600" />
                    <span>Live Preview</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('processed')}
                      className={`px-3 py-1 rounded-md transition-colors min-h-[36px] ${
                        previewTab === 'processed'
                          ? 'bg-white text-brand-700 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Result
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('original')}
                      className={`px-3 py-1 rounded-md transition-colors min-h-[36px] ${
                        previewTab === 'original'
                          ? 'bg-white text-brand-700 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>

                <div className="relative min-h-[280px] max-h-[420px] bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-center p-4 overflow-hidden">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 bg-white px-3 py-2 rounded-xl shadow-md border border-slate-200">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Applying changes...</span>
                      </div>
                    </div>
                  )}

                  {previewTab === 'processed' && result && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={result.dataUrl}
                      alt="Processed Output"
                      className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                    />
                  )}

                  {previewTab === 'original' && originalPreviewUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={originalPreviewUrl}
                      alt="Original Input"
                      className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Ready in <strong className="text-slate-800 uppercase">{format.replace('image/', '')}</strong> format ({result ? formatBytes(result.sizeBytes) : '...'})
                </div>

                <button
                  type="button"
                  disabled={!result || isProcessing}
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all min-h-[48px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resized Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
