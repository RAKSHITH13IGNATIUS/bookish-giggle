import React from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'leaderboard' | 'rectangle' | 'banner';
  className?: string;
}

export default function AdSlot({ slotId, format = 'banner', className = '' }: AdSlotProps) {
  // Configured dimensions for compliant IAB ad units
  const getDimensions = () => {
    switch (format) {
      case 'leaderboard':
        return 'min-h-[90px] max-w-[728px]';
      case 'rectangle':
        return 'min-h-[250px] max-w-[300px]';
      case 'banner':
      default:
        return 'min-h-[90px] max-w-full';
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center my-8 ${className}`}
      aria-label="Advertising Section"
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
        Advertisement
      </div>
      <div
        id={`ad-slot-${slotId}`}
        className={`w-full ${getDimensions()} rounded-lg border border-dashed border-slate-200 bg-slate-50/60 flex items-center justify-center text-xs text-slate-400 transition-colors`}
      >
        <span className="select-none font-mono text-[11px] text-slate-400">
          Ad Slot ({format})
        </span>
      </div>
    </div>
  );
}
