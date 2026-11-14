import React from 'react';
import { PHOTO_SIGNATURE_PRESETS } from '@/lib/constants';
import { Preset } from '@/lib/types';
import { Info, Sparkles, UserCheck, Edit3 } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (preset: Preset) => void;
  selectedPresetId?: string;
}

export default function PresetSelector({ onSelectPreset, selectedPresetId }: PresetSelectorProps) {
  const photos = PHOTO_SIGNATURE_PRESETS.filter((p) => p.category === 'photo');
  const signatures = PHOTO_SIGNATURE_PRESETS.filter((p) => p.category === 'signature');

  return (
    <div className="space-y-6">
      {/* Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">Important Notice Regarding Presets</p>
          <p className="text-amber-800/90 leading-relaxed">
            The presets below represent common guidelines found in standard government, passport, and exam portals.
            Requirements may vary by notification year or portal version. <strong>Always confirm the specific dimensions, file formats, and KB constraints specified in your official application brochure.</strong>
          </p>
        </div>
      </div>

      {/* Photo Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
          <UserCheck className="w-4 h-4 text-brand-600" />
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
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">{preset.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{preset.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{preset.width}x{preset.height} px</span>
                  {preset.targetMaxKB && (
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">&lt; {preset.targetMaxKB} KB</span>
                  )}
                  <span className="uppercase">{preset.format.replace('image/', '')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signature Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold text-sm">
          <Edit3 className="w-4 h-4 text-brand-600" />
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
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">{preset.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{preset.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{preset.width}x{preset.height} px</span>
                  {preset.targetMaxKB && (
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">&lt; {preset.targetMaxKB} KB</span>
                  )}
                  <span className="uppercase">{preset.format.replace('image/', '')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
