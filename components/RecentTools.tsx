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
    <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1] shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-[#203247] text-xs font-semibold uppercase tracking-wider">
        <History className="w-4 h-4 text-[#3979E6]" />
        <span>Recently Used</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {recentTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.slug}
            className="flex items-center justify-between p-3 rounded-xl border border-[#E5EAF1] bg-[#F7FAFF] hover:bg-[#E5F0FF] hover:border-[#3979E6]/30 transition-all text-xs font-medium text-[#203247] group"
          >
            <span className="truncate group-hover:text-[#3979E6]">{tool.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#3979E6] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
