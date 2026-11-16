import React from 'react';
import { PHOTO_SIGNATURE_PRESETS } from '@/lib/constants';
import { Preset } from '@/lib/types';
import { Info, UserCheck, Edit3 } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (preset: Preset) => void;
  selectedPresetId?: string;
}

export default function PresetSelector({ onSelectPreset, selectedPresetId }: PresetSelectorProps) {
  const photos = PHOTO_SIGNATURE_PRESETS.filter((p) => p.category === 'photo');
  const signatures = PHOTO_SIGNATURE_PRESETS.filter((p) => p.category === 'signature');

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#FFE7A3]/30 border border-[#FFE7A3] text-[#203247] text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-[#B87D09] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-[#203247]">Preset Guidelines & Reference Only</p>
          <p className="text-[#64748B] leading-relaxed">
            These presets are examples based on common exam, visa, and passport portal specifications. Portal rules can change each year — <strong>always verify exact requirements in your official application brochure before uploading.</strong>
          </p>
        </div>
      </div>

      {/* Photo Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-[#203247] font-bold text-sm">
          <UserCheck className="w-4 h-4 text-[#3979E6]" />
          <span>Application Photo Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {photos.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#3979E6] bg-[#E5F0FF]/60 ring-2 ring-[#3979E6]/20 shadow-sm'
                    : 'border-[#E5EAF1] bg-white hover:border-[#3979E6]/30 hover:bg-[#F7FAFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#203247]">{preset.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#3979E6] bg-[#E5F0FF] px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] mb-2">{preset.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                  <span className="bg-[#F7FAFF] border border-[#E5EAF1] px-1.5 py-0.5 rounded font-mono">
                    {preset.width}×{preset.height} px
                  </span>
                  {preset.targetMaxKB && (
                    <span className="bg-[#F7FAFF] border border-[#E5EAF1] px-1.5 py-0.5 rounded">
                      &lt; {preset.targetMaxKB} KB
                    </span>
                  )}
                  <span className="uppercase text-[#94A3B8]">{preset.format.replace('image/', '')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signature Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-[#203247] font-bold text-sm">
          <Edit3 className="w-4 h-4 text-[#36A879]" />
          <span>Digital Signature Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {signatures.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#3979E6] bg-[#E5F0FF]/60 ring-2 ring-[#3979E6]/20 shadow-sm'
                    : 'border-[#E5EAF1] bg-white hover:border-[#3979E6]/30 hover:bg-[#F7FAFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#203247]">{preset.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#3979E6] bg-[#E5F0FF] px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] mb-2">{preset.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                  <span className="bg-[#F7FAFF] border border-[#E5EAF1] px-1.5 py-0.5 rounded font-mono">
                    {preset.width}×{preset.height} px
                  </span>
                  {preset.targetMaxKB && (
                    <span className="bg-[#F7FAFF] border border-[#E5EAF1] px-1.5 py-0.5 rounded">
                      &lt; {preset.targetMaxKB} KB
                    </span>
                  )}
                  <span className="uppercase text-[#94A3B8]">{preset.format.replace('image/', '')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
