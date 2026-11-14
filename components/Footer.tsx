import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Lock, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                QuickFile<span className="text-brand-600">.io</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fast, privacy-first web utilities for images, photos, signatures, and PDF documents. No signup required, free forever.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>100% Client-side local execution. No server file uploads.</span>
            </div>
          </div>

          {/* Tools Col */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              File Utilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/photo-signature-resizer" className="hover:text-brand-600 transition-colors">
                  Photo & Signature Resizer
                </Link>
              </li>
              <li>
                <Link href="/image-compressor-resizer" className="hover:text-brand-600 transition-colors">
                  Image Compressor & Resizer
                </Link>
              </li>
              <li>
                <Link href="/images-to-pdf" className="hover:text-brand-600 transition-colors">
                  Images to PDF Converter
                </Link>
              </li>
              <li>
                <Link href="/pdf-split-merge" className="hover:text-brand-600 transition-colors">
                  PDF Split & Merge
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Privacy & Trust
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-start gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>Zero server storage or file uploads</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>Executed via HTML5 Canvas & Web Workers</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>Safe for confidential IDs & signatures</span>
              </li>
            </ul>
          </div>

          {/* Legal & Notice */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Notice & Guidelines
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-2">
              Dimensions, KB limits, and resolution presets are provided as reference examples based on standard specifications. Always confirm official application requirements.
            </p>
            <p className="text-xs text-slate-400">
              Free to use without registration.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} QuickFile.io. Built for speed and privacy.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 hover:text-slate-700 cursor-pointer">Privacy Guidelines</span>
            <span>•</span>
            <span className="text-slate-500 hover:text-slate-700 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="text-slate-500 hover:text-slate-700 cursor-pointer">About Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
