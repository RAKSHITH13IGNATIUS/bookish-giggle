'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Shield, Zap, Lock, HelpCircle, Check, ChevronRight } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import ToolCard from '@/components/ToolCard';
import RecentTools from '@/components/RecentTools';
import AdSlot from '@/components/AdSlot';

export default function HomePage() {
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
    <div className="space-y-16">
      {/* Top Banner Ad Slot */}
      <AdSlot slotId="home-top-leaderboard" format="leaderboard" />

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero File Uploads • 100% In-Browser Execution • Free Forever</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Fast, Free & Private <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-800">
            Online File Utilities
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Resize photos & signatures for government exam forms, compress images to exact KB limits, convert images to PDF, and merge or split documents instantly without creating an account.
        </p>

        {/* Search & Filter Bar */}
        <div className="pt-4 max-w-xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools (e.g. signature, compress, pdf, exam)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
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
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
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

      {/* Featured Tools Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Utility Services</h2>
            <p className="text-xs text-slate-500">Pick a tool below to begin processing immediately.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'}
          </span>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Mid-Page Ad Slot */}
      <AdSlot slotId="home-mid-banner" format="banner" />

      {/* Why QuickFile Trust & Architecture Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Why Client-Side Processing Matters
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most online file converters upload your sensitive IDs, certificates, signatures, and photos to remote cloud servers. QuickFile runs 100% locally in your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">True Data Privacy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your files never leave your computer or smartphone. No server logs, no databases, no cloud retention.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Blazing Fast Speed</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No uploading or downloading delays. Resizing and compression happen at native hardware speed using HTML5 Canvas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No Registration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No emails, passwords, credit cards, or subscription popups. Completely open and accessible to all users.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Are my documents and photos uploaded to your server?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No. All operations run directly in your browser using modern Web APIs. The processing code executes locally on your device CPU/GPU, ensuring your private photos and signatures are never transmitted over the internet.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              How do I resize a photo or signature to under 50 KB or 20 KB?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open our Photo & Signature Resizer tool, enter your portal’s required width and height in pixels, and set the Target File Size limit (e.g., 50 KB). The engine iteratively compresses the JPEG stream to deliver the maximum allowable visual clarity under that size limit.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Are the presets guaranteed to pass every portal?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The presets represent standard specifications (such as US 2x2 inch passport, UPSC/SSC exam photo dimensions). However, exam and visa guidelines can change between notification cycles. Always review the exact notification booklet before submitting.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-sm text-slate-900">
              Is QuickFile completely free to use?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yes, 100% free with unlimited conversions. The platform is supported by non-intrusive display advertising, without hidden paywalls, watermark stamps, or daily limits.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Ad Slot */}
      <AdSlot slotId="home-bottom-leaderboard" format="leaderboard" />
    </div>
  );
}
