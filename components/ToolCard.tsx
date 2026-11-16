import React from 'react';
import Link from 'next/link';
import { Crop, Maximize2, FileImage, FileText, ImageDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { ToolInfo } from '@/lib/types';

interface ToolVisualConfig {
  icon: React.ReactNode;
  bgClass: string;
}

const TOOL_VISUALS: Record<string, ToolVisualConfig> = {
  'photo-signature-resizer': {
    icon: <Crop className="w-5 h-5 text-[#3979E6]" />,
    bgClass: 'bg-[#E5F0FF]',
  },
  'image-compressor-resizer': {
    icon: <Maximize2 className="w-5 h-5 text-[#36A879]" />,
    bgClass: 'bg-[#DDF5E9]',
  },
  'heic-to-jpg': {
    icon: <ImageDown className="w-5 h-5 text-[#E5634D]" />,
    bgClass: 'bg-[#FFB6A6]/25',
  },
  'images-to-pdf': {
    icon: <FileImage className="w-5 h-5 text-[#B87D09]" />,
    bgClass: 'bg-[#FFE7A3]/40',
  },
  'pdf-split-merge': {
    icon: <FileText className="w-5 h-5 text-[#2B68D1]" />,
    bgClass: 'bg-[#E5F0FF]',
  },
};

interface ToolCardProps {
  tool: ToolInfo;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const visual = TOOL_VISUALS[tool.id] || {
    icon: <Crop className="w-5 h-5 text-[#3979E6]" />,
    bgClass: 'bg-[#E5F0FF]',
  };

  return (
    <Link
      href={tool.slug}
      className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-[#E5EAF1] shadow-sm hover:shadow-md hover:border-[#3979E6]/40 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3979E6]"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${visual.bgClass} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
            {visual.icon}
          </div>
          <span className="text-xs font-medium text-[#64748B] bg-[#F7FAFF] px-2.5 py-1 rounded-full border border-[#E5EAF1]">
            {tool.category === 'image' ? 'Image' : 'PDF'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#203247] group-hover:text-[#3979E6] transition-colors mb-1.5">
          {tool.name}
        </h3>

        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      <div className="pt-5 mt-5 border-t border-[#E5EAF1] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#36A879]" />
          <span>Local execution</span>
        </div>
        <span className="inline-flex items-center gap-1 font-semibold text-[#3979E6] group-hover:translate-x-0.5 transition-transform">
          Open tool <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
