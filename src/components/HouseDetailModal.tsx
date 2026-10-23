import React, { useEffect } from 'react';
import { X, Check, ArrowRight, Layers, Compass, Box } from 'lucide-react';
import { HouseModel } from '../config/siteConfig';
import { HouseCardCanvas } from './ProceduralArchIllustration';

interface HouseDetailModalProps {
  model: HouseModel | null;
  onClose: () => void;
  onSelectForConsultation: (model: HouseModel) => void;
  onLoadInMain3D?: (model: HouseModel) => void;
}

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({
  model,
  onClose,
  onSelectForConsultation,
  onLoadInMain3D,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (model) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [model, onClose]);

  if (!model) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-house-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1040px] bg-[#F6F3EC] text-[#181D18] rounded-xl border border-[#181D18]/20 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181D18] text-[#F6F3EC] border-b border-white/10 shrink-0">
          <div>
            <div className="text-xs font-mono-tabular text-[#C99A63] uppercase tracking-wider">
              Spesifikasi Konsep Arsitektur · {model.category}
            </div>
            <h3 id="modal-house-title" className="text-xl sm:text-2xl font-display font-semibold">
              {model.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail model rumah"
            className="p-2 text-[#F6F3EC]/75 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: High-Contrast Architectural Elevation & Material Swatches */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#161915] rounded-xl overflow-hidden border border-[#181D18]/15 text-[#F6F3EC]">
            <div className="h-[260px] sm:h-[310px] w-full">
              <HouseCardCanvas model={model} />
            </div>

            <div className="p-5 space-y-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tabular uppercase tracking-wider text-[#C99A63]">
                  Skema Palet Fasad & Atap
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-sm border border-white/20"
                    style={{ backgroundColor: model.config3D.wallColor }}
                    title="Dinding Utama"
                  />
                  <span
                    className="w-4 h-4 rounded-sm border border-white/20"
                    style={{ backgroundColor: model.config3D.secondaryWallColor }}
                    title="Massa Sekunder"
                  />
                  <span
                    className="w-4 h-4 rounded-sm border border-white/20"
                    style={{ backgroundColor: model.config3D.woodColor }}
                    title="Elemen Kayu"
                  />
                  <span
                    className="w-4 h-4 rounded-sm border border-white/20"
                    style={{ backgroundColor: model.config3D.roofColor }}
                    title="Penutup Atap"
                  />
                </div>
              </div>

              {onLoadInMain3D && (
                <button
                  type="button"
                  onClick={() => {
                    onLoadInMain3D(model);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-[#283329] hover:bg-[#324033] text-[#F6F3EC] border border-[#B87D4B]/50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Box className="w-4 h-4 text-[#C99A63]" />
                  <span>Buka & Putar Model Ini di Panggung 3D Utama</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Architectural Concept & Specifications */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-mono-tabular uppercase tracking-wider text-[#8C582B] mb-1.5">
                  Deskripsi Konsep Ruang
                </h4>
                <p className="text-sm text-[#181D18]/85 leading-relaxed">{model.detailedDesc}</p>
              </div>

              {/* Tabular Spec Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#EFECE4] rounded-lg border border-[#181D18]/10 text-xs">
                <div>
                  <div className="text-[#181D18]/60">Luas Lahan Ideal</div>
                  <div className="font-mono-tabular font-semibold text-sm text-[#181D18] mt-0.5">
                    {model.idealLandSize}
                  </div>
                </div>
                <div>
                  <div className="text-[#181D18]/60">Perkiraan Bangunan</div>
                  <div className="font-mono-tabular font-semibold text-sm text-[#181D18] mt-0.5">
                    {model.buildingArea}
                  </div>
                </div>
                <div>
                  <div className="text-[#181D18]/60">Kapasitas Ruang</div>
                  <div className="font-semibold text-sm text-[#181D18] mt-0.5">
                    {model.bedrooms} · {model.bathrooms}
                  </div>
                </div>
                <div>
                  <div className="text-[#181D18]/60">Konfigurasi Massa</div>
                  <div className="font-mono-tabular font-semibold text-sm text-[#181D18] mt-0.5">
                    {model.floors} Lantai
                  </div>
                </div>
              </div>

              {/* Key Materials */}
              <div>
                <h4 className="text-xs font-mono-tabular uppercase tracking-wider text-[#8C582B] mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Karakter Material Utama</span>
                </h4>
                <div className="text-xs text-[#181D18]/85 leading-relaxed">
                  {model.keyMaterials.join(' · ')}
                </div>
              </div>

              {/* Architectural Highlights */}
              <div>
                <h4 className="text-xs font-mono-tabular uppercase tracking-wider text-[#8C582B] mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Keunggulan Desain Tropis</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#181D18]/85">
                  {model.architecturalHighlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#8C582B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-[#181D18]/10 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => onSelectForConsultation(model)}
                className="flex-1 py-3 px-4 bg-[#1E261F] hover:bg-[#283329] text-[#F6F3EC] text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Pilih Model Ini untuk Konsultasi</span>
                <ArrowRight className="w-4 h-4 text-[#C99A63]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-transparent hover:bg-[#181D18]/5 text-[#181D18] text-xs sm:text-sm font-medium rounded-lg border border-[#181D18]/20 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
