import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export interface CalculatorTransferPayload {
  location: string;
  workTypeLabel: string;
  landArea: string;
  buildingArea: string;
  budgetRange: string;
  summaryNotes: string;
}

interface ProjectCalculatorProps {
  onTransferToConsultation: (payload: CalculatorTransferPayload) => void;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);

export const ProjectCalculator: React.FC<ProjectCalculatorProps> = ({ onTransferToConsultation }) => {
  const { calculatorConfig, serviceAreas } = SITE_CONFIG;

  const [buildingType, setBuildingType] = useState<string>('Rumah Tinggal Keluarga');
  const [location, setLocation] = useState<string>(serviceAreas[1].region); // Default Sleman
  const [landArea, setLandArea] = useState<number>(150);
  const [buildingArea, setBuildingArea] = useState<number>(120);
  const [floors, setFloors] = useState<number>(1);
  const [materialSpecId, setMaterialSpecId] = useState<string>('menengah');
  const [workTypeId, setWorkTypeId] = useState<string>('bangun-baru');
  const [preparedBudget, setPreparedBudget] = useState<string>('Rp 400 Juta – Rp 750 Juta');

  const calculation = useMemo(() => {
    const workObj =
      calculatorConfig.workTypes.find((w) => w.id === workTypeId) || calculatorConfig.workTypes[2];
    const specObj =
      calculatorConfig.materialSpecs.find((s) => s.id === materialSpecId) ||
      calculatorConfig.materialSpecs[1];
    const floorMult = calculatorConfig.floorMultipliers[floors] || 1.0;

    const safeBuildingArea = Math.max(18, Math.min(buildingArea || 0, 2000));
    const safeLandArea = Math.max(30, Math.min(landArea || 0, 5000));

    const minTotal = Math.round(safeBuildingArea * workObj.baseRateMin * specObj.multiplier * floorMult);
    const maxTotal = Math.round(safeBuildingArea * workObj.baseRateMax * specObj.multiplier * floorMult);

    // Estimate ground footprint coverage (KDB estimasi kasar)
    const footprintPerFloor = Math.round(safeBuildingArea / floors);
    const coverageRatio = Math.min(100, Math.round((footprintPerFloor / safeLandArea) * 100));
    const greenSpaceEstimate = Math.max(0, safeLandArea - footprintPerFloor);

    return {
      workObj,
      specObj,
      safeBuildingArea,
      safeLandArea,
      minTotal,
      maxTotal,
      footprintPerFloor,
      coverageRatio,
      greenSpaceEstimate,
    };
  }, [buildingArea, landArea, floors, materialSpecId, workTypeId, calculatorConfig]);

  const handleTransfer = () => {
    const summaryNotes = `Hasil Simulasi Awal: ${buildingType} (${floors} Lantai), Spesifikasi ${calculation.specObj.label}. Estimasi Simulasi Demo: ${formatIDR(calculation.minTotal)} - ${formatIDR(calculation.maxTotal)}.`;
    onTransferToConsultation({
      location,
      workTypeLabel: calculation.workObj.label,
      landArea: String(calculation.safeLandArea),
      buildingArea: String(calculation.safeBuildingArea),
      budgetRange: preparedBudget,
      summaryNotes,
    });
  };

  return (
    <section id="simulasi-biaya" className="py-20 lg:py-28 bg-[#EFECE4] border-t border-[#181D18]/10">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Heading */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#8C582B] mb-2">
            04 · Perencanaan Kebutuhan & Anggaran
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold text-[#181D18] leading-tight text-balance">
            Simulasi Kebutuhan Ruang & Estimasi Proyek Awal
          </h2>
          <p className="mt-4 text-base text-[#181D18]/75 leading-relaxed">
            Susun parameter dasar lahan, luas bangunan, serta spesifikasi material untuk memperoleh gambaran awal proporsi lahan dan simulasi biaya sebelum sesi konsultasi teknis.
          </p>
        </div>

        {/* Mandatory Transparent Demo Disclaimer Banner */}
        <div className="mb-10 p-5 rounded-xl bg-[#1E261F] text-[#F6F3EC] border border-[#B87D4B]/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-[#C99A63] shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-mono-tabular font-semibold text-[#C99A63] tracking-wide uppercase mr-2">
              {calculatorConfig.disclaimerTitle}:
            </span>
            <span className="text-[#F6F3EC]/85">{calculatorConfig.disclaimerText}</span>
          </div>
        </div>

        {/* Calculator 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive Input Controls */}
          <div className="lg:col-span-7 bg-[#FCFBF8] border border-[#181D18]/10 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Row 1: Jenis Pekerjaan */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#181D18]/70 mb-2.5">
                  1. Pilih Lingkup Pekerjaan Utama
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {calculatorConfig.workTypes.map((work) => (
                    <button
                      key={work.id}
                      type="button"
                      onClick={() => setWorkTypeId(work.id)}
                      className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        workTypeId === work.id
                          ? 'bg-[#1E261F] text-[#F6F3EC] border-[#1E261F]'
                          : 'bg-[#F6F3EC]/60 text-[#181D18] border-[#181D18]/15 hover:border-[#181D18]/40'
                      }`}
                    >
                      <div className="text-sm font-semibold">{work.label}</div>
                      <div
                        className={`text-xs mt-1 ${
                          workTypeId === work.id ? 'text-[#F6F3EC]/70' : 'text-[#181D18]/60'
                        }`}
                      >
                        {work.unit}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Jenis Bangunan & Lokasi Proyek */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="calc-building-type"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#181D18]/70 mb-2"
                  >
                    2. Jenis Bangunan
                  </label>
                  <select
                    id="calc-building-type"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F6F3EC] border border-[#181D18]/20 rounded-lg text-[#181D18] focus:outline-none focus:border-[#B87D4B]"
                  >
                    <option value="Rumah Tinggal Keluarga">Rumah Tinggal Keluarga</option>
                    <option value="Villa / Homestay Tropis">Villa / Homestay Tropis</option>
                    <option value="Hunian Compact / Rumah Tumbuh">Hunian Compact / Rumah Tumbuh</option>
                    <option value="Paviliun / Pendopo Modern">Paviliun / Pendopo Modern</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calc-location"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#181D18]/70 mb-2"
                  >
                    3. Lokasi Proyek (DIY & Sekitarnya)
                  </label>
                  <select
                    id="calc-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F6F3EC] border border-[#181D18]/20 rounded-lg text-[#181D18] focus:outline-none focus:border-[#B87D4B]"
                  >
                    {serviceAreas.map((area) => (
                      <option key={area.region} value={area.region}>
                        {area.region}
                      </option>
                    ))}
                    <option value="Area Sekitar DIY (Magelang / Klaten / Purworejo)">
                      Area Sekitar DIY (Magelang / Klaten / Purworejo)
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 3: Luas Lahan & Perkiraan Luas Bangunan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="calc-land-area" className="text-xs font-semibold uppercase tracking-wider text-[#181D18]/70">
                      4. Luas Lahan Total
                    </label>
                    <span className="text-sm font-mono-tabular font-semibold text-[#181D18]">
                      {landArea} m²
                    </span>
                  </div>
                  <input
                    id="calc-land-area"
                    type="range"
                    min={50}
                    max={600}
                    step={5}
                    value={landArea}
                    onChange={(e) => setLandArea(Number(e.target.value))}
                    className="w-full accent-[#1E261F] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono-tabular text-[#181D18]/50 mt-1">
                    <span>50 m²</span>
                    <span>300 m²</span>
                    <span>600 m²</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="calc-building-area" className="text-xs font-semibold uppercase tracking-wider text-[#181D18]/70">
                      5. Perkiraan Luas Bangunan
                    </label>
                    <span className="text-sm font-mono-tabular font-semibold text-[#8C582B]">
                      {buildingArea} m²
                    </span>
                  </div>
                  <input
                    id="calc-building-area"
                    type="range"
                    min={36}
                    max={450}
                    step={4}
                    value={buildingArea}
                    onChange={(e) => setBuildingArea(Number(e.target.value))}
                    className="w-full accent-[#B87D4B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono-tabular text-[#181D18]/50 mt-1">
                    <span>36 m²</span>
                    <span>200 m²</span>
                    <span>450 m²</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Jumlah Lantai & Anggaran yang Disiapkan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#181D18]/70 mb-2">
                    6. Jumlah Lantai
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 1, label: '1 Lantai' },
                      { val: 2, label: '2 Lantai' },
                      { val: 3, label: '2 Lantai + Mez' },
                    ].map((fl) => (
                      <button
                        key={fl.val}
                        type="button"
                        onClick={() => setFloors(fl.val)}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          floors === fl.val
                            ? 'bg-[#1E261F] text-[#F6F3EC] border-[#1E261F]'
                            : 'bg-[#F6F3EC] text-[#181D18] border-[#181D18]/15 hover:border-[#181D18]/40'
                        }`}
                      >
                        {fl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="calc-prepared-budget"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#181D18]/70 mb-2"
                  >
                    7. Kisaran Anggaran yang Disiapkan
                  </label>
                  <select
                    id="calc-prepared-budget"
                    value={preparedBudget}
                    onChange={(e) => setPreparedBudget(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F3EC] border border-[#181D18]/20 rounded-lg text-[#181D18] focus:outline-none focus:border-[#B87D4B]"
                  >
                    <option value="Di bawah Rp 150 Juta (Desain / Renovasi Ringan)">
                      Di bawah Rp 150 Juta (Desain / Renovasi Ringan)
                    </option>
                    <option value="Rp 150 Juta – Rp 400 Juta">Rp 150 Juta – Rp 400 Juta</option>
                    <option value="Rp 400 Juta – Rp 750 Juta">Rp 400 Juta – Rp 750 Juta</option>
                    <option value="Rp 750 Juta – Rp 1,5 Miliar">Rp 750 Juta – Rp 1,5 Miliar</option>
                    <option value="Di atas Rp 1,5 Miliar">Di atas Rp 1,5 Miliar</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Tingkat Spesifikasi Material */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#181D18]/70 mb-2">
                  8. Tingkat Spesifikasi Material
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {calculatorConfig.materialSpecs.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setMaterialSpecId(spec.id)}
                      className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                        materialSpecId === spec.id
                          ? 'bg-[#283329] text-[#F6F3EC] border-[#B87D4B]'
                          : 'bg-[#F6F3EC]/60 text-[#181D18] border-[#181D18]/15 hover:border-[#181D18]/40'
                      }`}
                    >
                      <div className="text-xs font-semibold">{spec.label}</div>
                      <div
                        className={`text-[11px] mt-1 leading-snug ${
                          materialSpecId === spec.id ? 'text-[#F6F3EC]/75' : 'text-[#181D18]/65'
                        }`}
                      >
                        {spec.notes}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculation Output & Summary Card */}
          <div className="lg:col-span-5 bg-[#181D18] text-[#F6F3EC] rounded-xl p-6 sm:p-8 border border-[#2C362D] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#C99A63]" />
                  <span className="text-xs font-mono-tabular uppercase tracking-wider text-[#C99A63]">
                    Ringkasan Simulasi Demo
                  </span>
                </div>
                <span className="text-xs font-mono-tabular text-[#F6F3EC]/60">
                  {location}
                </span>
              </div>

              {/* Estimated Cost Range */}
              <div className="my-6">
                <div className="text-xs text-[#F6F3EC]/70 mb-1">
                  Kisaran Estimasi Simulasi ({calculation.workObj.label}):
                </div>
                <div className="text-2xl sm:text-3xl font-mono-tabular font-semibold text-[#F6F3EC] tracking-tight">
                  {formatIDR(calculation.minTotal)}
                </div>
                <div className="text-sm font-mono-tabular text-[#C99A63] mt-0.5">
                  hingga {formatIDR(calculation.maxTotal)}
                </div>
                <p className="text-xs text-[#F6F3EC]/60 mt-2 leading-relaxed">
                  {calculation.workObj.description}
                </p>
              </div>

              {/* Key Architectural Spatial Ratios */}
              <div className="space-y-3 py-4 border-y border-white/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#F6F3EC]/70">Jenis & Konfigurasi:</span>
                  <span className="font-medium text-[#F6F3EC]">
                    {buildingType} · {floors === 3 ? '2 Lantai + Mez' : `${floors} Lantai`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#F6F3EC]/70">Luas Lahan / Luas Bangunan:</span>
                  <span className="font-mono-tabular font-medium text-[#F6F3EC]">
                    {calculation.safeLandArea} m² / {calculation.safeBuildingArea} m²
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#F6F3EC]/70">Estimasi Tapak Dasar (Lantai 1):</span>
                  <span className="font-mono-tabular font-medium text-[#F6F3EC]">
                    ±{calculation.footprintPerFloor} m² ({calculation.coverageRatio}% lahan)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#F6F3EC]/70">Sisa Ruang Terbuka / Taman Tropis:</span>
                  <span className="font-mono-tabular font-medium text-[#C99A63]">
                    ±{calculation.greenSpaceEstimate} m²
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#F6F3EC]/70">Anggaran yang Disiapkan:</span>
                  <span className="font-medium text-[#F6F3EC]">{preparedBudget}</span>
                </div>
              </div>

              {/* Allocation Guide */}
              <div className="mt-5 space-y-2">
                <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#F6F3EC]/60">
                  Proporsi Tahapan Umum:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-tabular">
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[#C99A63]">Tahap 1 (30%)</div>
                    <div className="text-[#F6F3EC]/80 text-[11px] mt-0.5">Pondasi & Struktur Utama</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[#C99A63]">Tahap 2 (35%)</div>
                    <div className="text-[#F6F3EC]/80 text-[11px] mt-0.5">Dinding, Atap & Plambing</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[#C99A63]">Tahap 3 (25%)</div>
                    <div className="text-[#F6F3EC]/80 text-[11px] mt-0.5">Finishing, Kusen & Lantai</div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <div className="text-[#C99A63]">Tahap 4 (10%)</div>
                    <div className="text-[#F6F3EC]/80 text-[11px] mt-0.5">Lanskap & Finalisasi</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button to Populate Consultation Form */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleTransfer}
                className="w-full py-3.5 px-5 bg-[#B87D4B] hover:bg-[#C99A63] text-[#161915] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Gunakan Simulasi Ini di Formulir Konsultasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#F6F3EC]/60 mt-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C99A63]" />
                <span>Otomatis mengisi data lahan & anggaran pada formulir di bawah</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
