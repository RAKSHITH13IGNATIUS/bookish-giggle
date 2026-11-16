'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Download,
  Trash2,
  FileImage,
  Sliders,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { ImageToPdfItem, ImageToPdfSettings } from '@/lib/types';
import { validateImageFile } from '@/lib/file-validation';
import { convertImagesToPdf } from '@/lib/pdf-processing';
import { downloadBlob } from '@/lib/download-utils';
import { recordToolUsage } from '@/components/RecentTools';
import { formatBytes } from '@/lib/image-processing';

export default function ImagesToPdfTool() {
  const [items, setItems] = useState<ImageToPdfItem[]>([]);
  const [settings, setSettings] = useState<ImageToPdfSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'small',
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrls = useRef<string[]>([]);

  useEffect(() => {
    recordToolUsage('images-to-pdf');
    return () => {
      activeObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      activeObjectUrls.current = [];
    };
  }, []);

  const registerObjectUrl = (url: string) => {
    activeObjectUrls.current.push(url);
    return url;
  };

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: ImageToPdfItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = await validateImageFile(file, ['jpeg', 'png', 'webp']);

      if (!validation.valid) {
        setErrorMessage(validation.error || `File ${file.name} is invalid.`);
        continue;
      }

      const previewUrl = registerObjectUrl(URL.createObjectURL(file));

      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        name: file.name,
        sizeBytes: file.size,
        width: 0,
        height: 0,
        previewUrl,
        rotation: 0,
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }
      setPdfBlob(null);
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

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setPdfBlob(null);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
    setPdfBlob(null);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
    setPdfBlob(null);
  };

  const clearAll = () => {
    setItems([]);
    setPdfBlob(null);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    setErrorMessage(null);
  };

  const handleGeneratePdf = async () => {
    if (items.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(10);
    setErrorMessage(null);

    try {
      const blob = await convertImagesToPdf(items, settings);

      setPdfBlob(blob);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      const previewUrl = registerObjectUrl(URL.createObjectURL(blob));
      setPdfPreviewUrl(previewUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate PDF document.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, 'converted-document.pdf');
  };

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
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-white ${dragActive
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
        <div className="w-16 h-16 rounded-2xl bg-[#FFE7A3]/40 text-[#B87D09] mx-auto flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#203247] mb-1">
          Select or Drop Images to Convert to PDF
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] mb-5 max-w-md mx-auto">
          Upload multiple JPG, PNG, and WebP pictures. Reorder pages and customize paper size and margins.
        </p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3979E6] hover:bg-[#2B68D1] text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
          <FileImage className="w-4 h-4" />
          <span>Add Images</span>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-6">
          {/* Settings Panel */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5EAF1] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#3979E6]" />
                <span className="font-bold text-[#203247] text-sm">PDF Page & Layout Settings</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block">
                  Page Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'a4', label: 'A4' },
                      { id: 'letter', label: 'US Letter' },
                      { id: 'fit', label: 'Fit Image' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSettings((s) => ({ ...s, pageSize: p.id }));
                        setPdfBlob(null);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all min-h-[44px] text-xs font-semibold ${settings.pageSize === p.id
                          ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247]'
                          : 'border-[#E5EAF1] bg-white text-[#64748B] hover:bg-[#F7FAFF]'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block">
                  Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'portrait', label: 'Portrait' },
                      { id: 'landscape', label: 'Landscape' },
                      { id: 'auto', label: 'Auto Detect' },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setSettings((s) => ({ ...s, orientation: o.id }));
                        setPdfBlob(null);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all min-h-[44px] text-xs font-semibold ${settings.orientation === o.id
                          ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247]'
                          : 'border-[#E5EAF1] bg-white text-[#64748B] hover:bg-[#F7FAFF]'
                        }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#203247] uppercase tracking-wider block">
                  Page Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'none', label: 'No Margin' },
                      { id: 'small', label: 'Small' },
                      { id: 'normal', label: 'Normal' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSettings((s) => ({ ...s, margin: m.id }));
                        setPdfBlob(null);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all min-h-[44px] text-xs font-semibold ${settings.margin === m.id
                          ? 'border-[#3979E6] bg-[#E5F0FF] text-[#203247]'
                          : 'border-[#E5EAF1] bg-white text-[#64748B] hover:bg-[#F7FAFF]'
                        }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-3xl bg-white border border-[#E5EAF1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#64748B]">
              <strong className="text-[#203247]">{items.length}</strong> pages queued • Total images size:{' '}
              <strong className="text-[#203247]">
                {formatBytes(items.reduce((s, i) => s + i.sizeBytes, 0))}
              </strong>
              {pdfBlob && (
                <span>
                  {' '}
                  • Generated PDF:{' '}
                  <strong className="text-[#3979E6]">{formatBytes(pdfBlob.size)}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="convert-pdf-btn"
                disabled={isGenerating}
                onClick={handleGeneratePdf}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3979E6] hover:bg-[#2B68D1] disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating PDF ({generationProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>{pdfBlob ? 'Regenerate PDF' : 'Convert to PDF'}</span>
                  </>
                )}
              </button>

              {pdfBlob && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#36A879] hover:bg-[#2F946A] text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* Live PDF Preview if Generated */}
          {pdfPreviewUrl && (
            <div className="p-4 bg-white rounded-3xl border border-[#E5EAF1] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#203247] uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-[#3979E6]" />
                  <span>PDF Document Preview ({items.length} Pages)</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#36A879] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save File</span>
                </button>
              </div>
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[480px] rounded-2xl border border-[#E5EAF1]"
                title="Generated PDF Preview"
              />
            </div>
          )}

          {/* Image Reorder Queue */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] px-1">
              Page Order (Use arrows to reorder)
            </div>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 flex items-center justify-center text-center font-mono font-bold text-xs text-[#3979E6] bg-[#E5F0FF] rounded-xl shrink-0">
                    {index + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#E5EAF1] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#203247] truncate max-w-[200px] sm:max-w-[320px]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {formatBytes(item.sizeBytes)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    className="p-2 rounded-xl border border-[#E5EAF1] hover:bg-[#F7FAFF] disabled:opacity-30 text-[#64748B] min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-2 rounded-xl border border-[#E5EAF1] hover:bg-[#F7FAFF] disabled:opacity-30 text-[#64748B] min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl text-[#94A3B8] hover:text-[#E5634D] hover:bg-[#FFB6A6]/20 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Remove page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
