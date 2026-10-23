import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Sliders,
  Check,
  ChevronDown,
  MapPin,
  Menu,
  X,
  Eye,
  Layers,
  Home,
  Wrench,
  Ruler,
  Sparkles,
} from 'lucide-react';
import { SITE_CONFIG, HouseModel, InteriorRoom, InteriorStyleConfig } from './config/siteConfig';
import { InteractiveHouse3D } from './components/InteractiveHouse3D';
import { InteractiveInterior3D } from './components/InteractiveInterior3D';
import { HouseCardCanvas, InteriorCardCanvas } from './components/ProceduralArchIllustration';
import { ProjectCalculator, CalculatorTransferPayload } from './components/ProjectCalculator';
import { ConsultationForm } from './components/ConsultationForm';
import { HouseDetailModal } from './components/HouseDetailModal';

export default function App() {
  const {
    business,
    hero,
    houseModels,
    interiorRooms,
    interiorStyles,
    services,
    serviceAreas,
    workflowSteps,
    faqs,
  } = SITE_CONFIG;

  // State for Hero 3D Model
  const [activeHeroModelId, setActiveHeroModelId] = useState<string>(houseModels[5].id); // Default Jawa Kontemporer / Joglo Modern
  const activeHeroModel =
    houseModels.find((m) => m.id === activeHeroModelId) || houseModels[0];

  // State for House Catalog Filter & Detail Modal
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [detailModalModel, setDetailModalModel] = useState<HouseModel | null>(null);

  // State for Interior Visualization Section (10 Rooms × 6 Styles)
  const [selectedRoomId, setSelectedRoomId] = useState<string>(interiorRooms[0].id);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(interiorStyles[1].id); // Default Japandi Natural

  const activeInteriorRoom: InteriorRoom =
    interiorRooms.find((r) => r.id === selectedRoomId) || interiorRooms[0];
  const activeInteriorStyle: InteriorStyleConfig =
    interiorStyles.find((s) => s.id === selectedStyleId) || interiorStyles[0];

  // State for Consultation Form Pre-selection
  const [consultModelName, setConsultModelName] = useState<string>(houseModels[0].name);
  const [consultServiceNeed, setConsultServiceNeed] = useState<string>(
    'Desain Arsitektur & Pembangunan Rumah Baru'
  );
  const [calculatorPayload, setCalculatorPayload] = useState<CalculatorTransferPayload | null>(
    null
  );

  // State for FAQ Accordion & Mobile Menu
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const categories = ['Semua', ...Array.from(new Set(houseModels.map((m) => m.category)))];
  const filteredModels =
    selectedCategory === 'Semua'
      ? houseModels
      : houseModels.filter((m) => m.category === selectedCategory);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectModelForConsultation = (model: HouseModel) => {
    setConsultModelName(model.name);
    setDetailModalModel(null);
    scrollToSection('konsultasi');
  };

  const handlePreviewModelInHero3D = (model: HouseModel) => {
    setActiveHeroModelId(model.id);
    scrollToSection('beranda');
  };

  const handleSelectServiceForConsultation = (serviceTitle: string) => {
    setConsultServiceNeed(serviceTitle);
    scrollToSection('konsultasi');
  };

  const handleCalculatorTransfer = (payload: CalculatorTransferPayload) => {
    setCalculatorPayload(payload);
    scrollToSection('konsultasi');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-[#181D18]">
      {/* Top Navigation Bar — Strictly 3 Zones per Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#161915]/95 text-[#F6F3EC] border-b border-white/10">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single Text Element Wordmark */}
          <a
            href="#beranda"
            className="text-xl font-display font-bold tracking-wider text-[#F6F3EC] whitespace-nowrap shrink-0"
          >
            {business.name}
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#F6F3EC]/80"
          >
            <a
              href="#katalog-rumah"
              className="hover:text-[#C99A63] transition-colors whitespace-nowrap shrink-0"
            >
              Model Rumah
            </a>
            <a
              href="#visualisasi-interior"
              className="hover:text-[#C99A63] transition-colors whitespace-nowrap shrink-0"
            >
              Interior 3D
            </a>
            <a
              href="#layanan"
              className="hover:text-[#C99A63] transition-colors whitespace-nowrap shrink-0"
            >
              Layanan
            </a>
            <a
              href="#simulasi-biaya"
              className="hover:text-[#C99A63] transition-colors whitespace-nowrap shrink-0"
            >
              Simulasi Biaya
            </a>
            <a
              href="#alur-kerja"
              className="hover:text-[#C99A63] transition-colors whitespace-nowrap shrink-0"
            >
              Alur & FAQ
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action (+ Mobile Menu Button on small screens) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('konsultasi')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#161915] bg-[#B87D4B] hover:bg-[#C99A63] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Konsultasikan Proyek
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="md:hidden p-2 text-[#F6F3EC]/85 hover:text-white rounded-lg border border-white/15 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#161915] border-t border-white/10 px-6 py-4 space-y-3 text-sm">
            <button
              type="button"
              onClick={() => scrollToSection('katalog-rumah')}
              className="block w-full text-left py-2 text-[#F6F3EC]/85 hover:text-[#C99A63]"
            >
              Model Rumah (8 Kategori)
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('visualisasi-interior')}
              className="block w-full text-left py-2 text-[#F6F3EC]/85 hover:text-[#C99A63]"
            >
              Visualisasi Interior & Studio 3D
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('layanan')}
              className="block w-full text-left py-2 text-[#F6F3EC]/85 hover:text-[#C99A63]"
            >
              Layanan Arsitektur & Bangun Rumah
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('simulasi-biaya')}
              className="block w-full text-left py-2 text-[#F6F3EC]/85 hover:text-[#C99A63]"
            >
              Kalkulator Simulasi Proyek
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('alur-kerja')}
              className="block w-full text-left py-2 text-[#F6F3EC]/85 hover:text-[#C99A63]"
            >
              Alur Kerja & Wilayah Layanan DIY
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* =================================================================
            1. HERO SECTION WITH INTERACTIVE 3D ARCHITECTURAL HOUSE
            ================================================================= */}
        <section
          id="beranda"
          className="relative bg-[#161915] text-[#F6F3EC] pt-10 pb-16 lg:py-20 border-b border-white/10"
        >
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
              {/* Left Column: Editorial Headline, Subheadline, CTAs & Active Model Info */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#C99A63]">
                    Arsitektur · Interior · Rancang Bangun · Yogyakarta
                  </div>

                  <h1
                    className="font-display font-semibold text-[#F6F3EC] tracking-tight leading-[1.08] text-balance"
                    style={{ fontSize: 'clamp(2.35rem, 4vw, 3.75rem)' }}
                  >
                    {hero.headline}
                  </h1>

                  <p className="text-base sm:text-lg text-[#F6F3EC]/80 leading-relaxed">
                    {hero.subheadline}
                  </p>

                  {/* 3 Functional CTA Buttons Required by Prompt */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => scrollToSection('katalog-rumah')}
                      className="py-3 px-5 bg-[#B87D4B] hover:bg-[#C99A63] text-[#161915] font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{hero.ctaExploreHouse}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToSection('visualisasi-interior')}
                      className="py-3 px-5 bg-[#283329] hover:bg-[#334134] text-[#F6F3EC] border border-white/15 font-medium text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {hero.ctaExploreInterior}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToSection('konsultasi')}
                      className="py-3 px-5 bg-transparent hover:bg-white/5 text-[#F6F3EC]/90 border border-white/20 font-medium text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {hero.ctaConsult}
                    </button>
                  </div>
                </div>

                {/* Active 3D Architectural Concept Brief Card */}
                <div className="p-5 rounded-xl bg-[#1E241E] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono-tabular text-[#C99A63]">
                    <span>INSPEKSI 3D INTERAKTIF AKTIF</span>
                    <span>{activeHeroModel.category.toUpperCase()}</span>
                  </div>
                  <div className="text-lg font-display font-semibold text-[#F6F3EC]">
                    {activeHeroModel.name}
                  </div>
                  <p className="text-xs text-[#F6F3EC]/75 leading-relaxed">
                    {activeHeroModel.shortDesc}
                  </p>
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#F6F3EC]/70 font-mono-tabular">
                    <span>
                      Lahan {activeHeroModel.idealLandSize} · Bangunan {activeHeroModel.buildingArea}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailModalModel(activeHeroModel)}
                      className="text-[#C99A63] hover:underline font-sans font-medium cursor-pointer"
                    >
                      Spesifikasi Lengkap →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-Time WebGL 3D House Viewport */}
              <div className="lg:col-span-7 flex flex-col">
                <InteractiveHouse3D
                  selectedModel={activeHeroModel}
                  onSelectModel={(id) => setActiveHeroModelId(id)}
                  allModels={houseModels}
                />
              </div>
            </div>

            {/* Full-Width Key Architectural Principles Strip Below Hero Split */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-xs font-mono-tabular text-[#C99A63]">01 · KONTEKS IKLIM TROPIS</div>
                <div className="text-sm font-semibold text-[#F6F3EC] mt-1">
                  Penghawaan Silang & Tritisan Teduh
                </div>
                <p className="text-xs text-[#F6F3EC]/65 mt-1 leading-relaxed">
                  Dirancang merespons curah hujan dan radiasi matahari Yogyakarta agar ruang dalam sejuk alami.
                </p>
              </div>
              <div>
                <div className="text-xs font-mono-tabular text-[#C99A63]">02 · VISUALISASI SPASIAL 3D</div>
                <div className="text-sm font-semibold text-[#F6F3EC] mt-1">
                  Eksplorasi Massa & Struktur Nyata
                </div>
                <p className="text-xs text-[#F6F3EC]/65 mt-1 leading-relaxed">
                  Tinjau proporsi atap, fasad, teras, dan zonasi lantai sebelum memasuki tahap gambar kerja.
                </p>
              </div>
              <div>
                <div className="text-xs font-mono-tabular text-[#C99A63]">03 · MATERIALITAS LOKAL</div>
                <div className="text-sm font-semibold text-[#F6F3EC] mt-1">
                  Kayu Jati, Batu Andesit & Teraso
                </div>
                <p className="text-xs text-[#F6F3EC]/65 mt-1 leading-relaxed">
                  Memadukan kekayaan material alam Yogyakarta dengan ketegasan garis arsitektur modern.
                </p>
              </div>
              <div>
                <div className="text-xs font-mono-tabular text-[#C99A63]">04 · PERENCANAAN TERUKUR</div>
                <div className="text-sm font-semibold text-[#F6F3EC] mt-1">
                  Transparansi Lingkup & Anggaran
                </div>
                <p className="text-xs text-[#F6F3EC]/65 mt-1 leading-relaxed">
                  Tahapan kerja yang terstruktur mulai dari konsep denah, simulasi biaya, hingga konstruksi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            2. KATALOG MODEL RUMAH (8 KATEGORI ARSITEKTUR)
            ================================================================= */}
        <section id="katalog-rumah" className="py-20 lg:py-28 bg-[#F6F3EC]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#8C582B] mb-2">
                  01 · Eksplorasi Tipologi Hunian
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold text-[#181D18] leading-tight text-balance">
                  Katalog 8 Karakter Arsitektur Rumah Yogyakarta
                </h2>
                <p className="mt-4 text-base text-[#181D18]/75 leading-relaxed">
                  Pilih konsep dasar rumah yang paling mewakili gaya hidup keluarga Anda. Setiap model dapat diinspeksi dalam tampilan 3D interaktif dan disesuaikan sepenuhnya dengan dimensi lahan Anda.
                </p>
              </div>

              {/* Interactive Category Filter Bar (Functional Buttons) */}
              <div
                role="tablist"
                aria-label="Filter kategori model rumah"
                className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E8E3D8] rounded-lg self-start"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#181D18] text-[#F6F3EC] shadow-sm'
                        : 'text-[#181D18]/75 hover:text-[#181D18]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 8 House Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredModels.map((model) => {
                const isSelectedInHero = activeHeroModel.id === model.id;
                return (
                  <article
                    key={model.id}
                    className={`group bg-[#FCFBF8] rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                      isSelectedInHero
                        ? 'border-[#B87D4B] ring-1 ring-[#B87D4B]'
                        : 'border-[#181D18]/12 hover:border-[#181D18]/35'
                    }`}
                  >
                    <div>
                      {/* Procedural Architectural Render Thumbnail */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#161B17]">
                        <HouseCardCanvas
                          model={model}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Card Content — Zero-Pill Unboxed Metadata Discipline */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-[#8C582B] font-mono-tabular">
                          <span>{model.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>Lahan {model.idealLandSize}</span>
                        </div>

                        <h3 className="text-xl font-display font-semibold text-[#181D18] mt-1.5">
                          {model.name}
                        </h3>

                        <p className="text-xs text-[#181D18]/75 mt-2 leading-relaxed line-clamp-3">
                          {model.shortDesc}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[#181D18]/10 text-xs text-[#181D18]/70 font-mono-tabular flex items-center justify-between">
                          <span>{model.bedrooms}</span>
                          <span aria-hidden="true">·</span>
                          <span>{model.bathrooms}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Interactive Actions */}
                    <div className="px-5 pb-5 pt-1 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailModalModel(model)}
                          className="py-2 px-3 bg-[#181D18] hover:bg-[#283329] text-[#F6F3EC] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C99A63]" />
                          <span>Lihat Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePreviewModelInHero3D(model)}
                          className="py-2 px-3 bg-[#EFECE4] hover:bg-[#E2DDD0] text-[#181D18] text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#8C582B]" />
                          <span>Uji di 3D Hero</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectModelForConsultation(model)}
                        className="w-full py-2 px-3 text-xs font-medium text-[#8C582B] hover:text-[#181D18] hover:bg-[#EFECE4]/60 rounded-lg transition-colors text-center cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Jadikan Pilihan di Formulir Konsultasi →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================================
            3. VISUALISASI INTERIOR RUMAH (10 RUANG & 6 GAYA + STUDIO 3D)
            ================================================================= */}
        <section
          id="visualisasi-interior"
          className="py-20 lg:py-28 bg-[#1E241E] text-[#F6F3EC] border-t border-white/10"
        >
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#C99A63] mb-2">
                02 · Eksplorasi Ruang Dalam & Materialitas
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold text-[#F6F3EC] leading-tight text-balance">
                Studio Visualisasi Interior 3D & Kurasi Palet Material
              </h2>
              <p className="mt-4 text-base text-[#F6F3EC]/75 leading-relaxed">
                Padukan 10 kategori ruangan hunian dengan 6 gaya desain interior. Perubahan gaya akan langsung memperbarui warna dinding, lantai, serat kayu, tekstil furnitur, dan pencahayaan pada simulasi ruang 3D di bawah ini.
              </p>
            </div>

            {/* Interactive Style Switcher Bar (6 Interior Styles) */}
            <div className="mb-8 bg-[#161915] border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-xs font-mono-tabular uppercase tracking-wider text-[#C99A63]">
                  <Sliders className="w-4 h-4" />
                  <span>Pilih Gaya Interior & Palet Warna (6 Karakter):</span>
                </div>
                <span className="text-xs text-[#F6F3EC]/65">
                  Gaya Aktif: <strong className="text-[#F6F3EC]">{activeInteriorStyle.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {interiorStyles.map((style) => {
                  const isActive = style.id === activeInteriorStyle.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#283329] border-[#B87D4B] text-[#F6F3EC]'
                          : 'bg-[#1E241E] border-white/10 text-[#F6F3EC]/75 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-white/20"
                          style={{ backgroundColor: style.wallHex }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-white/20"
                          style={{ backgroundColor: style.woodHex }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-white/20"
                          style={{ backgroundColor: style.fabricHex }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-sm border border-white/20"
                          style={{ backgroundColor: style.accentHex }}
                        />
                      </div>
                      <div className="text-xs font-semibold whitespace-nowrap truncate">
                        {style.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive 3D Room Configurator Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
              {/* Left 7 Cols: Live 3D Interior Room Diorama */}
              <div className="lg:col-span-7">
                <InteractiveInterior3D
                  selectedRoom={activeInteriorRoom}
                  selectedStyle={activeInteriorStyle}
                />
              </div>

              {/* Right 5 Cols: Active Room & Style Details */}
              <div className="lg:col-span-5 bg-[#161915] border border-white/10 rounded-xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#C99A63]">
                    <span>{activeInteriorRoom.zone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeInteriorRoom.dimensions}</span>
                  </div>

                  <h3 className="text-2xl font-display font-semibold text-[#F6F3EC]">
                    {activeInteriorRoom.name} — Gaya {activeInteriorStyle.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#F6F3EC]/80 leading-relaxed">
                    {activeInteriorRoom.description}
                  </p>

                  <div className="p-3.5 rounded-lg bg-[#1E241E] border border-white/10 space-y-1.5">
                    <div className="text-xs font-semibold text-[#C99A63]">
                      Karakter Gaya {activeInteriorStyle.name}:
                    </div>
                    <p className="text-xs text-[#F6F3EC]/75 leading-relaxed">
                      {activeInteriorStyle.description}
                    </p>
                    <div className="text-[11px] font-mono-tabular text-[#F6F3EC]/60 pt-1">
                      Material: {activeInteriorStyle.materialSummary.join(' · ')}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-mono-tabular uppercase tracking-wider text-[#C99A63] mb-2">
                      Komponen Furnitur & Pencahayaan Ruang:
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#F6F3EC]/85">
                      {activeInteriorRoom.focalElements.map((el, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C99A63] shrink-0" />
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 text-xs text-[#F6F3EC]/70">
                      <strong className="text-[#F6F3EC]">Strategi Pencahayaan:</strong>{' '}
                      {activeInteriorRoom.lightingStrategy}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectServiceForConsultation(
                      `Jasa Desain & Penataan Interior (${activeInteriorRoom.name} - ${activeInteriorStyle.name})`
                    )
                  }
                  className="w-full py-3 px-4 bg-[#B87D4B] hover:bg-[#C99A63] text-[#161915] font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Konsultasikan Interior {activeInteriorRoom.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 10 Interior Room Categories Interactive Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-[#F6F3EC]">
                  Pilih 10 Kategori Ruang Interior (Klik untuk Memuat ke Simulasi 3D):
                </h3>
                <span className="text-xs font-mono-tabular text-[#C99A63]">
                  10 Kategori Ruang Tersedia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {interiorRooms.map((room) => {
                  const isSelected = room.id === activeInteriorRoom.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`group text-left rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#283329] border-[#B87D4B] ring-1 ring-[#B87D4B]'
                          : 'bg-[#161915] border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className="h-28 w-full overflow-hidden">
                          <InteriorCardCanvas
                            room={room}
                            styleConfig={activeInteriorStyle}
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3.5">
                          <div className="text-[11px] font-mono-tabular text-[#C99A63]">
                            {room.zone}
                          </div>
                          <div className="text-sm font-semibold text-[#F6F3EC] mt-0.5">
                            {room.name}
                          </div>
                          <p className="text-[11px] text-[#F6F3EC]/65 mt-1 line-clamp-2 leading-relaxed">
                            {room.description}
                          </p>
                        </div>
                      </div>
                      <div className="px-3.5 pb-3 text-[11px] font-mono-tabular text-[#C99A63] flex items-center justify-between">
                        <span>{isSelected ? 'Sedang Ditampilkan' : 'Tampilkan di 3D'}</span>
                        <span>→</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            4. LAYANAN ARSITEKTUR DAN JASA BANGUNAN (KATEGORI A - E)
            ================================================================= */}
        <section id="layanan" className="py-20 lg:py-28 bg-[#F6F3EC]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#8C582B] mb-2">
                03 · Cakupan Layanan Terpadu
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-semibold text-[#181D18] leading-tight text-balance">
                Layanan Arsitektur, Interior, Pembangunan & Renovasi Rumah
              </h2>
              <p className="mt-4 text-base text-[#181D18]/75 leading-relaxed">
                Pilih cakupan layanan yang sesuai dengan tahapan proyek Anda saat ini—mulai dari penyusunan konsep arsitektur dan gambar kerja hingga pelaksanaan konstruksi maupun renovasi hunian di Yogyakarta.
              </p>
            </div>

            {/* Asymmetric Bento Grid of 5 Service Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
              {services.map((srv, idx) => {
                // First two marquee services span 3 columns on desktop; next three span 2 columns
                const spanClass = idx < 2 ? 'lg:col-span-3' : 'lg:col-span-2';
                const IconComponent =
                  idx === 0
                    ? Compass
                    : idx === 1
                    ? Layers
                    : idx === 2
                    ? Home
                    : idx === 3
                    ? Wrench
                    : Sparkles;

                return (
                  <div
                    key={srv.id}
                    className={`${spanClass} bg-[#FCFBF8] border border-[#181D18]/12 rounded-xl p-6 sm:p-8 flex flex-col justify-between hover:border-[#181D18]/35 transition-colors`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono-tabular font-semibold text-[#8C582B]">
                          {srv.code}. LAYANAN PROFESIONAL
                        </span>
                        <IconComponent className="w-5 h-5 text-[#8C582B]" />
                      </div>

                      <h3 className="text-2xl font-display font-semibold text-[#181D18]">
                        {srv.title}
                      </h3>
                      <p className="text-xs font-medium text-[#8C582B] mt-1">{srv.subtitle}</p>
                      <p className="text-sm text-[#181D18]/75 mt-3 leading-relaxed">
                        {srv.description}
                      </p>

                      <ul className="mt-5 pt-5 border-t border-[#181D18]/10 space-y-2.5 text-xs sm:text-sm text-[#181D18]/85">
                        {srv.deliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-[#8C582B] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#181D18]/10">
                      <button
                        type="button"
                        onClick={() => handleSelectServiceForConsultation(srv.title)}
                        className="w-full py-3 px-4 bg-[#181D18] hover:bg-[#283329] text-[#F6F3EC] text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{srv.ctaText}</span>
                        <ArrowRight className="w-4 h-4 text-[#C99A63]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Transparent Demo Integrity Notice per Section 6 Instructions */}
            <div className="mt-8 p-4 rounded-lg bg-[#E8E3D8]/70 border border-[#181D18]/10 text-xs text-[#181D18]/75 flex items-start gap-3">
              <Ruler className="w-4 h-4 text-[#8C582B] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Catatan Transparansi Konten Demo:</strong> Deskripsi cakupan layanan di atas disusun sebagai kerangka informasi standar untuk platform studio arsitektur & rancang bangun. Sesuaikan daftar legalitas, nomor sertifikasi keahlian (STRA/SKA), portofolio terbangun, dan ketentuan garansi pemeliharaan sesuai data aktual perusahaan Anda pada file konfigurasi.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================
            5. ESTIMASI DAN KALKULATOR PROYEK INTERAKTIF
            ================================================================= */}
        <ProjectCalculator onTransferToConsultation={handleCalculatorTransfer} />

        {/* =================================================================
            6. ALUR KERJA, WILAYAH LAYANAN YOGYAKARTA & FAQ
            ================================================================= */}
        <section id="alur-kerja" className="py-20 lg:py-28 bg-[#F6F3EC] border-t border-[#181D18]/10">
          <div className="max-w-[1280px] mx-auto px-6 space-y-20">
            {/* Sub-section A: 4-Step Architectural Workflow */}
            <div>
              <div className="max-w-2xl mb-12">
                <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#8C582B] mb-2">
                  05 · Metodologi & Tahapan Proyek
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#181D18] leading-tight text-balance">
                  Alur Kerja Terstruktur dari Konsultasi hingga Pelaksanaan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {workflowSteps.map((wf) => (
                  <div
                    key={wf.step}
                    className="bg-[#FCFBF8] border border-[#181D18]/12 rounded-xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono-tabular text-[#8C582B] mb-3">
                        <span className="text-lg font-bold">{wf.step}</span>
                        <span>{wf.duration}</span>
                      </div>
                      <h3 className="text-lg font-display font-semibold text-[#181D18]">
                        {wf.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#181D18]/75 mt-2.5 leading-relaxed">
                        {wf.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section B: Configurable Service Areas in DIY */}
            <div className="bg-[#1E261F] text-[#F6F3EC] rounded-xl p-6 sm:p-10 border border-[#2C362D]">
              <div className="max-w-2xl mb-8">
                <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#C99A63] mb-2">
                  Cakupan Wilayah Layanan (Dapat Dikonfigurasi)
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-semibold text-[#F6F3EC]">
                  Adaptasi Desain untuk Karakter Geografis Yogyakarta
                </h3>
                <p className="text-xs sm:text-sm text-[#F6F3EC]/75 mt-2 leading-relaxed">
                  Setiap kabupaten dan kota di Daerah Istimewa Yogyakarta memiliki karakter kontur tanah, suhu mikro, serta konteks lingkungan yang unik.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {serviceAreas.map((area) => (
                  <div
                    key={area.region}
                    className="bg-[#161915]/90 border border-white/10 rounded-lg p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F6F3EC]">
                        <MapPin className="w-4 h-4 text-[#C99A63] shrink-0" />
                        <span>{area.region}</span>
                      </div>
                      <p className="text-xs text-[#F6F3EC]/75 mt-2 leading-relaxed">
                        {area.character}
                      </p>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-white/10 text-[11px] font-mono-tabular text-[#C99A63]">
                      {area.elevationNote}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section C: Frequently Asked Questions (FAQ) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <div className="text-xs font-mono-tabular uppercase tracking-widest text-[#8C582B] mb-2">
                  Pertanyaan Umum (FAQ)
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-semibold text-[#181D18] leading-tight">
                  Hal yang Sering Ditanyakan Sebelum Memulai Proyek
                </h3>
                <p className="mt-3 text-sm text-[#181D18]/75 leading-relaxed">
                  Informasi mengenai fleksibilitas kustomisasi desain, tahapan pemesanan jasa arsitektur/interior, hingga penggunaan simulasi anggaran.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#FCFBF8] border border-[#181D18]/12 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-[#181D18] hover:bg-[#EFECE4]/50 transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#8C582B] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#181D18]/75 leading-relaxed border-t border-[#181D18]/10">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            7. FORMULIR KONSULTASI DAN INTEGRASI WHATSAPP
            ================================================================= */}
        <ConsultationForm
          preselectedModelName={consultModelName}
          preselectedServiceNeed={consultServiceNeed}
          calculatorData={calculatorPayload}
        />
      </main>

      {/* =================================================================
          8. QUIET ARCHITECTURAL STUDIO FOOTER
          ================================================================= */}
      <footer className="bg-[#111411] text-[#F6F3EC]/75 border-t border-white/10 py-14 text-xs">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-white/10">
            {/* Col 1: Brand Identity */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xl font-display font-bold tracking-wider text-[#F6F3EC]">
                {business.name}
              </div>
              <p className="text-[#F6F3EC]/70 leading-relaxed">{business.tagline}</p>
              <p className="text-[11px] text-[#F6F3EC]/50 leading-relaxed">{business.legalNote}</p>
            </div>

            {/* Col 2: Navigation */}
            <div className="lg:col-span-3 space-y-2.5">
              <div className="font-mono-tabular uppercase tracking-wider text-[#C99A63] mb-2">
                Navigasi Halaman
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="#beranda" className="hover:text-white transition-colors">
                    Rumah 3D Interaktif (Hero)
                  </a>
                </li>
                <li>
                  <a href="#katalog-rumah" className="hover:text-white transition-colors">
                    Katalog 8 Model Rumah
                  </a>
                </li>
                <li>
                  <a href="#visualisasi-interior" className="hover:text-white transition-colors">
                    Studio Visualisasi Interior 3D
                  </a>
                </li>
                <li>
                  <a href="#layanan" className="hover:text-white transition-colors">
                    Layanan Arsitektur & Konstruksi
                  </a>
                </li>
                <li>
                  <a href="#simulasi-biaya" className="hover:text-white transition-colors">
                    Kalkulator Simulasi Proyek
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Cakupan Wilayah */}
            <div className="lg:col-span-2 space-y-2.5">
              <div className="font-mono-tabular uppercase tracking-wider text-[#C99A63] mb-2">
                Wilayah Layanan
              </div>
              <ul className="space-y-1.5 text-[#F6F3EC]/70">
                {serviceAreas.map((a) => (
                  <li key={a.region}>{a.region}</li>
                ))}
              </ul>
            </div>

            {/* Col 4: Kontak Placeholder */}
            <div className="lg:col-span-3 space-y-2.5">
              <div className="font-mono-tabular uppercase tracking-wider text-[#C99A63] mb-2">
                Kontak & Studio (Placeholder)
              </div>
              <p className="leading-relaxed">{business.studioLocation}</p>
              <p className="font-mono-tabular text-[#F6F3EC]">WhatsApp: {business.whatsappDisplay}</p>
              <p className="font-mono-tabular">Email: {business.email}</p>
              <p className="text-[#F6F3EC]/60">{business.consultationHours}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F6F3EC]/50">
            <div>
              © {new Date().getFullYear()} {business.name}. Dirancang untuk eksplorasi arsitektur & interior interaktif 3D.
            </div>
            <div>
              Konfigurasi Terpusat: <code className="text-[#C99A63]">/src/config/siteConfig.ts</code>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive 3D House Concept Detail Modal */}
      <HouseDetailModal
        model={detailModalModel}
        onClose={() => setDetailModalModel(null)}
        onSelectForConsultation={handleSelectModelForConsultation}
        onLoadInMain3D={handlePreviewModelInHero3D}
      />
    </div>
  );
}
