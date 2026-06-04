export interface FaskesRME {
  id: string;
  nama: string;
  jenis: 'RS Umum' | 'RS Khusus' | 'RS Pendidikan' | 'RSUD' | 'Puskesmas';
  kelas: 'A' | 'B' | 'C' | 'D' | '-';
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  stageEMRAM: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  tempatTidur: number;
  tanggalAssessment: string;
  statusAssessment: 'Tervalidasi' | 'Dalam Review' | 'Draft' | 'Belum';
  lat?: number;
  lng?: number;
}

export interface ProvinsiTile {
  kode: string;
  nama: string;
  row: number;
  col: number;
}

// Province tile grid — approximate Indonesia geographic layout
export const provinsiTiles: ProvinsiTile[] = [
  // Sumatera
  { kode: 'ACH', nama: 'Aceh',              row: 0, col: 0  },
  { kode: 'SUT', nama: 'Sumatera Utara',    row: 0, col: 1  },
  { kode: 'SUB', nama: 'Sumatera Barat',    row: 0, col: 2  },
  { kode: 'RIA', nama: 'Riau',              row: 0, col: 3  },
  { kode: 'JAM', nama: 'Jambi',             row: 0, col: 4  },
  { kode: 'SSL', nama: 'Sumatera Selatan',  row: 0, col: 5  },
  { kode: 'LAP', nama: 'Lampung',           row: 0, col: 6  },
  // Java
  { kode: 'BTN', nama: 'Banten',            row: 1, col: 2  },
  { kode: 'DKI', nama: 'DKI Jakarta',       row: 1, col: 3  },
  { kode: 'JBR', nama: 'Jawa Barat',        row: 1, col: 4  },
  { kode: 'JTG', nama: 'Jawa Tengah',       row: 1, col: 5  },
  { kode: 'DIY', nama: 'DI Yogyakarta',     row: 2, col: 5  },
  { kode: 'JTM', nama: 'Jawa Timur',        row: 1, col: 6  },
  // Bali & Nusa Tenggara
  { kode: 'BAL', nama: 'Bali',              row: 2, col: 6  },
  { kode: 'NTB', nama: 'NTB',               row: 2, col: 7  },
  { kode: 'NTT', nama: 'NTT',               row: 2, col: 8  },
  // Kalimantan
  { kode: 'KBR', nama: 'Kalimantan Barat',  row: 1, col: 7  },
  { kode: 'KTG', nama: 'Kalimantan Tengah', row: 1, col: 8  },
  { kode: 'KSL', nama: 'Kalimantan Selatan',row: 2, col: 9  },
  { kode: 'KTM', nama: 'Kalimantan Timur',  row: 1, col: 9  },
  { kode: 'KUT', nama: 'Kalimantan Utara',  row: 1, col: 10 },
  // Sulawesi
  { kode: 'SLU', nama: 'Sulawesi Utara',    row: 1, col: 11 },
  { kode: 'GOR', nama: 'Gorontalo',         row: 2, col: 10 },
  { kode: 'STG', nama: 'Sulawesi Tengah',   row: 2, col: 11 },
  { kode: 'SLB', nama: 'Sulawesi Barat',    row: 3, col: 9  },
  { kode: 'SLS', nama: 'Sulawesi Selatan',  row: 3, col: 10 },
  { kode: 'STK', nama: 'Sulawesi Tenggara', row: 3, col: 11 },
  // Maluku & Papua
  { kode: 'MUT', nama: 'Maluku Utara',      row: 3, col: 12 },
  { kode: 'MAL', nama: 'Maluku',            row: 4, col: 12 },
  { kode: 'PBR', nama: 'Papua Barat',       row: 4, col: 13 },
  { kode: 'PAP', nama: 'Papua',             row: 4, col: 14 },
];

export const allFaskes: FaskesRME[] = [
  // DKI Jakarta
  { id: 'f01', nama: 'RSUPN Dr. Cipto Mangunkusumo', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'DKI Jakarta', kabupaten: 'Jakarta Pusat', kecamatan: 'Senen', stageEMRAM: 6, tempatTidur: 960, tanggalAssessment: '2026-01-15', statusAssessment: 'Tervalidasi' },
  { id: 'f02', nama: 'RS Fatmawati', jenis: 'RS Umum', kelas: 'A', provinsi: 'DKI Jakarta', kabupaten: 'Jakarta Selatan', kecamatan: 'Cilandak', stageEMRAM: 5, tempatTidur: 815, tanggalAssessment: '2025-11-20', statusAssessment: 'Tervalidasi' },
  { id: 'f03', nama: 'RSUD Tarakan', jenis: 'RSUD', kelas: 'B', provinsi: 'DKI Jakarta', kabupaten: 'Jakarta Pusat', kecamatan: 'Gambir', stageEMRAM: 4, tempatTidur: 430, tanggalAssessment: '2025-10-05', statusAssessment: 'Dalam Review' },
  { id: 'f04', nama: 'RS Persahabatan', jenis: 'RS Umum', kelas: 'A', provinsi: 'DKI Jakarta', kabupaten: 'Jakarta Timur', kecamatan: 'Pulo Gadung', stageEMRAM: 5, tempatTidur: 620, tanggalAssessment: '2026-02-01', statusAssessment: 'Tervalidasi' },
  // Jawa Barat
  { id: 'f05', nama: 'RSUP Dr. Hasan Sadikin', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Jawa Barat', kabupaten: 'Kota Bandung', kecamatan: 'Cicendo', stageEMRAM: 5, tempatTidur: 947, tanggalAssessment: '2025-12-10', statusAssessment: 'Tervalidasi' },
  { id: 'f06', nama: 'RSUD Kota Bandung', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Barat', kabupaten: 'Kota Bandung', kecamatan: 'Regol', stageEMRAM: 4, tempatTidur: 350, tanggalAssessment: '2025-11-01', statusAssessment: 'Tervalidasi' },
  { id: 'f07', nama: 'RSUD Bekasi', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Barat', kabupaten: 'Kota Bekasi', kecamatan: 'Bekasi Barat', stageEMRAM: 3, tempatTidur: 310, tanggalAssessment: '2025-09-15', statusAssessment: 'Dalam Review' },
  { id: 'f08', nama: 'RS Hermina Depok', jenis: 'RS Umum', kelas: 'C', provinsi: 'Jawa Barat', kabupaten: 'Kota Depok', kecamatan: 'Pancoran Mas', stageEMRAM: 3, tempatTidur: 220, tanggalAssessment: '2025-08-20', statusAssessment: 'Tervalidasi' },
  { id: 'f09', nama: 'RSUD Karawang', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Barat', kabupaten: 'Karawang', kecamatan: 'Karawang Barat', stageEMRAM: 2, tempatTidur: 280, tanggalAssessment: '2025-07-10', statusAssessment: 'Draft' },
  // Jawa Tengah
  { id: 'f10', nama: 'RSUP Dr. Kariadi', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Jawa Tengah', kabupaten: 'Kota Semarang', kecamatan: 'Candisari', stageEMRAM: 5, tempatTidur: 858, tanggalAssessment: '2026-01-05', statusAssessment: 'Tervalidasi' },
  { id: 'f11', nama: 'RSUD Dr. Moewardi', jenis: 'RSUD', kelas: 'A', provinsi: 'Jawa Tengah', kabupaten: 'Kota Surakarta', kecamatan: 'Jebres', stageEMRAM: 4, tempatTidur: 720, tanggalAssessment: '2025-11-15', statusAssessment: 'Tervalidasi' },
  { id: 'f12', nama: 'RSUD Tugurejo', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Tengah', kabupaten: 'Kota Semarang', kecamatan: 'Tugurejo', stageEMRAM: 3, tempatTidur: 340, tanggalAssessment: '2025-10-20', statusAssessment: 'Dalam Review' },
  { id: 'f13', nama: 'RSUD Klaten', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Tengah', kabupaten: 'Klaten', kecamatan: 'Klaten Selatan', stageEMRAM: 2, tempatTidur: 240, tanggalAssessment: '2025-06-10', statusAssessment: 'Draft' },
  { id: 'f14', nama: 'RSUD Banyumas', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Tengah', kabupaten: 'Banyumas', kecamatan: 'Purwokerto Selatan', stageEMRAM: 3, tempatTidur: 190, tanggalAssessment: '2025-05-15', statusAssessment: 'Tervalidasi' },
  // DI Yogyakarta
  { id: 'f00', nama: 'RS Papyrus', jenis: 'RS Umum', kelas: 'C', provinsi: 'DI Yogyakarta', kabupaten: 'Sleman', kecamatan: 'Mlati', stageEMRAM: 4, tempatTidur: 145, tanggalAssessment: '2026-02-15', statusAssessment: 'Tervalidasi', lat: -7.741, lng: 110.359 },
  { id: 'f15', nama: 'RSUP Dr. Sardjito', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'DI Yogyakarta', kabupaten: 'Sleman', kecamatan: 'Depok', stageEMRAM: 6, tempatTidur: 950, tanggalAssessment: '2026-02-10', statusAssessment: 'Tervalidasi', lat: -7.768, lng: 110.374 },
  { id: 'f16', nama: 'RS Bethesda Yogyakarta', jenis: 'RS Umum', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Kota Yogyakarta', kecamatan: 'Gondokusuman', stageEMRAM: 5, tempatTidur: 415, tanggalAssessment: '2025-12-20', statusAssessment: 'Tervalidasi', lat: -7.786, lng: 110.376 },
  { id: 'f17', nama: 'RSUD Panembahan Senopati', jenis: 'RSUD', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Bantul', kecamatan: 'Bantul', stageEMRAM: 4, tempatTidur: 280, tanggalAssessment: '2025-11-05', statusAssessment: 'Dalam Review', lat: -7.880, lng: 110.328 },
  { id: 'f57', nama: 'RS PKU Muhammadiyah Yogyakarta', jenis: 'RS Umum', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Kota Yogyakarta', kecamatan: 'Wirobrajan', stageEMRAM: 4, tempatTidur: 365, tanggalAssessment: '2025-10-15', statusAssessment: 'Tervalidasi', lat: -7.808, lng: 110.365 },
  { id: 'f58', nama: 'RS Panti Rapih', jenis: 'RS Umum', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Kota Yogyakarta', kecamatan: 'Gondokusuman', stageEMRAM: 5, tempatTidur: 320, tanggalAssessment: '2026-01-08', statusAssessment: 'Tervalidasi', lat: -7.786, lng: 110.386 },
  { id: 'f59', nama: 'RSUD Sleman', jenis: 'RSUD', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Sleman', kecamatan: 'Beran', stageEMRAM: 3, tempatTidur: 210, tanggalAssessment: '2025-09-20', statusAssessment: 'Dalam Review', lat: -7.726, lng: 110.353 },
  { id: 'f60', nama: 'RS JIH Yogyakarta', jenis: 'RS Umum', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Sleman', kecamatan: 'Ngemplak', stageEMRAM: 5, tempatTidur: 230, tanggalAssessment: '2025-12-01', statusAssessment: 'Tervalidasi', lat: -7.758, lng: 110.410 },
  { id: 'f61', nama: 'RSUD Wates', jenis: 'RSUD', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Kulon Progo', kecamatan: 'Wates', stageEMRAM: 3, tempatTidur: 160, tanggalAssessment: '2025-08-15', statusAssessment: 'Draft', lat: -7.900, lng: 110.153 },
  { id: 'f62', nama: 'RSUD Wonosari', jenis: 'RSUD', kelas: 'B', provinsi: 'DI Yogyakarta', kabupaten: 'Gunungkidul', kecamatan: 'Wonosari', stageEMRAM: 2, tempatTidur: 145, tanggalAssessment: '2025-07-10', statusAssessment: 'Draft', lat: -7.964, lng: 110.598 },
  { id: 'f63', nama: 'RS Hermina Yogyakarta', jenis: 'RS Umum', kelas: 'C', provinsi: 'DI Yogyakarta', kabupaten: 'Sleman', kecamatan: 'Mlati', stageEMRAM: 3, tempatTidur: 185, tanggalAssessment: '2025-10-05', statusAssessment: 'Tervalidasi', lat: -7.744, lng: 110.362 },
  { id: 'f64', nama: 'RSUD Kota Yogyakarta', jenis: 'RSUD', kelas: 'C', provinsi: 'DI Yogyakarta', kabupaten: 'Kota Yogyakarta', kecamatan: 'Pakualaman', stageEMRAM: 3, tempatTidur: 200, tanggalAssessment: '2025-09-01', statusAssessment: 'Tervalidasi', lat: -7.800, lng: 110.370 },
  { id: 'f65', nama: 'RS Panti Waluya', jenis: 'RS Umum', kelas: 'C', provinsi: 'DI Yogyakarta', kabupaten: 'Kota Yogyakarta', kecamatan: 'Gedongtengen', stageEMRAM: 4, tempatTidur: 130, tanggalAssessment: '2025-11-20', statusAssessment: 'Tervalidasi', lat: -7.794, lng: 110.360 },
  { id: 'f66', nama: 'RSKIA Sadewa', jenis: 'RS Khusus', kelas: 'C', provinsi: 'DI Yogyakarta', kabupaten: 'Kota Yogyakarta', kecamatan: 'Umbulharjo', stageEMRAM: 2, tempatTidur: 90, tanggalAssessment: '2025-06-15', statusAssessment: 'Draft', lat: -7.810, lng: 110.383 },
  // Jawa Timur
  { id: 'f18', nama: 'RSUD Dr. Soetomo', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Jawa Timur', kabupaten: 'Kota Surabaya', kecamatan: 'Gubeng', stageEMRAM: 5, tempatTidur: 1500, tanggalAssessment: '2026-01-20', statusAssessment: 'Tervalidasi' },
  { id: 'f19', nama: 'RSUD Dr. Saiful Anwar', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Jawa Timur', kabupaten: 'Kota Malang', kecamatan: 'Klojen', stageEMRAM: 4, tempatTidur: 710, tanggalAssessment: '2025-12-01', statusAssessment: 'Tervalidasi' },
  { id: 'f20', nama: 'RSUD Jombang', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Timur', kabupaten: 'Jombang', kecamatan: 'Jombang', stageEMRAM: 3, tempatTidur: 310, tanggalAssessment: '2025-09-10', statusAssessment: 'Dalam Review' },
  { id: 'f21', nama: 'RSUD Sidoarjo', jenis: 'RSUD', kelas: 'B', provinsi: 'Jawa Timur', kabupaten: 'Sidoarjo', kecamatan: 'Sidoarjo', stageEMRAM: 3, tempatTidur: 270, tanggalAssessment: '2025-08-25', statusAssessment: 'Tervalidasi' },
  // Banten
  { id: 'f22', nama: 'RSUD Tangerang', jenis: 'RSUD', kelas: 'B', provinsi: 'Banten', kabupaten: 'Kota Tangerang', kecamatan: 'Tangerang', stageEMRAM: 4, tempatTidur: 380, tanggalAssessment: '2025-11-20', statusAssessment: 'Tervalidasi' },
  { id: 'f23', nama: 'RSUD Serang', jenis: 'RSUD', kelas: 'B', provinsi: 'Banten', kabupaten: 'Kota Serang', kecamatan: 'Serang', stageEMRAM: 3, tempatTidur: 290, tanggalAssessment: '2025-09-15', statusAssessment: 'Draft' },
  // Sumatera Utara
  { id: 'f24', nama: 'RSUP H. Adam Malik', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Sumatera Utara', kabupaten: 'Kota Medan', kecamatan: 'Medan Sunggal', stageEMRAM: 4, tempatTidur: 800, tanggalAssessment: '2025-12-05', statusAssessment: 'Tervalidasi' },
  { id: 'f25', nama: 'RSUD Dr. Pirngadi', jenis: 'RSUD', kelas: 'B', provinsi: 'Sumatera Utara', kabupaten: 'Kota Medan', kecamatan: 'Medan Baru', stageEMRAM: 3, tempatTidur: 520, tanggalAssessment: '2025-10-10', statusAssessment: 'Dalam Review' },
  { id: 'f26', nama: 'RSUD Deli Serdang', jenis: 'RSUD', kelas: 'B', provinsi: 'Sumatera Utara', kabupaten: 'Deli Serdang', kecamatan: 'Lubuk Pakam', stageEMRAM: 2, tempatTidur: 280, tanggalAssessment: '2025-07-20', statusAssessment: 'Draft' },
  // Sumatera Barat
  { id: 'f27', nama: 'RSUP Dr. M. Djamil', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Sumatera Barat', kabupaten: 'Kota Padang', kecamatan: 'Padang Barat', stageEMRAM: 4, tempatTidur: 800, tanggalAssessment: '2025-11-25', statusAssessment: 'Tervalidasi' },
  { id: 'f28', nama: 'RSUD Ahmad Muchtar', jenis: 'RSUD', kelas: 'B', provinsi: 'Sumatera Barat', kabupaten: 'Bukittinggi', kecamatan: 'Guguk Panjang', stageEMRAM: 3, tempatTidur: 230, tanggalAssessment: '2025-09-20', statusAssessment: 'Tervalidasi' },
  // Aceh
  { id: 'f29', nama: 'RSUD Dr. Zainoel Abidin', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Aceh', kabupaten: 'Kota Banda Aceh', kecamatan: 'Baiturrahman', stageEMRAM: 3, tempatTidur: 740, tanggalAssessment: '2025-10-15', statusAssessment: 'Tervalidasi' },
  { id: 'f30', nama: 'RSUD Meuraxa', jenis: 'RSUD', kelas: 'C', provinsi: 'Aceh', kabupaten: 'Kota Banda Aceh', kecamatan: 'Meuraxa', stageEMRAM: 2, tempatTidur: 180, tanggalAssessment: '2025-08-10', statusAssessment: 'Draft' },
  // Riau
  { id: 'f31', nama: 'RSUD Arifin Achmad', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Riau', kabupaten: 'Kota Pekanbaru', kecamatan: 'Marpoyan Damai', stageEMRAM: 4, tempatTidur: 540, tanggalAssessment: '2025-11-05', statusAssessment: 'Tervalidasi' },
  { id: 'f32', nama: 'RSUD Petala Bumi', jenis: 'RSUD', kelas: 'C', provinsi: 'Riau', kabupaten: 'Kota Pekanbaru', kecamatan: 'Senapelan', stageEMRAM: 3, tempatTidur: 170, tanggalAssessment: '2025-10-15', statusAssessment: 'Dalam Review' },
  // Kalimantan Timur
  { id: 'f33', nama: 'RSUD A.W. Sjahranie', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Kalimantan Timur', kabupaten: 'Kota Samarinda', kecamatan: 'Samarinda Ulu', stageEMRAM: 4, tempatTidur: 430, tanggalAssessment: '2025-12-15', statusAssessment: 'Tervalidasi' },
  { id: 'f34', nama: 'RS Pertamina Balikpapan', jenis: 'RS Khusus', kelas: 'B', provinsi: 'Kalimantan Timur', kabupaten: 'Kota Balikpapan', kecamatan: 'Balikpapan Tengah', stageEMRAM: 4, tempatTidur: 200, tanggalAssessment: '2025-11-10', statusAssessment: 'Tervalidasi' },
  { id: 'f35', nama: 'RSUD Kanujoso Djatiwibowo', jenis: 'RSUD', kelas: 'B', provinsi: 'Kalimantan Timur', kabupaten: 'Kota Balikpapan', kecamatan: 'Balikpapan Utara', stageEMRAM: 3, tempatTidur: 270, tanggalAssessment: '2025-09-05', statusAssessment: 'Dalam Review' },
  // Kalimantan Selatan
  { id: 'f36', nama: 'RSUD Ulin Banjarmasin', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Kalimantan Selatan', kabupaten: 'Kota Banjarmasin', kecamatan: 'Banjarmasin Tengah', stageEMRAM: 4, tempatTidur: 610, tanggalAssessment: '2025-12-20', statusAssessment: 'Tervalidasi' },
  { id: 'f37', nama: 'RSUD Banjarbaru', jenis: 'RSUD', kelas: 'B', provinsi: 'Kalimantan Selatan', kabupaten: 'Kota Banjarbaru', kecamatan: 'Cempaka', stageEMRAM: 3, tempatTidur: 200, tanggalAssessment: '2025-09-25', statusAssessment: 'Draft' },
  // Sulawesi Selatan
  { id: 'f38', nama: 'RSUP Dr. Wahidin Sudirohusodo', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Sulawesi Selatan', kabupaten: 'Kota Makassar', kecamatan: 'Tamalanrea', stageEMRAM: 5, tempatTidur: 860, tanggalAssessment: '2026-01-10', statusAssessment: 'Tervalidasi' },
  { id: 'f39', nama: 'RSUD Labuang Baji', jenis: 'RSUD', kelas: 'B', provinsi: 'Sulawesi Selatan', kabupaten: 'Kota Makassar', kecamatan: 'Rappocini', stageEMRAM: 3, tempatTidur: 390, tanggalAssessment: '2025-10-20', statusAssessment: 'Dalam Review' },
  { id: 'f40', nama: 'RSUD Bone', jenis: 'RSUD', kelas: 'B', provinsi: 'Sulawesi Selatan', kabupaten: 'Bone', kecamatan: 'Tanete Riattang', stageEMRAM: 2, tempatTidur: 190, tanggalAssessment: '2025-07-15', statusAssessment: 'Draft' },
  // Bali
  { id: 'f41', nama: 'RSUP Prof. I.G.N.G. Ngoerah', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Bali', kabupaten: 'Kota Denpasar', kecamatan: 'Denpasar Barat', stageEMRAM: 5, tempatTidur: 978, tanggalAssessment: '2026-01-25', statusAssessment: 'Tervalidasi' },
  { id: 'f42', nama: 'RS Siloam Bali', jenis: 'RS Umum', kelas: 'B', provinsi: 'Bali', kabupaten: 'Kota Denpasar', kecamatan: 'Kuta Utara', stageEMRAM: 5, tempatTidur: 240, tanggalAssessment: '2025-11-15', statusAssessment: 'Tervalidasi' },
  { id: 'f43', nama: 'RSUD Sanjiwani', jenis: 'RSUD', kelas: 'B', provinsi: 'Bali', kabupaten: 'Gianyar', kecamatan: 'Gianyar', stageEMRAM: 3, tempatTidur: 195, tanggalAssessment: '2025-09-20', statusAssessment: 'Tervalidasi' },
  // NTT
  { id: 'f44', nama: 'RSUD W.Z. Johannes', jenis: 'RSUD', kelas: 'B', provinsi: 'NTT', kabupaten: 'Kota Kupang', kecamatan: 'Oebobo', stageEMRAM: 2, tempatTidur: 350, tanggalAssessment: '2025-08-10', statusAssessment: 'Draft' },
  { id: 'f45', nama: 'RSUD Ende', jenis: 'RSUD', kelas: 'C', provinsi: 'NTT', kabupaten: 'Ende', kecamatan: 'Ende Selatan', stageEMRAM: 1, tempatTidur: 140, tanggalAssessment: '2025-05-20', statusAssessment: 'Belum' },
  // Maluku
  { id: 'f46', nama: 'RSUD Dr. M. Haulussy', jenis: 'RSUD', kelas: 'B', provinsi: 'Maluku', kabupaten: 'Kota Ambon', kecamatan: 'Sirimau', stageEMRAM: 2, tempatTidur: 340, tanggalAssessment: '2025-08-25', statusAssessment: 'Draft' },
  { id: 'f47', nama: 'RSUD Salahutu', jenis: 'RSUD', kelas: 'C', provinsi: 'Maluku', kabupaten: 'Maluku Tengah', kecamatan: 'Salahutu', stageEMRAM: 1, tempatTidur: 95, tanggalAssessment: '2025-04-10', statusAssessment: 'Belum' },
  // Papua
  { id: 'f48', nama: 'RSUD Jayapura', jenis: 'RSUD', kelas: 'B', provinsi: 'Papua', kabupaten: 'Kota Jayapura', kecamatan: 'Abepura', stageEMRAM: 2, tempatTidur: 280, tanggalAssessment: '2025-09-10', statusAssessment: 'Draft' },
  { id: 'f49', nama: 'RSUD Timika', jenis: 'RSUD', kelas: 'C', provinsi: 'Papua', kabupaten: 'Mimika', kecamatan: 'Mimika Baru', stageEMRAM: 1, tempatTidur: 160, tanggalAssessment: '2025-06-05', statusAssessment: 'Belum' },
  { id: 'f50', nama: 'RSUD Merauke', jenis: 'RSUD', kelas: 'C', provinsi: 'Papua', kabupaten: 'Merauke', kecamatan: 'Merauke', stageEMRAM: 1, tempatTidur: 130, tanggalAssessment: '2025-04-20', statusAssessment: 'Belum' },
  // Sumatera Selatan
  { id: 'f51', nama: 'RSUP Dr. Mohammad Hoesin', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Sumatera Selatan', kabupaten: 'Kota Palembang', kecamatan: 'Ilir Barat I', stageEMRAM: 4, tempatTidur: 700, tanggalAssessment: '2025-12-10', statusAssessment: 'Tervalidasi' },
  { id: 'f52', nama: 'RSUD Bari Palembang', jenis: 'RSUD', kelas: 'B', provinsi: 'Sumatera Selatan', kabupaten: 'Kota Palembang', kecamatan: 'Kemuning', stageEMRAM: 3, tempatTidur: 250, tanggalAssessment: '2025-10-05', statusAssessment: 'Dalam Review' },
  // Lampung
  { id: 'f53', nama: 'RSUD Abdul Moeloek', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Lampung', kabupaten: 'Kota Bandar Lampung', kecamatan: 'Teluk Betung Utara', stageEMRAM: 3, tempatTidur: 460, tanggalAssessment: '2025-11-10', statusAssessment: 'Tervalidasi' },
  { id: 'f54', nama: 'RSUD Dr. H. Bob Bazar', jenis: 'RSUD', kelas: 'B', provinsi: 'Lampung', kabupaten: 'Lampung Selatan', kecamatan: 'Kalianda', stageEMRAM: 2, tempatTidur: 170, tanggalAssessment: '2025-07-15', statusAssessment: 'Draft' },
  // Sulawesi Utara
  { id: 'f55', nama: 'RSUP Prof. Dr. R.D. Kandou', jenis: 'RS Pendidikan', kelas: 'A', provinsi: 'Sulawesi Utara', kabupaten: 'Kota Manado', kecamatan: 'Malalayang', stageEMRAM: 4, tempatTidur: 560, tanggalAssessment: '2025-12-01', statusAssessment: 'Tervalidasi' },
  { id: 'f56', nama: 'RSUD Liun Kendage', jenis: 'RSUD', kelas: 'C', provinsi: 'Sulawesi Utara', kabupaten: 'Sangihe', kecamatan: 'Tahuna', stageEMRAM: 2, tempatTidur: 100, tanggalAssessment: '2025-06-20', statusAssessment: 'Belum' },
];

// National monthly trend data
export const trendBulan = [
  { bulan: 'Jan 25', avgStage: 2.6, rsAktif: 36 },
  { bulan: 'Mar 25', avgStage: 2.8, rsAktif: 39 },
  { bulan: 'Mei 25', avgStage: 2.9, rsAktif: 42 },
  { bulan: 'Jul 25', avgStage: 3.0, rsAktif: 44 },
  { bulan: 'Sep 25', avgStage: 3.2, rsAktif: 47 },
  { bulan: 'Nov 25', avgStage: 3.4, rsAktif: 49 },
  { bulan: 'Jan 26', avgStage: 3.5, rsAktif: 51 },
  { bulan: 'Mar 26', avgStage: 3.6, rsAktif: 53 },
  { bulan: 'Mei 26', avgStage: 3.7, rsAktif: 54 },
];

// Stage color mapping for heatmap
export function stageAvgColor(avg: number): string {
  if (avg < 0.5) return '#E0E0E0';
  if (avg < 1.5) return '#FFCDD2';
  if (avg < 2.5) return '#FFCC80';
  if (avg < 3.5) return '#FFF59D';
  if (avg < 4.5) return '#C8E6C9';
  if (avg < 5.5) return '#81C784';
  if (avg < 6.5) return '#4CAF50';
  return '#15804D';
}

export function stageAvgTextColor(avg: number): string {
  return avg >= 5.5 ? '#FFFFFF' : '#1A1A1A';
}

export const STAGE_COLORS = [
  '#E0E0E0', '#FFCDD2', '#FFCC80', '#FFF59D',
  '#C8E6C9', '#81C784', '#4CAF50', '#15804D',
];
