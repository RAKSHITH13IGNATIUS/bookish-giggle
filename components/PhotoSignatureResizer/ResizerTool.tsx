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

      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }

      const previewUrl = registerObjectUrl(URL.createObjectURL(selectedFile));

      setFile(selectedFile);
      setImageElement(img);
      setOriginalPreviewUrl(previewUrl);
      setOriginalDimensions({ width: w, height: h });
      setAspectRatio(w / h);

      if (!selectedPresetId) {
        setWidth(w);
        setHeight(h);
      }
    } catch (err: any) {
      setErrorMessage('Could not decode the selected image file. Please check file format.');
      setIsProcessing(false);
    }
  };

  // Process image on canvas whenever settings change
  const runProcessing = useCallback(async () => {
    if (!imageElement || !file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const options: ResizeOptions = {
        width,
        height,
        fitMode,
        format,
        targetKB: enableTargetSize ? targetKB : undefined,
        backgroundColor: '#FFFFFF',
      };

      const res = await processPhotoOrSignature(imageElement, file, options);
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image processing failed. Please adjust dimensions.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageElement, file, width, height, fitMode, format, enableTargetSize, targetKB]);

  // Trigger processing when dependencies change (debounced)
  useEffect(() => {
    if (!imageElement) return;

    const timer = setTimeout(() => {
      runProcessing();
    }, 150);

    return () => clearTimeout(timer);
  }, [runProcessing, imageElement]);

  // Dimension Change Handlers
  const handleWidthChange = (newWidth: number) => {
    const validWidth = Math.max(10, Math.min(8000, newWidth || 10));
    setWidth(validWidth);
    if (lockAspectRatio && aspectRatio > 0) {
      setHeight(Math.round(validWidth / aspectRatio));
    }
    setSelectedPresetId(undefined);
  };

  const handleHeightChange = (newHeight: number) => {
    const validHeight = Math.max(10, Math.min(8000, newHeight || 10));
    setHeight(validHeight);
    if (lockAspectRatio && aspectRatio > 0) {
      setWidth(Math.round(validHeight * aspectRatio));
    }
    setSelectedPresetId(undefined);
  };

  // Preset Selection
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
    setLockAspectRatio(false);
    setFormat(preset.format);
    if (preset.targetMaxKB) {
      setEnableTargetSize(true);
      setTargetKB(preset.targetMaxKB);
    }
  };

  // Drag and Drop
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

  // Reset tool
  const handleReset = () => {
    setFile(null);
    setImageElement(null);
    setResult(null);
    setErrorMessage(null);
    setSelectedPresetId(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Output
  const handleDownload = () => {
    if (!result) return;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'image';
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${baseName}-${width}x${height}.${ext}`;
    downloadBlob(result.blob, filename);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FFB6A6]/20 border border-[#FFB6A6] text-[#203247] text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#E5634D] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[#203247]">File Notice</p>
            <p className="text-xs text-[#64748B] mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-[#64748B] hover:text-[#203247] font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Zone (if no file chosen) */}
      {!file ? (
        <div className="max-w-3xl mx-auto space-y-8">
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
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-[#E5F0FF] text-[#3979E6] mx-auto flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#203247] mb-1">
              Select or Drop Photo or Signature
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mb-5 max-w-md mx-auto">
              Supports JPG, JPEG, and PNG. Validates file headers in your browser. Zero server uploads.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3979E6] hover:bg-[#2B68D1] text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
              <FileImage className="w-4 h-4" />
              <span>Choose Image from Device</span>
            </div>
          </div>

          {/* Preset guidelines reference */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
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
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5EAF1] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF1]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#3979E6]" />
                  <span className="font-bold text-[#203247] text-sm">Resize & Compression Controls</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#64748B] hover:text-[#E5634D] flex items-center gap-1 transition-colors min-h-[44px] px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New image</span>
                </button>
              </div>

              {/* Exact Dimensions in Pixels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider">
                    Dimensions (Pixels)
                  </label>
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors min-h-[36px] ${
                      lockAspectRatio
                        ? 'bg-[#E5F0FF] text-[#3979E6]'
                        : 'bg-[#F7FAFF] text-[#64748B] hover:bg-[#E5F0FF]'
                    }`}
                  >
                    {lockAspectRatio ? (
                      <>
                        <Lock className="w-3 h-3" /> Locked ratio
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Free ratio
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#64748B] block mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={8000}
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-[#E5EAF1] text-[#203247] focus:outline-none focus:ring-2 focus:ring-[#3979E6] min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#64748B] block mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={8000}
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-[#E5EAF1] text-[#203247] focus:outline-none focus:ring-2 focus:ring-[#3979E6] min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Fit Mode */}
              <div>
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block mb-2">
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
                          ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247] font-semibold'
                          : 'border-[#E5EAF1] bg-white text-[#64748B] hover:bg-[#F7FAFF]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[10px] text-[#64748B] font-normal leading-tight">
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target File Size in KB */}
              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="targetKBCheck"
                      checked={enableTargetSize}
                      onChange={(e) => setEnableTargetSize(e.target.checked)}
                      className="w-4 h-4 rounded text-[#3979E6] focus:ring-[#3979E6] border-[#E5EAF1]"
                    />
                    <label htmlFor="targetKBCheck" className="text-xs font-semibold text-[#203247] cursor-pointer">
                      Target File Size Limit (KB)
                    </label>
                  </div>
                  {enableTargetSize && (
                    <span className="text-xs font-mono font-bold text-[#3979E6] bg-[#E5F0FF] px-2 py-0.5 rounded-full">
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
                        className="w-full h-1.5 bg-[#E5EAF1] rounded-lg appearance-none cursor-pointer accent-[#3979E6]"
                      />
                      <input
                        type="number"
                        min={5}
                        max={5000}
                        value={targetKB}
                        onChange={(e) => setTargetKB(Math.max(1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-xs font-mono text-center rounded-lg border border-[#E5EAF1] bg-white text-[#203247] min-h-[38px]"
                      />
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Binary search optimization adjusts compression quality to match target size.
                    </p>
                  </div>
                )}
              </div>

              {/* Output Format */}
              <div>
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('image/jpeg')}
                    className={`p-2.5 rounded-xl border text-left transition-all min-h-[44px] ${
                      format === 'image/jpeg'
                        ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247] font-semibold'
                        : 'border-[#E5EAF1] bg-white text-[#64748B] hover:bg-[#F7FAFF]'
                    }`}
                  >
                    <div className="text-xs font-semibold">JPG / JPEG</div>
                    <div className="text-[10px] text-[#64748B]">Supports Target KB (Recommended)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('image/png')}
                    className={`p-2.5 rounded-xl border text-left transition-all min-h-[44px] ${
                      format === 'image/png'
                        ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247] font-semibold'
                        : 'border-[#E5EAF1] bg-white text-[#64748B] hover:bg-[#F7FAFF]'
                    }`}
                  >
                    <div className="text-xs font-semibold">PNG</div>
                    <div className="text-[10px] text-[#64748B]">Lossless lines</div>
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-[#E5EAF1]">
                <span className="text-xs font-semibold text-[#203247] block mb-2">
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
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5EAF1] shadow-sm space-y-6">
              {/* Header with Metrics Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Original</div>
                  <div className="text-xs font-bold text-[#203247]">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {file ? formatBytes(file.size) : '0 KB'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-[#3979E6]">Output Result</div>
                  <div className="text-xs font-bold text-[#203247]">
                    {result ? `${result.width} × ${result.height} px` : `${width} × ${height} px`}
                  </div>
                  <div className="text-[11px] font-semibold text-[#3979E6]">
                    {result ? formatBytes(result.sizeBytes) : 'Computing...'}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-[#E5EAF1] pt-2 sm:pt-0 sm:pl-3">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Status</div>
                  {result?.reachedTarget ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#36A879]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Target Met</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#B87D09]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Exceeds Target</span>
                    </div>
                  )}
                  {result && (
                    <div className="text-[10px] text-[#64748B]">
                      {result.compressionRatio > 0 ? `-${result.compressionRatio}% size` : 'No reduction'}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning if Target could not be satisfied */}
              {result && !result.reachedTarget && enableTargetSize && (
                <div className="p-3.5 rounded-2xl bg-[#FFE7A3]/30 border border-[#FFE7A3] text-[#203247] text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B87D09] shrink-0 mt-0.5" />
                  <p>
                    Image reached minimum quality factor at {formatBytes(result.sizeBytes)}. Reduce pixel dimensions to satisfy target limit of {targetKB} KB.
                  </p>
                </div>
              )}

              {/* Preview Canvas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#203247] uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-[#3979E6]" />
                    <span>Live Preview</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#F7FAFF] p-1 rounded-xl border border-[#E5EAF1] text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('processed')}
                      className={`px-3 py-1 rounded-lg transition-colors min-h-[32px] ${
                        previewTab === 'processed'
                          ? 'bg-white text-[#3979E6] shadow-sm font-semibold'
                          : 'text-[#64748B] hover:text-[#203247]'
                      }`}
                    >
                      Result
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('original')}
                      className={`px-3 py-1 rounded-lg transition-colors min-h-[32px] ${
                        previewTab === 'original'
                          ? 'bg-white text-[#3979E6] shadow-sm font-semibold'
                          : 'text-[#64748B] hover:text-[#203247]'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>

                <div className="relative min-h-[280px] max-h-[420px] bg-[#F7FAFF] rounded-2xl border border-[#E5EAF1] flex items-center justify-center p-4 overflow-hidden">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#3979E6] bg-white px-3 py-2 rounded-xl shadow-md border border-[#E5EAF1]">
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
                      className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm border border-[#E5EAF1] bg-white"
                    />
                  )}

                  {previewTab === 'original' && originalPreviewUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={originalPreviewUrl}
                      alt="Original Input"
                      className="max-h-[360px] max-w-full object-contain rounded-lg shadow-sm border border-[#E5EAF1] bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5EAF1] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#64748B]">
                  Format: <strong className="text-[#203247] uppercase">{format.replace('image/', '')}</strong> ({result ? formatBytes(result.sizeBytes) : '...'})
                </div>

                <button
                  type="button"
                  disabled={!result || isProcessing}
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#36A879] hover:bg-[#2F946A] disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all min-h-[48px]"
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
