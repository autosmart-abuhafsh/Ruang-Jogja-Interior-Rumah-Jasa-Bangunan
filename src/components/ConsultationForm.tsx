import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, AlertCircle, FileText, Info } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { CalculatorTransferPayload } from './ProjectCalculator';

interface ConsultationFormProps {
  preselectedModelName?: string;
  preselectedServiceNeed?: string;
  calculatorData?: CalculatorTransferPayload | null;
}

interface FormValues {
  name: string;
  whatsapp: string;
  location: string;
  needType: string;
  preferredModel: string;
  landArea: string;
  buildingArea: string;
  budgetRange: string;
  timeline: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  whatsapp?: string;
  location?: string;
  landArea?: string;
  buildingArea?: string;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  preselectedModelName,
  preselectedServiceNeed,
  calculatorData,
}) => {
  const { business, houseModels, serviceAreas } = SITE_CONFIG;

  const [values, setValues] = useState<FormValues>({
    name: '',
    whatsapp: '',
    location: serviceAreas[1].region,
    needType: 'Desain Arsitektur & Pembangunan Rumah Baru',
    preferredModel: houseModels[0].name,
    landArea: '150',
    buildingArea: '120',
    budgetRange: 'Rp 400 Juta – Rp 750 Juta',
    timeline: 'Dalam 1 – 3 Bulan ke Depan',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [summaryReady, setSummaryReady] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync when user selects a model from the House Catalog
  useEffect(() => {
    if (preselectedModelName) {
      setValues((prev) => ({
        ...prev,
        preferredModel: preselectedModelName,
      }));
    }
  }, [preselectedModelName]);

  // Sync when user clicks a Service CTA
  useEffect(() => {
    if (preselectedServiceNeed) {
      setValues((prev) => ({
        ...prev,
        needType: preselectedServiceNeed,
      }));
    }
  }, [preselectedServiceNeed]);

  // Sync when user transfers data from the Project Calculator
  useEffect(() => {
    if (calculatorData) {
      setValues((prev) => ({
        ...prev,
        location: calculatorData.location,
        needType: calculatorData.workTypeLabel,
        landArea: calculatorData.landArea,
        buildingArea: calculatorData.buildingArea,
        budgetRange: calculatorData.budgetRange,
        notes: calculatorData.summaryNotes,
      }));
    }
  }, [calculatorData]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim() || values.name.trim().length < 2) {
      nextErrors.name = 'Mohon isi nama lengkap Anda (minimal 2 karakter).';
    }

    const cleanPhone = values.whatsapp.replace(/[\s\-+]/g, '');
    if (!cleanPhone || !/^[0-9]{9,15}$/.test(cleanPhone)) {
      nextErrors.whatsapp = 'Masukkan nomor WhatsApp yang valid (9–15 digit angka, contoh: 08123456789).';
    }

    if (!values.location.trim()) {
      nextErrors.location = 'Pilih atau isi lokasi rencana proyek Anda.';
    }

    const landNum = Number(values.landArea);
    if (!values.landArea || isNaN(landNum) || landNum < 20) {
      nextErrors.landArea = 'Masukkan luas lahan dalam m² (minimal 20 m²).';
    }

    const buildNum = Number(values.buildingArea);
    if (!values.buildingArea || isNaN(buildNum) || buildNum < 15) {
      nextErrors.buildingArea = 'Masukkan perkiraan luas bangunan dalam m² (minimal 15 m²).';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSummaryReady(true);
    } else {
      setSummaryReady(false);
    }
  };

  const formattedWhatsAppText = [
    `Halo Tim *${business.name}*, saya ingin berkonsultasi mengenai rencana proyek hunian dengan rincian berikut:`,
    ``,
    `*1. Data Klien*`,
    `• Nama: ${values.name.trim()}`,
    `• No. WhatsApp: ${values.whatsapp.trim()}`,
    `• Lokasi Proyek: ${values.location}`,
    ``,
    `*2. Spesifikasi Kebutuhan Ruang*`,
    `• Jenis Kebutuhan: ${values.needType}`,
    `• Referensi Model: ${values.preferredModel}`,
    `• Luas Lahan: ${values.landArea} m²`,
    `• Perkiraan Luas Bangunan: ${values.buildingArea} m²`,
    `• Kisaran Anggaran: ${values.budgetRange}`,
    `• Target Waktu Pengerjaan: ${values.timeline}`,
    values.notes.trim() ? `• Catatan Tambahan: ${values.notes.trim()}` : `• Catatan Tambahan: -`,
    ``,
    `Mohon informasi jadwal diskusi awal yang tersedia. Terima kasih.`,
  ].join('\n');

  const whatsappHref = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    formattedWhatsAppText
  )}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedWhatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="konsultasi" className="py-20 lg:py-28 bg-[#161915] text-[#F6F3EC] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#C99A63] mb-2">
            06 · Mulai Diskusi Proyek Anda
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold text-[#F6F3EC] leading-tight text-balance">
            Formulir Konsultasi Arsitektur, Interior & Rancang Bangun
          </h2>
          <p className="mt-4 text-base text-[#F6F3EC]/75 leading-relaxed">
            Lengkapi rincian rencana proyek Anda di bawah ini. Sistem akan memvalidasi data dan menyusun ringkasan konsultasi terstruktur yang siap dikirimkan langsung melalui WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Consultation Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-7 bg-[#1E241E] border border-white/10 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama */}
              <div>
                <label htmlFor="form-name" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Nama Lengkap <span className="text-[#C99A63]">*</span>
                </label>
                <input
                  id="form-name"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={values.name}
                  onChange={(e) => {
                    setValues({ ...values, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#141814] border rounded-lg text-[#F6F3EC] placeholder:text-[#F6F3EC]/35 focus:outline-none ${
                    errors.name ? 'border-red-400' : 'border-white/15 focus:border-[#B87D4B]'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label htmlFor="form-wa" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Nomor WhatsApp Aktif <span className="text-[#C99A63]">*</span>
                </label>
                <input
                  id="form-wa"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={values.whatsapp}
                  onChange={(e) => {
                    setValues({ ...values, whatsapp: e.target.value });
                    if (errors.whatsapp) setErrors({ ...errors, whatsapp: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-[#141814] border rounded-lg text-[#F6F3EC] placeholder:text-[#F6F3EC]/35 focus:outline-none ${
                    errors.whatsapp ? 'border-red-400' : 'border-white/15 focus:border-[#B87D4B]'
                  }`}
                />
                {errors.whatsapp && (
                  <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.whatsapp}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Lokasi Proyek */}
              <div>
                <label htmlFor="form-location" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Lokasi Proyek <span className="text-[#C99A63]">*</span>
                </label>
                <select
                  id="form-location"
                  value={values.location}
                  onChange={(e) => setValues({ ...values, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#141814] border border-white/15 rounded-lg text-[#F6F3EC] focus:outline-none focus:border-[#B87D4B]"
                >
                  {serviceAreas.map((area) => (
                    <option key={area.region} value={area.region}>
                      {area.region}
                    </option>
                  ))}
                  <option value="Area Sekitar DIY (Magelang / Klaten / Solo)">
                    Area Sekitar DIY (Magelang / Klaten / Solo)
                  </option>
                </select>
              </div>

              {/* Jenis Kebutuhan */}
              <div>
                <label htmlFor="form-need" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Jenis Kebutuhan Layanan
                </label>
                <select
                  id="form-need"
                  value={values.needType}
                  onChange={(e) => setValues({ ...values, needType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#141814] border border-white/15 rounded-lg text-[#F6F3EC] focus:outline-none focus:border-[#B87D4B]"
                >
                  <option value="Desain Arsitektur & Pembangunan Rumah Baru">
                    Desain Arsitektur & Pembangunan Rumah Baru
                  </option>
                  <option value="Jasa Desain Arsitektur & Gambar Kerja Saja">
                    Jasa Desain Arsitektur & Gambar Kerja Saja
                  </option>
                  <option value="Jasa Desain & Penataan Interior">
                    Jasa Desain & Penataan Interior
                  </option>
                  <option value="Pembangunan Rumah Baru (Sudah Ada Gambar)">
                    Pembangunan Rumah Baru (Sudah Ada Gambar)
                  </option>
                  <option value="Renovasi Fasad / Ruang / Penambahan Lantai">
                    Renovasi Fasad / Ruang / Penambahan Lantai
                  </option>
                  <option value="Konsultasi Pemanfaatan Lahan & Lanskap">
                    Konsultasi Pemanfaatan Lahan & Lanskap
                  </option>
                </select>
              </div>
            </div>

            {/* Model Rumah Pilihan */}
            <div>
              <label htmlFor="form-model" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                Model Rumah Pilihan (Titik Awal Konsep)
              </label>
              <select
                id="form-model"
                value={values.preferredModel}
                onChange={(e) => setValues({ ...values, preferredModel: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#141814] border border-white/15 rounded-lg text-[#F6F3EC] focus:outline-none focus:border-[#B87D4B]"
              >
                {houseModels.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.category} · Ideal {m.idealLandSize})
                  </option>
                ))}
                <option value="Desain Kustom Sepenuhnya (Belum Memilih Model)">
                  Desain Kustom Sepenuhnya (Belum Memilih Model)
                </option>
              </select>
            </div>

            {/* Luas Lahan & Luas Bangunan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="form-land" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Luas Lahan (m²) <span className="text-[#C99A63]">*</span>
                </label>
                <input
                  id="form-land"
                  type="number"
                  min={20}
                  max={10000}
                  value={values.landArea}
                  onChange={(e) => {
                    setValues({ ...values, landArea: e.target.value });
                    if (errors.landArea) setErrors({ ...errors, landArea: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-[#141814] border rounded-lg text-[#F6F3EC] focus:outline-none ${
                    errors.landArea ? 'border-red-400' : 'border-white/15 focus:border-[#B87D4B]'
                  }`}
                />
                {errors.landArea && (
                  <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.landArea}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="form-building" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Perkiraan Luas Bangunan (m²) <span className="text-[#C99A63]">*</span>
                </label>
                <input
                  id="form-building"
                  type="number"
                  min={15}
                  max={5000}
                  value={values.buildingArea}
                  onChange={(e) => {
                    setValues({ ...values, buildingArea: e.target.value });
                    if (errors.buildingArea) setErrors({ ...errors, buildingArea: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm font-mono-tabular bg-[#141814] border rounded-lg text-[#F6F3EC] focus:outline-none ${
                    errors.buildingArea ? 'border-red-400' : 'border-white/15 focus:border-[#B87D4B]'
                  }`}
                />
                {errors.buildingArea && (
                  <p className="mt-1.5 text-xs text-red-300 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.buildingArea}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Kisaran Anggaran & Waktu Pengerjaan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="form-budget" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Kisaran Anggaran Proyek
                </label>
                <select
                  id="form-budget"
                  value={values.budgetRange}
                  onChange={(e) => setValues({ ...values, budgetRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#141814] border border-white/15 rounded-lg text-[#F6F3EC] focus:outline-none focus:border-[#B87D4B]"
                >
                  <option value="Di bawah Rp 150 Juta (Desain / Renovasi Ringan)">
                    Di bawah Rp 150 Juta (Desain / Renovasi Ringan)
                  </option>
                  <option value="Rp 150 Juta – Rp 400 Juta">Rp 150 Juta – Rp 400 Juta</option>
                  <option value="Rp 400 Juta – Rp 750 Juta">Rp 400 Juta – Rp 750 Juta</option>
                  <option value="Rp 750 Juta – Rp 1,5 Miliar">Rp 750 Juta – Rp 1,5 Miliar</option>
                  <option value="Di atas Rp 1,5 Miliar">Di atas Rp 1,5 Miliar</option>
                  <option value="Masih Perlu Diskusi Awal">Masih Perlu Diskusi Awal</option>
                </select>
              </div>

              <div>
                <label htmlFor="form-timeline" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                  Waktu Pengerjaan yang Direncanakan
                </label>
                <select
                  id="form-timeline"
                  value={values.timeline}
                  onChange={(e) => setValues({ ...values, timeline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#141814] border border-white/15 rounded-lg text-[#F6F3EC] focus:outline-none focus:border-[#B87D4B]"
                >
                  <option value="Segera (Bulan Ini)">Segera (Bulan Ini)</option>
                  <option value="Dalam 1 – 3 Bulan ke Depan">Dalam 1 – 3 Bulan ke Depan</option>
                  <option value="Dalam 3 – 6 Bulan ke Depan">Dalam 3 – 6 Bulan ke Depan</option>
                  <option value="Tahun Depan (Tahap Perencanaan Awal)">
                    Tahun Depan (Tahap Perencanaan Awal)
                  </option>
                </select>
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label htmlFor="form-notes" className="block text-xs font-semibold uppercase tracking-wider text-[#F6F3EC]/80 mb-2">
                Catatan Tambahan (Kebutuhan Kamar, Kontur Lahan, Gaya Ruang)
              </label>
              <textarea
                id="form-notes"
                rows={3}
                placeholder="Contoh: Lahan menghadap timur, ingin 3 kamar tidur dengan 1 kamar di lantai bawah untuk orang tua, serta area taman tengah yang sejuk..."
                value={values.notes}
                onChange={(e) => setValues({ ...values, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-[#141814] border border-white/15 rounded-lg text-[#F6F3EC] placeholder:text-[#F6F3EC]/35 focus:outline-none focus:border-[#B87D4B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#B87D4B] hover:bg-[#C99A63] text-[#161915] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Susun Ringkasan Konsultasi & Siapkan Pesan WhatsApp</span>
            </button>
          </form>

          {/* Right Column: Live Consultation Brief & WhatsApp Trigger */}
          <div className="lg:col-span-5 bg-[#1E241E] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-mono-tabular uppercase tracking-wider text-[#C99A63]">
                  Dokumen Brief Klien
                </div>
                <h3 className="text-xl font-display font-semibold text-[#F6F3EC] mt-0.5">
                  Ringkasan Konsultasi Proyek
                </h3>
              </div>
              <span className="text-xs font-mono-tabular text-[#F6F3EC]/60">
                {summaryReady ? 'Tervalidasi' : 'Pratinjau Lokal'}
              </span>
            </div>

            {summaryReady && (
              <div className="p-3.5 rounded-lg bg-[#283329] border border-[#B87D4B]/40 text-xs text-[#F6F3EC] leading-relaxed">
                <strong>Ringkasan siap digunakan:</strong> Formulir telah tervalidasi secara lokal di perangkat Anda (belum dikirim ke server otomatis). Silakan klik tombol <strong>Buka WhatsApp</strong> di bawah untuk mengirimkan pesan ke tim {business.name}.
              </div>
            )}

            {/* Formatted Message Preview Box */}
            <div className="bg-[#141814] border border-white/10 rounded-lg p-4 font-mono-tabular text-xs text-[#F6F3EC]/85 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
              {formattedWhatsAppText}
            </div>

            {/* Action Buttons: Open WhatsApp & Copy Brief */}
            <div className="space-y-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!validate()) {
                    e.preventDefault();
                  } else {
                    setSummaryReady(true);
                  }
                }}
                className="w-full py-3.5 px-5 bg-[#2E5A36] hover:bg-[#386B41] text-[#F6F3EC] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/15"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Buka WhatsApp dengan Pesan Terisi Otomatis</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-[#F6F3EC] text-xs font-medium rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#C99A63]" />
                    <span>Ringkasan Konsultasi Berhasil Disalin ke Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#C99A63]" />
                    <span>Salin Teks Ringkasan Konsultasi</span>
                  </>
                )}
              </button>
            </div>

            {/* Configuration Transparency Note */}
            <div className="pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-[#F6F3EC]/60 leading-relaxed">
              <Info className="w-4 h-4 text-[#C99A63] shrink-0 mt-0.5" />
              <div>
                Nomor tujuan saat ini menggunakan placeholder demo{' '}
                <code className="text-[#C99A63] font-mono-tabular">{business.whatsappNumber}</code>.
                Untuk menggantinya dengan nomor WhatsApp bisnis asli atau menghubungkan ke API backend/CRM, ubah properti{' '}
                <code className="text-[#F6F3EC]/80 font-mono-tabular">business.whatsappNumber</code> pada file{' '}
                <code className="text-[#F6F3EC]/80 font-mono-tabular">/src/config/siteConfig.ts</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
