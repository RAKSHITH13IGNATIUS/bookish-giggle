'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Layers } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'All Tools', href: '/' },
    { name: 'Photo & Signature', href: '/photo-signature-resizer' },
    { name: 'Image Compressor', href: '/image-compressor-resizer' },
    { name: 'HEIC to JPG', href: '/heic-to-jpg' },
    { name: 'Images to PDF', href: '/images-to-pdf' },
    { name: 'PDF Split & Merge', href: '/pdf-split-merge' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5EAF1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#3979E6] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2B68D1] transition-all duration-200">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#203247] group-hover:text-[#3979E6] transition-colors">
                NimbleFile
              </span>
              <span className="text-[11px] text-[#64748B] -mt-0.5 font-normal">
                Simple tools for everyday files
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive
                      ? 'text-[#3979E6] bg-[#E5F0FF] font-semibold'
                      : 'text-[#64748B] hover:text-[#203247] hover:bg-[#F7FAFF]'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Privacy badge */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF5E9] border border-[#36A879]/20 text-[#36A879] text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-[#36A879]" />
              <span>In-browser privacy</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#64748B] hover:text-[#203247] hover:bg-[#F7FAFF] focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E5EAF1] bg-white px-4 pt-3 pb-5 space-y-1 shadow-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium min-h-[44px] flex items-center transition-colors ${isActive
                    ? 'text-[#3979E6] bg-[#E5F0FF] font-semibold'
                    : 'text-[#203247] hover:bg-[#F7FAFF]'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 px-3">
            <div className="flex items-center gap-1.5 py-2 text-xs font-medium text-[#36A879]">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Client-side privacy guaranteed</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
