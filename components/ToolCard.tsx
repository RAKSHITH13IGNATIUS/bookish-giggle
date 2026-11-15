import React from 'react';
import Link from 'next/link';
import { Crop, Maximize2, FileImage, FileText, ImageDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { ToolInfo } from '@/lib/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Crop: <Crop className="w-6 h-6 text-brand-600" />,
  Maximize2: <Maximize2 className="w-6 h-6 text-brand-600" />,
  FileImage: <FileImage className="w-6 h-6 text-brand-600" />,
  FileText: <FileText className="w-6 h-6 text-brand-600" />,
  ImageDown: <ImageDown className="w-6 h-6 text-brand-600" />,
};

interface ToolCardProps {
  tool: ToolInfo;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={tool.slug}
      className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-100/70 transition-all">
            {ICON_MAP[tool.icon] || <Crop className="w-6 h-6 text-brand-600" />}
          </div>
          {tool.badge && (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
          {tool.name}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Client-side only</span>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
          Open Tool <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
