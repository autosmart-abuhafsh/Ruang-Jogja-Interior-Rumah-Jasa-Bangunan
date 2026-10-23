export type RoofArchetype =
  | 'flat-cantilever'
  | 'japandi-gable'
  | 'tropical-hip'
  | 'industrial-sawtooth'
  | 'mediterranean-arch'
  | 'joglo-kontemporer'
  | 'two-story-modern'
  | 'compact-mono';

export interface HouseModel {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  detailedDesc: string;
  idealLandSize: string;
  buildingArea: string;
  floors: number;
  bedrooms: string;
  bathrooms: string;
  keyMaterials: string[];
  architecturalHighlights: string[];
  // 3D Procedural Configuration
  config3D: {
    roofType: RoofArchetype;
    stories: 1 | 2;
    wallColor: string;
    secondaryWallColor: string;
    roofColor: string;
    woodColor: string;
    stoneColor: string;
    metalColor: string;
    hasPool: boolean;
    hasCourtyard: boolean;
    hasPendopo: boolean;
    hasArches: boolean;
    louverCount: number;
    footprintScaleX: number;
    footprintScaleZ: number;
  };
}

export type InteriorRoomId =
  | 'ruang-keluarga'
  | 'ruang-tamu'
  | 'kamar-tidur-utama'
  | 'kamar-anak'
  | 'dapur-modern'
  | 'ruang-makan'
  | 'kamar-mandi'
  | 'home-office'
  | 'area-santai-taman'
  | 'interior-compact';

export type InteriorStyleId =
  | 'minimalis-modern'
  | 'japandi-natural'
  | 'modern-luxury'
  | 'scandinavian'
  | 'industrial'
  | 'tropical-contemporary';

export interface InteriorRoom {
  id: InteriorRoomId;
  name: string;
  zone: string;
  dimensions: string;
  description: string;
  focalElements: string[];
  lightingStrategy: string;
}

export interface InteriorStyleConfig {
  id: InteriorStyleId;
  name: string;
  tagline: string;
  description: string;
  wallHex: string;
  floorHex: string;
  woodHex: string;
  fabricHex: string;
  accentHex: string;
  metalHex: string;
  rugHex: string;
  lightWarmthHex: string;
  materialSummary: string[];
}

export interface ServiceCategory {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  ctaText: string;
  defaultWorkType: 'desain' | 'interior' | 'bangun-baru' | 'renovasi';
}

export const SITE_CONFIG = {
  business: {
    name: 'RUANG JOGJA',
    legalNote:
      'Konten pada halaman ini merupakan demonstrasi fungsional & template studio arsitektur yang dapat disesuaikan sepenuhnya dengan profil resmi perusahaan Anda.',
    tagline: 'Studio Arsitektur, Interior & Rancang Bangun Hunian Yogyakarta',
    whatsappNumber: '6281234567890', // Ganti dengan nomor WhatsApp bisnis aktif (format kode negara 62 tanpa +)
    whatsappDisplay: '+62 812-3456-7890 (Placeholder Demo)',
    email: 'halo@ruangjogja-demo.id',
    studioLocation: 'Jl. Kaliurang KM 7.5, Sleman, Daerah Istimewa Yogyakarta (Alamat Contoh)',
    consultationHours: 'Senin – Sabtu · 09.00 – 17.00 WIB (Berdasarkan Perjanjian)',
  },

  theme: {
    colors: {
      oliveDark: '#1E261F',
      charcoal: '#161915',
      warmCream: '#F6F3EC',
      warmWhite: '#FCFBF8',
      softCopper: '#B87D4B',
      mutedGold: '#C99A63',
    },
  },

  hero: {
    headline: 'Ruang Impian Anda, Dirancang untuk Kehidupan.',
    subheadline:
      'Jelajahi inspirasi desain rumah, interior, arsitektur, dan layanan pembangunan rumah di Yogyakarta. Dari konsep pertama hingga ruang yang siap dihuni.',
    ctaExploreHouse: 'Jelajahi Model Rumah',
    ctaExploreInterior: 'Lihat Desain Interior',
    ctaConsult: 'Konsultasikan Proyek',
  },

  serviceAreas: [
    {
      region: 'Kota Yogyakarta',
      character: 'Optimalisasi lahan urban terbatas, renovasi hunian keluarga, dan adaptasi fasad kontekstual.',
      elevationNote: 'Dataran perkotaan · Fokus sirkulasi udara silang & privasi',
    },
    {
      region: 'Sleman',
      character: 'Hunian tropis modern, villa lereng utara, dan rumah tumbuh keluarga dengan bukaan taman luas.',
      elevationNote: 'Dataran tinggi & sejuk · Fokus pencahayaan alami & lanskap',
    },
    {
      region: 'Bantul',
      character: 'Perpaduan arsitektur Jawa kontemporer, pendopo modern, dan penggunaan material kriya natural.',
      elevationNote: 'Kontur datar hingga perbukitan selatan · Fokus teras teduh',
    },
    {
      region: 'Kulon Progo',
      character: 'Pengembangan hunian baru kawasan berkembang, rumah kaca tropis, dan konsep lanskap produktif.',
      elevationNote: 'Perbukitan Menoreh & dataran barat · Fokus struktur adaptif',
    },
    {
      region: 'Gunungkidul',
      character: 'Desain rumah peristirahatan, struktur adaptif kontur batuan kapur, dan konservasi air hujan.',
      elevationNote: 'Kontur karst & pesisir · Fokus ketahanan cuaca & keteduhan',
    },
  ],

  houseModels: [
    {
      id: 'minimalis-modern',
      name: 'Rumah Minimalis Modern',
      category: 'Minimalis',
      shortDesc: 'Bentuk geometris bersih, fasad minimalis, dan jendela lebar untuk pencahayaan alami.',
      detailedDesc:
        'Mengutamakan kejujuran garis horizontal dan vertikal dengan bidang dinding plester halus, kanopi beton kantilever tipis, serta bukaan kaca penuh yang menyatukan ruang keluarga dengan taman dalam.',
      idealLandSize: '120 – 180 m²',
      buildingArea: '95 – 130 m²',
      floors: 1,
      bedrooms: '3 Kamar Tidur',
      bathrooms: '2 Kamar Mandi',
      keyMaterials: ['Beton Aci Halus', 'Kaca Low-E Bukaan Lebar', 'Kusen Aluminium Anodized Hitam', 'Batu Andesit Bakar'],
      architecturalHighlights: [
        'Tritisan beton kantilever untuk menahan tampias hujan tropis',
        'Layout open-plan tanpa sekat masif antara ruang keluarga dan ruang makan',
        'Jendela sudut (corner window) menghadap taman kering samping',
      ],
      config3D: {
        roofType: 'flat-cantilever',
        stories: 1,
        wallColor: '#EFECE6',
        secondaryWallColor: '#2B302C',
        roofColor: '#252926',
        woodColor: '#9C6B3F',
        stoneColor: '#4A4E4B',
        metalColor: '#1E201E',
        hasPool: true,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: false,
        louverCount: 6,
        footprintScaleX: 1.05,
        footprintScaleZ: 0.95,
      },
    },
    {
      id: 'japandi',
      name: 'Rumah Japandi',
      category: 'Natural',
      shortDesc: 'Perpaduan gaya Jepang dan Skandinavia, material natural, warna netral, dan tata ruang sederhana.',
      detailedDesc:
        'Menghadirkan ketenangan lewat proporsi atap pelana rendah, kisi-kisi kayu jati hangat (koushi), teras engawa yang menghubungkan ruang dalam dengan taman zen tropis, serta palet warna krem tanah yang menenangkan.',
      idealLandSize: '105 – 150 m²',
      buildingArea: '85 – 115 m²',
      floors: 1,
      bedrooms: '3 Kamar Tidur',
      bathrooms: '2 Kamar Mandi',
      keyMaterials: ['Kayu Jati Natural', 'Plester Krem Hangat', 'Batu Koral Putih & Step Granit', 'Atap Bitumen Gelap'],
      architecturalHighlights: [
        'Teras transisi (engawa) selebar 1.8 meter sebagai peredam panas matahari',
        'Secondary skin kisi-kisi kayu untuk privasi dari jalan depan',
        'Taman dalam (inner courtyard) sebagai pusat orientasi seluruh ruangan',
      ],
      config3D: {
        roofType: 'japandi-gable',
        stories: 1,
        wallColor: '#F3EDE2',
        secondaryWallColor: '#D8CFC0',
        roofColor: '#363835',
        woodColor: '#B58352',
        stoneColor: '#7A756C',
        metalColor: '#2F312E',
        hasPool: false,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: false,
        louverCount: 10,
        footprintScaleX: 1.0,
        footprintScaleZ: 0.95,
      },
    },
    {
      id: 'tropis-modern',
      name: 'Rumah Tropis Modern',
      category: 'Tropis',
      shortDesc: 'Atap yang sesuai iklim tropis, ventilasi silang, pencahayaan alami, teras teduh, dan taman.',
      detailedDesc:
        'Dirancang khusus merespons curah hujan dan kelembapan Yogyakarta melalui atap perisai beroverstek lebar, ventilasi atas (clerestory), kolam pantul penurun suhu mikro, serta integrasi vegetasi tropis di sekeliling bangunan.',
      idealLandSize: '160 – 250 m²',
      buildingArea: '135 – 180 m²',
      floors: 1,
      bedrooms: '3+1 Kamar Tidur',
      bathrooms: '3 Kamar Mandi',
      keyMaterials: ['Kayu Ulin / Jati', 'Batu Alam Paras Jogja & Andesit', 'Genteng Keramik Matte', 'Kaca Geser Lipat'],
      architecturalHighlights: [
        'Overstek atap lebar (1.5m) menjaga dinding tetap dingin sepanjang siang',
        'Sistem ventilasi silang (cross ventilation) di setiap kamar tidur',
        'Teras belakang menyatu dengan kolam refleksi dan dek kayu',
      ],
      config3D: {
        roofType: 'tropical-hip',
        stories: 1,
        wallColor: '#EAE4D7',
        secondaryWallColor: '#3A443B',
        roofColor: '#4A3B31',
        woodColor: '#8F5932',
        stoneColor: '#565B54',
        metalColor: '#232724',
        hasPool: true,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: false,
        louverCount: 8,
        footprintScaleX: 1.12,
        footprintScaleZ: 1.05,
      },
    },
    {
      id: 'industrial',
      name: 'Rumah Industrial',
      category: 'Modern',
      shortDesc: 'Perpaduan beton, logam, bata ekspos, dan karakter material yang tegas namun tetap nyaman.',
      detailedDesc:
        'Menampilkan kejujuran struktur baja WF hitam, bidang bata merah ekspos khas pengrajin lokal Yogyakarta, langit-langit tinggi (high ceiling) untuk pelepasan udara panas, serta jendela berbingkai kisi besi.',
      idealLandSize: '120 – 180 m²',
      buildingArea: '110 – 150 m²',
      floors: 2,
      bedrooms: '3 Kamar Tidur',
      bathrooms: '2 Kamar Mandi',
      keyMaterials: ['Bata Merah Ekspos Coating Matte', 'Baja WF & Hollow Hitam', 'Beton Ekspos', 'Lantai Semen Poles'],
      architecturalHighlights: [
        'Void ruang keluarga ganda (double-height ceiling) setinggi 5.8 meter',
        'Fasad bata ekspos dengan susunan berongga (breathing wall) untuk sirkulasi angin',
        'Minim perawatan cat ulang berkat penggunaan permukaan material un-finished',
      ],
      config3D: {
        roofType: 'industrial-sawtooth',
        stories: 2,
        wallColor: '#787A76',
        secondaryWallColor: '#9E543B',
        roofColor: '#222523',
        woodColor: '#6E472B',
        stoneColor: '#3D403E',
        metalColor: '#161817',
        hasPool: false,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: false,
        louverCount: 5,
        footprintScaleX: 0.95,
        footprintScaleZ: 0.95,
      },
    },
    {
      id: 'mediterania-modern',
      name: 'Rumah Mediterania Modern',
      category: 'Klasik Kontemporer',
      shortDesc: 'Bentuk lengkung elegan, tekstur plester natural, dan palet warna hangat bernuansa resor.',
      detailedDesc:
        'Mengadaptasi estetika pesisir selatan Eropa ke iklim tropis Yogyakarta lewat bukaan kolonnade melengkung (archway), tekstur dinding stucco berkapur hangat, atap terakota lembut, serta halaman tengah berair mancur.',
      idealLandSize: '150 – 220 m²',
      buildingArea: '125 – 170 m²',
      floors: 1,
      bedrooms: '3 Kamar Tidur',
      bathrooms: '3 Kamar Mandi',
      keyMaterials: ['Stucco Tekstur Krem Gading', 'Genteng Terakota Natural', 'Batu Palimanan / Paras Putih', 'Kayu Oak Hangat'],
      architecturalHighlights: [
        'Koridor serambi lengkung yang meneduhkan bukaan jendela utama',
        'Patio teras terbuka dengan kolam santai dan tanaman zaitun/palem tropis',
        'Dinding tebal berinsulasi termal baik untuk menjaga kesejukan interior',
      ],
      config3D: {
        roofType: 'mediterranean-arch',
        stories: 1,
        wallColor: '#F5EFE4',
        secondaryWallColor: '#E3D5C1',
        roofColor: '#A65B3E',
        woodColor: '#9E6F44',
        stoneColor: '#C9BFA9',
        metalColor: '#5C4938',
        hasPool: true,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: true,
        louverCount: 4,
        footprintScaleX: 1.08,
        footprintScaleZ: 1.0,
      },
    },
    {
      id: 'jawa-kontemporer',
      name: 'Rumah Tradisional Jawa Kontemporer',
      category: 'Nusantara',
      shortDesc: 'Inspirasi unsur arsitektur Jawa (Joglo & Limasan) yang dipadukan secara modern dan fungsional.',
      detailedDesc:
        'Menghormati filosofi spasial Jawa—Pendopo sebagai ruang sambut terbuka, Pringgitan sebagai area transisi, dan Dalem sebagai ruang keluarga intim—diterjemahkan kembali dengan struktur kayu jati presisi, dinding kaca modern, dan batu kali Merapi.',
      idealLandSize: '200 – 350 m²',
      buildingArea: '150 – 240 m²',
      floors: 1,
      bedrooms: '3+1 Kamar Tidur',
      bathrooms: '3 Kamar Mandi',
      keyMaterials: ['Kayu Jati Konstruksi', 'Batu Candi / Andesit Merapi', 'Lantai Tegel / Teraso', 'Kaca Tempered Bening'],
      architecturalHighlights: [
        'Atap tajug/limasan bertingkat yang memaksimalkan efek tumpukan udara dingin',
        'Paviliun pendopo modern multifungsi di bagian depan',
        'Perpaduan kerajinan lokal Yogyakarta dengan utilitas rumah pintar masa kini',
      ],
      config3D: {
        roofType: 'joglo-kontemporer',
        stories: 1,
        wallColor: '#EDE5D8',
        secondaryWallColor: '#3A322B',
        roofColor: '#5A3826',
        woodColor: '#7A4924',
        stoneColor: '#3B3D3B',
        metalColor: '#2B241E',
        hasPool: true,
        hasCourtyard: true,
        hasPendopo: true,
        hasArches: false,
        louverCount: 8,
        footprintScaleX: 1.15,
        footprintScaleZ: 1.1,
      },
    },
    {
      id: 'dua-lantai',
      name: 'Rumah Dua Lantai Keluarga',
      category: 'Minimalis',
      shortDesc: 'Pemanfaatan lahan optimal, pembagian zona aktivitas publik-privat, dan kebutuhan keluarga tumbuh.',
      detailedDesc:
        'Solusi ideal bagi keluarga di area perkotaan Yogyakarta dan Sleman. Lantai dasar didedikasikan untuk area komunal, ruang tamu, dapur bersih, dan satu kamar lansia/tamu, sementara lantai dua menampung zona privat keluarga dengan balkon teduh.',
      idealLandSize: '110 – 160 m²',
      buildingArea: '140 – 190 m²',
      floors: 2,
      bedrooms: '4 Kamar Tidur',
      bathrooms: '3 Kamar Mandi',
      keyMaterials: ['Beton Bertulang & Fasad Komposit', 'Kisi Conwood / Kayu WPC', 'Batu Alam Susun Sirih', 'Railing Kaca Tempered'],
      architecturalHighlights: [
        'Pemisahan tegas antara zona publik di lantai 1 dan zona istirahat di lantai 2',
        'Massa lantai dua menjorok (overhang) menaungi carport dua mobil di bawahnya',
        'Balkon tanaman gantung (planter box) pada fasad lantai atas',
      ],
      config3D: {
        roofType: 'two-story-modern',
        stories: 2,
        wallColor: '#F0EDE6',
        secondaryWallColor: '#283329',
        roofColor: '#262B26',
        woodColor: '#A36D41',
        stoneColor: '#4E524E',
        metalColor: '#1C201C',
        hasPool: true,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: false,
        louverCount: 9,
        footprintScaleX: 1.0,
        footprintScaleZ: 0.95,
      },
    },
    {
      id: 'compact-house',
      name: 'Rumah Kecil & Compact House',
      category: 'Compact',
      shortDesc: 'Desain efisien untuk lahan terbatas dengan sirkulasi pintar, mezzanine opsional, dan tetap lega.',
      detailedDesc:
        'Membuktikan bahwa lahan terbatas (60–90 m²) di area padat Yogyakarta tetap dapat memiliki hunian sehat. Mengandalkan furnitur terintegrasi, bukaan vertikal ke taman mikro belakang, dan pencahayaan skylight terukur.',
      idealLandSize: '60 – 90 m²',
      buildingArea: '45 – 72 m²',
      floors: 1,
      bedrooms: '2 Kamar Tidur',
      bathrooms: '1–2 Kamar Mandi',
      keyMaterials: ['Dinding Plester Kamprot Halus', 'Atap Miring Tunggal (Monopitch)', 'Kayu Lapis Birch/Jati Muda', 'Rooster Terakota'],
      architecturalHighlights: [
        'Zero-wasted-corridor: meminimalkan lorong sempit agar ruang utama terasa luas',
        'Taman kantong (pocket garden) 2x3m sebagai sumber cahaya dan udara segar',
        'Struktur siap rumah tumbuh (mudah dikembangkan bertahap di kemudian hari)',
      ],
      config3D: {
        roofType: 'compact-mono',
        stories: 1,
        wallColor: '#F4F1EA',
        secondaryWallColor: '#3D4A3E',
        roofColor: '#333833',
        woodColor: '#B88456',
        stoneColor: '#686C67',
        metalColor: '#262A26',
        hasPool: false,
        hasCourtyard: true,
        hasPendopo: false,
        hasArches: false,
        louverCount: 5,
        footprintScaleX: 0.78,
        footprintScaleZ: 0.82,
      },
    },
  ] as HouseModel[],

  interiorRooms: [
    {
      id: 'ruang-keluarga',
      name: 'Ruang Keluarga',
      zone: 'Zona Komunal Utama',
      dimensions: '4.5m × 5.5m · Tinggi Plafon 3.4m',
      description:
        'Pusat interaksi harian keluarga dengan sofa modular rendah, credenza kayu solid, pencahayaan tidak langsung (indirect cove light), dan akses visual langsung ke taman dalam.',
      focalElements: ['Sofa L-Shape Linen', 'Meja Kopi Kayu Jati / Travertine', 'Panel Dinding Kisi Akustik', 'Bukaan Geser ke Teras'],
      lightingStrategy: 'Warm indirect LED 2700K dipadukan cahaya alami dari jendela sisi taman.',
    },
    {
      id: 'ruang-tamu',
      name: 'Ruang Tamu',
      zone: 'Zona Sambut & Transisi',
      dimensions: '3.5m × 4.0m · Tinggi Plafon 3.2m',
      description:
        'Area penerimaan tamu yang menjaga privasi ruang dalam melalui partisi kisi kayu semi-transparan, kursi aksen ergonomis, dan karya kriya lokal.',
      focalElements: ['Sepasang Lounge Chair Kayu', 'Partisi Kisi Visual', 'Meja Konsol Batu Alam', 'Lampu Lantai Arsitektural'],
      lightingStrategy: 'Spotlight terfokus 3000K pada tekstur dinding dan pencahayaan ambient lembut.',
    },
    {
      id: 'kamar-tidur-utama',
      name: 'Kamar Tidur Utama',
      zone: 'Zona Privat Istirahat',
      dimensions: '4.0m × 5.0m · Walk-in Closet Terintegrasi',
      description:
        'Ruang istirahat menenangkan dengan headboard kayu memanjang, tekstur kain tenun netral, pencahayaan baca redup, serta jendela sudut ber-tirai ganda.',
      focalElements: ['Dipan Platform Kayu Solid', 'Headboard Berlapis Kain & Kayu', 'Lemari Pakaian Built-in Rata Dinding', 'Bench Ujung Tempat Tidur'],
      lightingStrategy: 'Sconce samping tempat tidur 2700K dengan dimmer untuk kenyamanan sebelum tidur.',
    },
    {
      id: 'kamar-anak',
      name: 'Kamar Anak',
      zone: 'Zona Tumbuh & Belajar',
      dimensions: '3.2m × 3.8m · Penyimpanan Modular',
      description:
        'Dirancang fleksibel mengikuti pertumbuhan anak, memisahkan area tidur yang nyaman, meja belajar menghadap cahaya alami, dan rak penyimpanan aman tanpa sudut tajam.',
      focalElements: ['Tempat Tidur Single + Laci Bawah', 'Meja Belajar Ergonomis', 'Rak Buku Dinding', 'Karpet Bermain Serat Alami'],
      lightingStrategy: 'Pencahayaan merata 3500K-4000K di area meja belajar dan warm light di area tidur.',
    },
    {
      id: 'dapur-modern',
      name: 'Dapur Modern',
      zone: 'Zona Kuliner & Persiapan',
      dimensions: '3.5m × 4.2m · Island Tengah',
      description:
        'Dapur bersih fungsional dengan meja island batu alam tahan gores, kabinet tanpa tarikan (handleless) bertekstur serat kayu, serta sirkulasi segitiga kerja yang efisien.',
      focalElements: ['Kitchen Island Batu Granit/Sintered', 'Kabinet Atas Rata Plafon', 'Backsplash Teraso / Keramik Matte', 'Kursi Bar Kayu Jati'],
      lightingStrategy: 'Under-cabinet task light 3500K untuk area potong dan pendant lamp hangat di atas island.',
    },
    {
      id: 'ruang-makan',
      name: 'Ruang Makan',
      zone: 'Zona Kumpul & Jamuan',
      dimensions: '3.6m × 4.2m · Terhubung Dapur & Teras',
      description:
        'Meja makan kayu utuh untuk 6–8 orang yang ditempatkan berdampingan dengan pintu kaca lipat menuju teras belakang, menciptakan suasana bersantap semi-outdoor.',
      focalElements: ['Meja Makan Kayu Jati Solid 220cm', '6 Kursi Makan Anyaman Rotan/Kain', 'Lampu Gantung Linear Tembaga', 'Bufet Saji Rendah'],
      lightingStrategy: 'Lampu gantung fokus tepat 75cm di atas permukaan meja makan dengan CRI tinggi.',
    },
    {
      id: 'kamar-mandi',
      name: 'Kamar Mandi',
      zone: 'Zona Relaksasi & Sanitasi',
      dimensions: '2.4m × 3.2m · Area Basah & Kering Terpisah',
      description:
        'Kamar mandi bergaya spa tropis dengan pemisahan kaca frameless, dinding batu alam/teraso, wastafel meja kayu tahan lembap, serta bukaan skylight di area shower.',
      focalElements: ['Vanity Wastafel Batu & Kayu', 'Cermin Backlit Bundar/Oval', 'Partisi Shower Kaca Tempered', 'Skylight & Tanaman Lembap'],
      lightingStrategy: 'Cahaya skylight alami di siang hari dan LED strip tersembunyi di balik cermin pada malam hari.',
    },
    {
      id: 'home-office',
      name: 'Home Office',
      zone: 'Zona Kerja & Fokus',
      dimensions: '3.0m × 3.5m · Akustik Terkontrol',
      description:
        'Ruang kerja di rumah yang tenang untuk profesional maupun kreator, dilengkapi meja kerja luas, rak latar belakang yang rapi untuk konferensi video, dan jendela bebas silau.',
      focalElements: ['Meja Kerja Kayu 180cm', 'Kursi Kerja Ergonomis', 'Rak Buku & Arsip Built-in', 'Panel Kedap Suara Estetik'],
      lightingStrategy: 'Cahaya samping dari jendela (tidak membelakangi layar) ditambah lampu meja fokus.',
    },
    {
      id: 'area-santai-taman',
      name: 'Area Santai & Taman',
      zone: 'Zona Semi-Outdoor & Lanskap',
      dimensions: '4.0m × 5.0m · Dek Teras & Inner Court',
      description:
        'Ruang peralihan antara arsitektur dan alam berupa dek kayu teduh, bangku beton-kayu menyatu dengan pot tanaman tropis, serta gemericik air kolam refleksi.',
      focalElements: ['Dek Kayu Ulin / WPC', 'Outdoor Daybed Tahan Cuaca', 'Pohon Kamboja / Palem & Monstera', 'Kolam Ikan / Refleksi Dangkal'],
      lightingStrategy: 'Uplight lanskap hangat 2700K yang menyorot tajuk pohon dan tekstur dinding batu.',
    },
    {
      id: 'interior-compact',
      name: 'Interior Apartemen / Rumah Compact',
      zone: 'Zona Multifungsi Efisien',
      dimensions: '5.0m × 6.0m · Studio / Compact Living',
      description:
        'Penataan ruang cerdas yang menyatukan area duduk, meja makan lipat/menyatu, dapur kompak, dan penyimpanan vertikal hingga plafon agar ruang mungil terasa dua kali lebih lapang.',
      focalElements: ['Sofa Compact 2-Seater', 'Kabinet TV Menyatu Meja Makan', 'Penyimpanan Vertikal Penuh', 'Cermin Dinding Penambah Dimensi'],
      lightingStrategy: 'Kombinasi track light fleksibel dan warna dinding terang pemantul cahaya.',
    },
  ] as InteriorRoom[],

  interiorStyles: [
    {
      id: 'minimalis-modern',
      name: 'Minimalis Modern',
      tagline: 'Garis bersih, bidang tenang, dan fungsionalitas tanpa ornamen berlebih.',
      description:
        'Menggunakan kontras lembut antara dinding putih hangat, lantai batu abu muda, kayu oak rata, serta aksen logam hitam matte.',
      wallHex: '#F2EFE9',
      floorHex: '#D8D4CC',
      woodHex: '#9E7B56',
      fabricHex: '#E0DDD5',
      accentHex: '#283329',
      metalHex: '#1F2220',
      rugHex: '#C8C3B8',
      lightWarmthHex: '#FFF3DC',
      materialSummary: ['Cat Putih Hangat Matte', 'Homogeneous Tile Abu Muda', 'Veneer Oak Lurus', 'Aluminium Hitam'],
    },
    {
      id: 'japandi-natural',
      name: 'Japandi Natural',
      tagline: 'Kehangatan kayu jati muda, tekstil linen organik, dan harmoni wabi-sabi.',
      description:
        'Perpaduan fungsionalitas Skandinavia dan ketenangan Jepang yang sangat cocok dengan kerajinan kayu dan rotan Yogyakarta.',
      wallHex: '#EFE8DC',
      floorHex: '#CBB99F',
      woodHex: '#B6804C',
      fabricHex: '#E6DFD3',
      accentHex: '#596653',
      metalHex: '#3B3630',
      rugHex: '#D6C9B4',
      lightWarmthHex: '#FFE8BF',
      materialSummary: ['Limewash Krem Hangat', 'Kayu Jati Natural Doff', 'Anyaman Rotan & Linen', 'Keramik Tekstur Tanah'],
    },
    {
      id: 'modern-luxury',
      name: 'Modern Luxury',
      tagline: 'Kemewahan terukur lewat batu travertine, kayu walnut gelap, dan aksen tembaga.',
      description:
        'Menghadirkan suasana resor bintang lima melalui material bertekstur kaya, pencahayaan dramatis, dan detail logam brushed bronze.',
      wallHex: '#E5DEC9',
      floorHex: '#B8AE9E',
      woodHex: '#5C3A24',
      fabricHex: '#D6CEC2',
      accentHex: '#B87D4B',
      metalHex: '#B87D4B',
      rugHex: '#9E9383',
      lightWarmthHex: '#FFE2B0',
      materialSummary: ['Batu Travertine / Marmer Honed', 'Kayu Walnut Tua', 'Brushed Bronze / Tembaga', 'Velvet & Linen Tebal'],
    },
    {
      id: 'scandinavian',
      name: 'Scandinavian',
      tagline: 'Ruang terang benderang, kayu warna cerah, dan sentuhan warna sage lembut.',
      description:
        'Memaksimalkan pantulan cahaya matahari pada ruang dengan palet putih bersih, kayu sungkai/birch cerah, dan tekstil nyaman.',
      wallHex: '#F7F6F2',
      floorHex: '#DFD3C3',
      woodHex: '#CFA676',
      fabricHex: '#D9E0D7',
      accentHex: '#6A7F6E',
      metalHex: '#5A5E5B',
      rugHex: '#EAE6DF',
      lightWarmthHex: '#FFF8EB',
      materialSummary: ['Kayu Sungkai Cerah', 'Dinding Putih Bersih', 'Kain Katun Hijau Sage', 'Keramik Putih Matte'],
    },
    {
      id: 'industrial',
      name: 'Industrial',
      tagline: 'Karakter maskulin semen ekspos, kulit cognac, baja hitam, dan kayu reklamasi.',
      description:
        'Cocok untuk hunian urban dan studio kreatif, memadukan permukaan beton abu dengan kehangatan kulit dan kayu tua.',
      wallHex: '#9C9E9A',
      floorHex: '#6E706D',
      woodHex: '#754829',
      fabricHex: '#9E5B36',
      accentHex: '#B87D4B',
      metalHex: '#181A19',
      rugHex: '#525451',
      lightWarmthHex: '#FFDCA3',
      materialSummary: ['Dinding & Lantai Semen Ekspos', 'Besi Hollow Hitam', 'Kulit Sintetis Cognac', 'Kayu Jati Lawas'],
    },
    {
      id: 'tropical-contemporary',
      name: 'Tropical Contemporary',
      tagline: 'Hijau zaitun gelap, kayu jati matang, batu andesit, dan kesegaran tropis Nusantara.',
      description:
        'Identitas khas RUANG JOGJA yang memadukan warna hijau dedaunan teduh, kayu jati lokal berkualitas, dan batu alam Yogyakarta.',
      wallHex: '#EAE3D5',
      floorHex: '#9E978B',
      woodHex: '#824E27',
      fabricHex: '#334235',
      accentHex: '#B87D4B',
      metalHex: '#232B24',
      rugHex: '#C2B7A3',
      lightWarmthHex: '#FFE6B8',
      materialSummary: ['Kayu Jati Perhutani', 'Teraso & Batu Andesit', 'Kain Hijau Zaitun Gelap', 'Aksen Tembaga Lembut'],
    },
  ] as InteriorStyleConfig[],

  services: [
    {
      id: 'jasa-arsitektur',
      code: '01',
      title: 'Jasa Arsitektur',
      subtitle: 'Perencanaan menyeluruh dari gagasan ruang hingga dokumen gambar teknis.',
      description:
        'Pendekatan arsitektur yang menyeimbangkan estetika fasad, kenyamanan termal iklim Yogyakarta, tata ruang keluarga, serta kejelasan teknis sebelum pembangunan dimulai.',
      deliverables: [
        'Konsultasi konsep rumah & analisis potensi tapak/lahan',
        'Perencanaan kebutuhan ruang (programming) & zonasi aktivitas',
        'Pengembangan denah arsitektural yang efisien dan sehat',
        'Desain fasad kontekstual & pemodelan 3D eksterior',
        'Visualisasi 3D rumah untuk peninjauan proporsi & material',
        'Gambar kerja arsitektur, struktur dasar, dan MEP sesuai lingkup layanan',
      ],
      ctaText: 'Konsultasikan Desain Arsitektur',
      defaultWorkType: 'desain',
    },
    {
      id: 'jasa-interior',
      code: '02',
      title: 'Jasa Desain Interior',
      subtitle: 'Penataan suasana ruang dalam, materialitas, pencahayaan, dan furnitur custom.',
      description:
        'Merancang pengalaman ruang dalam yang ergonomis dan selaras dengan karakter arsitektur bangunan, baik untuk rumah baru maupun pembaruan ruang yang sudah ada.',
      deliverables: [
        'Konsep desain interior & moodboard karakter ruang',
        'Pemilihan material lantai, dinding, plafon, dan palet warna',
        'Tata letak furnitur (furniture layout) & optimasi sirkulasi',
        'Perencanaan titik pencahayaan ambient, task, dan accent',
        'Visualisasi 3D ruang dalam secara mendetail',
        'Perencanaan gambar detail furnitur custom (built-in cabinetry)',
      ],
      ctaText: 'Konsultasikan Desain Interior',
      defaultWorkType: 'interior',
    },
    {
      id: 'jasa-bangun',
      code: '03',
      title: 'Jasa Bangun Rumah',
      subtitle: 'Pelaksanaan konstruksi terencana untuk hunian satu lantai maupun dua lantai.',
      description:
        'Mewujudkan gambar perencanaan menjadi bangunan fisik melalui penyusunan tahapan kerja yang transparan, diskusi rencana anggaran, dan kontrol kualitas material.',
      deliverables: [
        'Pembangunan rumah baru dari lahan kosong hingga siap huni',
        'Konstruksi hunian satu lantai, dua lantai, atau villa tropis',
        'Diskusi Rencana Anggaran Biaya (RAB) sesuai prioritas & spesifikasi',
        'Perencanaan lingkup pekerjaan, jadwal kurva-S, dan tahapan pelaksanaan',
        'Koordinasi pemilihan material struktural & finishing di lapangan',
      ],
      ctaText: 'Diskusikan Rencana Pembangunan',
      defaultWorkType: 'bangun-baru',
    },
    {
      id: 'jasa-renovasi',
      code: '04',
      title: 'Jasa Renovasi Rumah',
      subtitle: 'Pembaruan fungsi, penyegaran fasad, dan pengembangan ruang hunian eksisting.',
      description:
        'Solusi terukur untuk memperbarui tampilan rumah lama, memperbaiki sirkulasi udara dan cahaya, maupun menambah kapasitas ruang seiring bertambahnya kebutuhan keluarga.',
      deliverables: [
        'Renovasi fasad untuk memperbarui wajah dan keteduhan bangunan',
        'Renovasi dapur modern, ruang makan, dan kamar mandi',
        'Renovasi interior & penataan ulang sekat ruangan',
        'Penambahan ruangan atau peningkatan lantai sesuai kajian teknis struktur',
        'Perbaikan tata udara, pencahayaan alami, dan pembaruan utilitas hunian',
      ],
      ctaText: 'Konsultasikan Kebutuhan Renovasi',
      defaultWorkType: 'renovasi',
    },
    {
      id: 'layanan-tambahan',
      code: '05',
      title: 'Layanan Pendukung & Spesialis',
      subtitle: 'Kajian tapak, lanskap taman tropis, tata cahaya, dan kurasi material lokal.',
      description:
        'Layanan pelengkap untuk memastikan bangunan menyatu harmonis dengan lingkungan sekitarnya serta menonjolkan kekayaan material di Yogyakarta.',
      deliverables: [
        'Konsultasi pemanfaatan lahan miring, memanjang, atau sudut (hook)',
        'Perencanaan taman tropis, inner courtyard, dan kolam refleksi',
        'Penataan pencahayaan arsitektural (architectural & landscape lighting)',
        'Konsultasi kurasi material bangunan (kayu, batu alam, teraso, rooster)',
      ],
      ctaText: 'Tanyakan Layanan Pendukung',
      defaultWorkType: 'desain',
    },
  ] as ServiceCategory[],

  // Parameter Simulasi Demo Kalkulator (Mudah diubah pada satu tempat)
  // CATATAN PENTING: Seluruh angka di bawah adalah PARAMETER CONTOH DEMO, bukan penawaran resmi.
  calculatorConfig: {
    disclaimerTitle: 'SIMULASI DEMO — BUKAN PENAWARAN RESMI',
    disclaimerText:
      'Seluruh angka pada kalkulator ini menggunakan parameter simulasi contoh untuk membantu Anda menyusun gambaran awal kebutuhan ruang dan anggaran. Biaya aktual di lapangan sangat bergantung pada kondisi kontur lahan, hasil uji tanah/struktur, kelengkapan gambar kerja, fluktuasi harga material, serta lingkup pekerjaan yang disepakati bersama.',
    workTypes: [
      {
        id: 'desain',
        label: 'Desain Arsitektur & Gambar Kerja',
        unit: 'per m² luas bangunan',
        baseRateMin: 120000,
        baseRateMax: 250000,
        description: 'Meliputi konsep desain, pemodelan 3D, dan dokumen gambar kerja perencanaan.',
      },
      {
        id: 'interior',
        label: 'Desain & Penataan Interior',
        unit: 'per m² area interior',
        baseRateMin: 1800000,
        baseRateMax: 3200000,
        description: 'Simulasi perencanaan dan pengadaan elemen interior dasar & furnitur built-in.',
      },
      {
        id: 'bangun-baru',
        label: 'Pembangunan Rumah Baru (Konstruksi)',
        unit: 'per m² luas bangunan',
        baseRateMin: 4200000,
        baseRateMax: 5800000,
        description: 'Simulasi pekerjaan struktur, dinding, atap, MEP dasar, dan finishing sesuai spesifikasi.',
      },
      {
        id: 'renovasi',
        label: 'Renovasi & Pengembangan Hunian',
        unit: 'per m² area terdampak',
        baseRateMin: 2800000,
        baseRateMax: 4500000,
        description: 'Simulasi pembongkaran terpilih, penyesuaian ruang, dan pembaruan finishing.',
      },
    ],
    materialSpecs: [
      {
        id: 'standar',
        label: 'Standar Fungsional',
        multiplier: 1.0,
        notes: 'Material fungsional berkualitas baik, keramik homogen standar, kusen aluminium/kayu lokal, cat cuaca.',
      },
      {
        id: 'menengah',
        label: 'Menengah Natural (Rekomendasi)',
        multiplier: 1.22,
        notes: 'Kombinasi batu alam lokal Jogja, aksen kayu jati/kamper, granit tile 60x60, sanitair menengah atas.',
      },
      {
        id: 'premium',
        label: 'Premium Arsitektural',
        multiplier: 1.5,
        notes: 'Dominasi kayu jati pilihan, marmer/teraso custom, bukaan kaca lebar Low-E, detail arsitektural khusus.',
      },
    ],
    floorMultipliers: {
      1: 1.0,
      2: 1.12, // Faktor struktur fondasi tapak, tangga, dan perancah lantai 2
      3: 1.22,
    } as Record<number, number>,
  },

  workflowSteps: [
    {
      step: '01',
      title: 'Diskusi Awal & Pemetaan Kebutuhan',
      duration: 'Tahap 1 · Eksplorasi',
      description:
        'Mengidentifikasi profil penghuni, kebiasaan harian keluarga, karakter lokasi lahan di Yogyakarta, serta kisaran anggaran dan waktu yang direncanakan.',
    },
    {
      step: '02',
      title: 'Konsep Ruang & Visualisasi 3D Interaktif',
      duration: 'Tahap 2 · Pra-Rencana',
      description:
        'Menyusun tata letak denah, zonasi taman dan sirkulasi udara, diikuti pemodelan 3D eksterior serta interior agar proporsi ruang dapat dievaluasi dengan jelas.',
    },
    {
      step: '03',
      title: 'Gambar Kerja Teknis & Rencana Biaya',
      duration: 'Tahap 3 · Pengembangan',
      description:
        'Menyelesaikan detail dimensi arsitektur, skema struktur, titik kelistrikan/plambing, spesifikasi material, serta rincian Rencana Anggaran Biaya (RAB).',
    },
    {
      step: '04',
      title: 'Pelaksanaan Pembangunan / Renovasi',
      duration: 'Tahap 4 · Realisasi',
      description:
        'Pelaksanaan bertahap di lapangan sesuai jadwal kerja, pemeriksaan mutu material, hingga serah terima ruang yang siap dihuni.',
    },
  ],

  faqs: [
    {
      question: 'Apakah model rumah di katalog dapat dimodifikasi sesuai ukuran lahan saya?',
      answer:
        'Tentu. Seluruh model rumah pada katalog RUANG JOGJA merupakan titik awal inspirasi (konsep dasar). Denah, lebar fasad, jumlah kamar, hingga orientasi matahari akan disesuaikan kembali dengan ukuran dan bentuk lahan aktual Anda.',
    },
    {
      question: 'Apakah saya bisa memesan jasa desain arsitektur atau interior saja tanpa jasa bangun?',
      answer:
        'Bisa. Anda dapat memilih lingkup layanan sesuai kebutuhan: hanya perencanaan desain arsitektur/interior saja, atau melanjutkan hingga tahap pembangunan dan renovasi.',
    },
    {
      question: 'Bagaimana penyesuaian desain rumah untuk iklim dan karakter wilayah Yogyakarta?',
      answer:
        'Perencanaan memperhatikan curah hujan musiman dengan tritisan/overstek yang memadai, penghawaan silang (cross ventilation) agar rumah tidak pengap, pencahayaan alami yang tidak menyilaukan, serta kesiapan struktur yang proporsional.',
    },
    {
      question: 'Apakah hasil angka pada kalkulator merupakan penawaran harga mengikat?',
      answer:
        'Tidak. Kalkulator di halaman ini adalah alat bantu simulasi awal berbasis parameter demo. Rencana Anggaran Biaya (RAB) resmi baru dapat disusun secara akurat setelah ada kejelasan denah, spesifikasi material, dan peninjauan kondisi lokasi.',
    },
    {
      question: 'Bagaimana cara mengubah nomor WhatsApp, daftar model, atau tarif simulasi pada website ini?',
      answer:
        'Seluruh data bisnis, nomor WhatsApp, katalog 8 model rumah, 10 ruang interior, dan parameter kalkulator tersimpan terpusat di dalam satu file konfigurasi `/src/config/siteConfig.ts` sehingga sangat mudah diperbarui.',
    },
  ],
};
