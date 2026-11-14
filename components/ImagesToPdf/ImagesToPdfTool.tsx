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
  CheckCircle,
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
      // Invalidate existing generated PDF
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

  // Reorder helpers
  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setPdfBlob(null);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setPdfBlob(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((t) => t.id !== id);
    });
    setPdfBlob(null);
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setItems([]);
    setPdfBlob(null);
    setPdfPreviewUrl(null);
  };

  // Generate PDF
  const handleGeneratePdf = async () => {
    if (items.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorMessage(null);

    try {
      const blob = await convertImagesToPdf(items, settings, (p) => setGenerationProgress(p));
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      const url = registerObjectUrl(URL.createObjectURL(blob));
      setPdfBlob(blob);
      setPdfPreviewUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF
  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, 'converted_document.pdf');
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Upload Zone */}
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
          Select or Drag & Drop Images to Convert to PDF
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md mx-auto">
          Upload multiple JPG, PNG, and WebP images. Reorder pages and customize paper size and margins.
        </p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
          <FileImage className="w-4 h-4" />
          <span>Add Images</span>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-6">
          {/* Settings Panel */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-slate-900 text-sm">PDF Page & Layout Settings</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
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
                      className={`p-2 rounded-xl text-center border transition-all min-h-[44px] text-xs font-semibold ${
                        settings.pageSize === p.id
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
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
                      className={`p-2 rounded-xl text-center border transition-all min-h-[44px] text-xs font-semibold ${
                        settings.orientation === o.id
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
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
                      className={`p-2 rounded-xl text-center border transition-all min-h-[44px] text-xs font-semibold ${
                        settings.margin === m.id
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900">{items.length}</strong> pages queued • Total images size:{' '}
              <strong className="text-slate-900">
                {formatBytes(items.reduce((s, i) => s + i.sizeBytes, 0))}
              </strong>
              {pdfBlob && (
                <span>
                  {' '}
                  • Generated PDF:{' '}
                  <strong className="text-brand-700">{formatBytes(pdfBlob.size)}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGeneratePdf}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
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
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* Live PDF Preview if Generated */}
          {pdfPreviewUrl && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-brand-600" />
                  <span>PDF Document Preview ({items.length} Pages)</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save File</span>
                </button>
              </div>
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[480px] rounded-xl border border-slate-200"
                title="Generated PDF Preview"
              />
            </div>
          )}

          {/* Image Reorder Queue */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Page Ordering (Use arrows to reorder pages)
            </div>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-xs text-brand-700 bg-brand-50 rounded py-0.5 shrink-0">
                    {index + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[320px]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatBytes(item.sizeBytes)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
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
