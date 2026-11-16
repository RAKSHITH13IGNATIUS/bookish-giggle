import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5EAF1] text-[#64748B] text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#203247]">
                NimbleFile
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Simple tools for everyday files. Fast, privacy-conscious utilities for photos, signatures, HEIC images, and PDF documents. Free to use with zero registration.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#36A879] bg-[#DDF5E9] border border-[#36A879]/20 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Client-side processing. Your files never leave your device.</span>
            </div>
          </div>

          {/* Tools Col */}
          <div>
            <h4 className="font-semibold text-[#203247] mb-3 text-xs tracking-wider">
              File Utilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/photo-signature-resizer" className="hover:text-[#3979E6] transition-colors py-1 inline-block">
                  Photo & Signature Resizer
                </Link>
              </li>
              <li>
                <Link href="/image-compressor-resizer" className="hover:text-[#3979E6] transition-colors py-1 inline-block">
                  Image Compressor & Resizer
                </Link>
              </li>
              <li>
                <Link href="/heic-to-jpg" className="hover:text-[#3979E6] transition-colors py-1 inline-block">
                  HEIC to JPG Converter
                </Link>
              </li>
              <li>
                <Link href="/images-to-pdf" className="hover:text-[#3979E6] transition-colors py-1 inline-block">
                  Images to PDF Converter
                </Link>
              </li>
              <li>
                <Link href="/pdf-split-merge" className="hover:text-[#3979E6] transition-colors py-1 inline-block">
                  PDF Split & Merge
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Architecture */}
          <div>
            <h4 className="font-semibold text-[#203247] mb-3 text-xs tracking-wider">
              Privacy & Trust
            </h4>
            <ul className="space-y-2 text-xs text-[#64748B]">
              <li className="flex items-start gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#3979E6] mt-0.5 shrink-0" />
                <span>Zero server storage or file uploads</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#36A879] mt-0.5 shrink-0" />
                <span>Runs via HTML5 Canvas, WebAssembly & pdf-lib</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3979E6] mt-0.5 shrink-0" />
                <span>Safe for government IDs, photos & signatures</span>
              </li>
            </ul>
          </div>

          {/* Notice & Guidelines */}
          <div>
            <h4 className="font-semibold text-[#203247] mb-3 text-xs tracking-wider">
              Reference Guidelines
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed mb-2">
              Preset dimensions and KB limits reflect standard online portal guidelines. Always verify the latest specifications in your official application instructions.
            </p>
            <p className="text-xs text-[#94A3B8]">
              Free utility, supported by privacy-safe web standards.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E5EAF1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} NimbleFile. Simple tools for everyday files.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#64748B] hover:text-[#203247] cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="text-[#64748B] hover:text-[#203247] cursor-pointer">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
