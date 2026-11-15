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
    <div className="space-y-14">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Client-side only • No file uploads • Free forever</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
          Simple tools for everyday files
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Resize photos and signatures for exam portals, compress images, convert HEIC photos to JPG, and merge or split PDF documents. Everything runs privately on your device.
        </p>

        {/* Search & Filter Bar */}
        <div className="pt-2 max-w-xl mx-auto space-y-3.5">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools (e.g. signature, heic, compress, pdf)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2">
            {(
              [
                { id: 'all', label: 'All Tools' },
                { id: 'image', label: 'Image Utilities' },
                { id: 'pdf', label: 'PDF Utilities' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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

      {/* Tools Grid */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Utilities</h2>
            <p className="text-xs text-slate-500">Select any tool to begin processing directly in your browser.</p>
          </div>
          <span className="text-xs font-medium text-slate-500">
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
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No tools found matching &quot;{searchQuery}&quot;.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Why Client-Side Processing Matters */}
      <section className="bg-white rounded-2xl p-7 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-1.5">
            Why client-side processing matters
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Most online file converters upload your sensitive IDs, certificates, signatures, and photos to remote cloud servers. NimbleFile executes operations locally in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">True Data Privacy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your files never leave your computer or smartphone. No server storage, logs, or retention.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Local Hardware Speed</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zero network upload or download wait times. Processing occurs immediately using your device CPU.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Zero Accounts Needed</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No logins, subscriptions, email sign-ups, or usage limits. Use tools on demand whenever you need them.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-10 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <h3 className="font-semibold text-sm text-slate-900">
              Are my documents and photos uploaded to a server?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No. All operations run directly in your browser using modern Web APIs (Canvas, WebAssembly, and pdf-lib). Your files are never transmitted across the network.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <h3 className="font-semibold text-sm text-slate-900">
              How do I resize a photo or signature to under 50 KB or 20 KB?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open the Photo & Signature Resizer tool, enter your portal’s required width and height in pixels, and set the Target File Size limit (e.g. 50 KB). The engine automatically optimizes quality to match the limit.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <h3 className="font-semibold text-sm text-slate-900">
              Can I convert iPhone HEIC photos to JPG?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yes. Use the HEIC to JPG Converter to batch process Apple .heic and .heif photos into standard JPEGs right on your computer or phone.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <h3 className="font-semibold text-sm text-slate-900">
              Is NimbleFile completely free?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yes, 100% free with unlimited conversions. No accounts, credit cards, or hidden paywalls.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
