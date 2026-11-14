'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import { ToolInfo } from '@/lib/types';

const RECENT_KEY = 'quickfile_recent_tools';

export function recordToolUsage(toolId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    let list: string[] = raw ? JSON.parse(raw) : [];
    list = [toolId, ...list.filter((id) => id !== toolId)].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch (err) {
    // Ignore localStorage errors
  }
}

export default function RecentTools() {
  const [recentTools, setRecentTools] = useState<ToolInfo[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const matched = ids
          .map((id) => TOOLS.find((t) => t.id === id))
          .filter((t): t is ToolInfo => Boolean(t));
        setRecentTools(matched);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  if (recentTools.length === 0) return null;

  return (
    <div className="mb-12 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-800 text-sm font-semibold">
        <History className="w-4 h-4 text-brand-600" />
        <span>Recently Used</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {recentTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.slug}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-brand-50/50 hover:border-brand-200 transition-all text-xs font-medium text-slate-700"
          >
            <span className="truncate">{tool.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
