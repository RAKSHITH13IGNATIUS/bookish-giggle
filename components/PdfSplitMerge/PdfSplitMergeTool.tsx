'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Sliders,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  CheckCircle,
  Archive,
  Layers,
  Scissors,
} from 'lucide-react';
import { PdfDocumentItem } from '@/lib/types';
import { validatePdfFile } from '@/lib/file-validation';
import {
  mergePdfDocuments,
  parsePageRangeString,
  extractPdfPages,
  splitAllPdfPages,
  getPdfPageCount,
} from '@/lib/pdf-processing';
import { downloadBlob, downloadZipArchive, ZipFileEntry } from '@/lib/download-utils';
import { recordToolUsage } from '@/components/RecentTools';
import { formatBytes } from '@/lib/image-processing';

export default function PdfSplitMergeTool() {
  const [activeTab, setActiveTab] = useState<'merge' | 'split'>('merge');

  // Merge State
  const [mergeItems, setMergeItems] = useState<PdfDocumentItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<number>(0);
  const [mergedPdfBlob, setMergedPdfBlob] = useState<Blob | null>(null);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  // Split State
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPageCount, setSplitPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [isSplitting, setIsSplitting] = useState<boolean>(false);
  const [splitProgress, setSplitProgress] = useState<number>(0);
  const [splitResultBlob, setSplitResultBlob] = useState<Blob | null>(null);
  const [splitResultUrl, setSplitResultUrl] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrls = useRef<string[]>([]);

  useEffect(() => {
    recordToolUsage('pdf-split-merge');
    return () => {
      activeObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      activeObjectUrls.current = [];
    };
  }, []);

  const registerObjectUrl = (url: string) => {
    activeObjectUrls.current.push(url);
    return url;
  };

  // Add PDFs for Merge
  const handleMergeFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: PdfDocumentItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = await validatePdfFile(file);

      if (!validation.valid) {
        setErrorMessage(validation.error || `File ${file.name} is not a valid PDF.`);
        continue;
      }

      try {
        const pageCount = await getPdfPageCount(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          sizeBytes: file.size,
          pageCount,
        });
      } catch (err: any) {
        setErrorMessage(`Failed to read PDF "${file.name}". It may be password-protected.`);
      }
    }

    if (newItems.length > 0) {
      setMergeItems((prev) => [...prev, ...newItems]);
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
        setMergedPdfUrl(null);
      }
      setMergedPdfBlob(null);
    }
  };

  // Add PDF for Split
  const handleSplitFile = async (file: File) => {
    setErrorMessage(null);
    const validation = await validatePdfFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please upload a valid PDF document.');
      return;
    }

    try {
      const pageCount = await getPdfPageCount(file);
      setSplitFile(file);
      setSplitPageCount(pageCount);
      setRangeInput(`1-${Math.min(3, pageCount)}`);
      setSplitResultBlob(null);
      if (splitResultUrl) {
        URL.revokeObjectURL(splitResultUrl);
        setSplitResultUrl(null);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to read PDF: ${err.message}`);
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
      if (activeTab === 'merge') {
        handleMergeFiles(e.dataTransfer.files);
      } else {
        handleSplitFile(e.dataTransfer.files[0]);
      }
    }
  };

  // Merge Actions
  const moveMergeUp = (index: number) => {
    if (index === 0) return;
    setMergeItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setMergedPdfBlob(null);
  };

  const moveMergeDown = (index: number) => {
    if (index === mergeItems.length - 1) return;
    setMergeItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setMergedPdfBlob(null);
  };

  const removeMergeItem = (id: string) => {
    setMergeItems((prev) => prev.filter((item) => item.id !== id));
    setMergedPdfBlob(null);
  };

  const executeMerge = async () => {
    if (mergeItems.length < 2 || isMerging) return;
    setIsMerging(true);
    setMergeProgress(0);
    setErrorMessage(null);

    try {
      const files = mergeItems.map((item) => item.file);
      const blob = await mergePdfDocuments(files, (p) => setMergeProgress(p));
      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
      const url = registerObjectUrl(URL.createObjectURL(blob));
      setMergedPdfBlob(blob);
      setMergedPdfUrl(url);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to merge PDF files.');
    } finally {
      setIsMerging(false);
    }
  };

  // Split Actions
  const executeSplit = async () => {
    if (!splitFile || isSplitting) return;
    setIsSplitting(true);
    setSplitProgress(0);
    setErrorMessage(null);

    try {
      if (splitMode === 'range') {
        const indices = parsePageRangeString(rangeInput, splitPageCount);
        const blob = await extractPdfPages(splitFile, indices);
        if (splitResultUrl) URL.revokeObjectURL(splitResultUrl);
        const url = registerObjectUrl(URL.createObjectURL(blob));
        setSplitResultBlob(blob);
        setSplitResultUrl(url);
      } else {
        // Split all pages into ZIP
        const entries = await splitAllPdfPages(splitFile, (p) => setSplitProgress(p));
        const zipFiles: ZipFileEntry[] = entries.map((e) => ({
          filename: e.filename,
          blob: e.blob,
        }));
        await downloadZipArchive(zipFiles, `${splitFile.name.replace(/\.pdf$/i, '')}_split_pages.zip`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to split PDF.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tab Switcher (Merge vs Split) */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('merge');
              setErrorMessage(null);
            }}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
              activeTab === 'merge'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Merge Multiple PDFs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('split');
              setErrorMessage(null);
            }}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
              activeTab === 'split'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-4 h-4 text-brand-600" />
            <span>Split / Extract Pages</span>
          </button>
        </div>
      </div>

      {/* MERGE TAB VIEW */}
      {activeTab === 'merge' && (
        <div className="space-y-6">
          {/* Upload Area for Merge */}
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
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMergeFiles(e.target.files);
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Select or Drag & Drop Multiple PDF Documents
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md mx-auto">
              Combine two or more PDF files into a single unified document. Drag or use arrow keys to change merge sequence.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
              <FileText className="w-4 h-4" />
              <span>Add PDF Files</span>
            </div>
          </div>

          {/* Merge Document Queue */}
          {mergeItems.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900">{mergeItems.length}</strong> documents (Total{' '}
                  <strong className="text-slate-900">
                    {mergeItems.reduce((acc, i) => acc + i.pageCount, 0)} pages
                  </strong>
                  )
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={mergeItems.length < 2 || isMerging}
                    onClick={executeMerge}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                  >
                    {isMerging ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Merging ({mergeProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Merge {mergeItems.length} PDFs</span>
                      </>
                    )}
                  </button>

                  {mergedPdfBlob && (
                    <button
                      type="button"
                      onClick={() => downloadBlob(mergedPdfBlob, 'merged_document.pdf')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Merged PDF</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Iframe if merged */}
              {mergedPdfUrl && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Eye className="w-4 h-4 text-brand-600" />
                      <span>Merged PDF Preview</span>
                    </div>
                  </div>
                  <iframe
                    src={mergedPdfUrl}
                    className="w-full h-[450px] rounded-xl border border-slate-200"
                    title="Merged PDF Preview"
                  />
                </div>
              )}

              {/* List of PDFs to Merge */}
              <div className="space-y-2">
                {mergeItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center font-mono font-bold text-xs text-brand-700 bg-brand-50 rounded py-0.5 shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-[360px]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} • {formatBytes(item.sizeBytes)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveMergeUp(index)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === mergeItems.length - 1}
                        onClick={() => moveMergeDown(index)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMergeItem(item.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Remove"
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
      )}

      {/* SPLIT TAB VIEW */}
      {activeTab === 'split' && (
        <div className="space-y-6">
          {!splitFile ? (
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
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSplitFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Select or Drag & Drop PDF to Split
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-md mx-auto">
                Extract custom page ranges or split entire document into individual pages.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all min-h-[44px]">
                <FileText className="w-4 h-4" />
                <span>Select PDF File</span>
              </div>
            </div>
          ) : (
            /* Split Controls */
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                      {splitFile.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {splitPageCount} total pages • {formatBytes(splitFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSplitFile(null);
                      setSplitResultBlob(null);
                      if (splitResultUrl) URL.revokeObjectURL(splitResultUrl);
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors min-h-[44px] px-2"
                  >
                    Change File
                  </button>
                </div>

                {/* Mode Selector */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSplitMode('range')}
                      className={`p-4 rounded-xl border text-left transition-all min-h-[44px] ${
                        splitMode === 'range'
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Extract Specific Page Range</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Extract specific pages into one new PDF (e.g. 1-3, 5).
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSplitMode('all')}
                      className={`p-4 rounded-xl border text-left transition-all min-h-[44px] ${
                        splitMode === 'all'
                          ? 'border-brand-600 bg-brand-50/70 text-brand-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Split Every Page into Files</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Save each page as an individual PDF and download all in a ZIP.
                      </div>
                    </button>
                  </div>

                  {splitMode === 'range' && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Page Range (1 to {splitPageCount})
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1-3, 5, 8"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        className="w-full sm:max-w-md px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                      />
                      <p className="text-[11px] text-slate-400">
                        Use commas to separate single pages and hyphens for page ranges (e.g. 1-2, 4).
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    {splitMode === 'range' ? 'Generates a single filtered PDF' : 'Generates a ZIP archive containing all pages'}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isSplitting}
                      onClick={executeSplit}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                    >
                      {isSplitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing ({splitProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Scissors className="w-4 h-4" />
                          <span>{splitMode === 'range' ? 'Extract Pages' : 'Split All to ZIP'}</span>
                        </>
                      )}
                    </button>

                    {splitResultBlob && splitMode === 'range' && (
                      <button
                        type="button"
                        onClick={() =>
                          downloadBlob(
                            splitResultBlob,
                            `${splitFile.name.replace(/\.pdf$/i, '')}_extracted.pdf`
                          )
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all min-h-[44px]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview extracted PDF */}
              {splitResultUrl && splitMode === 'range' && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <Eye className="w-4 h-4 text-brand-600" />
                      <span>Extracted PDF Preview</span>
                    </div>
                  </div>
                  <iframe
                    src={splitResultUrl}
                    className="w-full h-[450px] rounded-xl border border-slate-200"
                    title="Extracted PDF Preview"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
