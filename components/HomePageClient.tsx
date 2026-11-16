'use client';

import React, { useState, useMemo } from 'react';
import { Search, Shield, Zap, Lock, HelpCircle } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import ToolCard from '@/components/ToolCard';
import RecentTools from '@/components/RecentTools';

export default function HomePageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'image' | 'pdf'>('all');

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DDF5E9] border border-[#36A879]/20 text-[#36A879] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#36A879]" />
          <span>100% Client-side • Zero server uploads • Always free</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#203247] leading-[1.15]">
          Simple tools for everyday files
        </h1>

        <p className="text-base sm:text-lg text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Resize photos and signatures for online forms, compress images, convert HEIC files to JPG, and merge or split PDF documents privately in your browser.
        </p>

        {/* Search & Category Filter */}
        <div className="pt-2 max-w-xl mx-auto space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools (e.g. signature, heic, compress, pdf)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#E5EAF1] text-sm text-[#203247] placeholder:text-[#94A3B8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3979E6] focus:border-[#3979E6] transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2">
            {(
              [
                { id: 'all', label: 'All Tools' },
                { id: 'image', label: 'Image Tools' },
                { id: 'pdf', label: 'PDF Tools' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[38px] ${
                  selectedCategory === cat.id
                    ? 'bg-[#3979E6] text-white shadow-sm'
                    : 'bg-white text-[#64748B] border border-[#E5EAF1] hover:bg-[#F7FAFF] hover:text-[#203247]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Used Tools */}
      <RecentTools />

      {/* Tools Discovery Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAF1] pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#203247]">File Tools</h2>
            <p className="text-xs text-[#64748B]">Choose any tool to start processing files immediately on your device.</p>
          </div>
          <span className="text-xs font-medium text-[#64748B]">
            {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          </span>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E5EAF1]">
            <p className="text-sm text-[#64748B]">No tools found matching &quot;{searchQuery}&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs font-semibold text-[#3979E6] hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Trust & Local Processing */}
      <section className="bg-white rounded-3xl p-7 sm:p-10 border border-[#E5EAF1] shadow-sm space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-[#203247] mb-1.5">
            How NimbleFile protects your privacy
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Unlike traditional file converters that upload documents to remote cloud storage, NimbleFile runs all operations locally on your computer or phone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
          <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#DDF5E9] text-[#36A879] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#203247] text-sm">100% In-Browser Privacy</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Files are processed in local memory. Nothing is sent across the internet, logged, or saved to a server.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#E5F0FF] text-[#3979E6] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#203247] text-sm">Instant Device Speed</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Skip upload and download transfer delays. Your device CPU handles operations at native local speed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E5EAF1] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFE7A3]/50 text-[#B87D09] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#203247] text-sm">No Accounts or Limits</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No sign-ups, passwords, or subscriptions. Access every utility directly whenever you need it.
            </p>
          </div>
        </div>
      </section>

      {/* Helpful FAQs */}
      <section className="bg-white rounded-3xl border border-[#E5EAF1] p-7 sm:p-10 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#3979E6]" />
          <h2 className="text-xl font-bold text-[#203247]">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-[#F7FAFF] rounded-2xl border border-[#E5EAF1] space-y-1.5">
            <h3 className="font-semibold text-sm text-[#203247]">
              Are my photos or documents uploaded to a server?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No. All operations run directly in your web browser using HTML5 Canvas, WebAssembly, and pdf-lib. Your files never leave your device.
            </p>
          </div>

          <div className="p-4 bg-[#F7FAFF] rounded-2xl border border-[#E5EAF1] space-y-1.5">
            <h3 className="font-semibold text-sm text-[#203247]">
              How do I resize a photo or signature to under 50 KB or 20 KB?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Open the Photo & Signature Resizer tool, enter your portal’s required width and height in pixels, and set your target KB limit. The tool automatically optimizes compression to meet the limit.
            </p>
          </div>

          <div className="p-4 bg-[#F7FAFF] rounded-2xl border border-[#E5EAF1] space-y-1.5">
            <h3 className="font-semibold text-sm text-[#203247]">
              Can I convert iPhone HEIC photos to JPG?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Yes. Use the HEIC to JPG Converter to batch process Apple .heic and .heif photos into standard JPGs directly in your browser.
            </p>
          </div>

          <div className="p-4 bg-[#F7FAFF] rounded-2xl border border-[#E5EAF1] space-y-1.5">
            <h3 className="font-semibold text-sm text-[#203247]">
              Is NimbleFile free to use?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Yes, 100% free with unlimited conversions. No accounts, credit cards, or paywalls required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
