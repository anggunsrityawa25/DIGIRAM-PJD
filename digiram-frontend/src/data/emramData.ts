export const EMRAM_INDICATORS: Record<number, { title: string; items: { id: string; text: string; buktiHint: string }[] }> = {
  0: {
    title: 'Stage 0 — Pra-Implementasi',
    items: [
      { id: 's0i1', text: 'Modul laboratorium tersedia dalam SIMRS', buktiHint: 'Screenshot modul LIS' },
      { id: 's0i2', text: 'Modul farmasi tersedia dalam SIMRS', buktiHint: 'Screenshot modul farmasi' },
      { id: 's0i3', text: 'Modul radiologi tersedia dalam SIMRS', buktiHint: 'Screenshot modul radiologi' },
    ],
  },
  1: {
    title: 'Stage 1 — Ancillary Systems',
    items: [
      { id: 's1i1', text: 'Modul laboratorium sudah terimplementasi dan digunakan', buktiHint: 'Laporan penggunaan LIS' },
      { id: 's1i2', text: 'Modul farmasi sudah terimplementasi dan digunakan', buktiHint: 'Laporan operasional farmasi' },
      { id: 's1i3', text: 'Modul radiologi sudah terimplementasi (belum wajib DICOM/PACS)', buktiHint: 'Screenshot RIS / modul radiologi' },
    ],
  },
  2: {
    title: 'Stage 2 — CDR & Interoperabilitas Internal',
    items: [
      { id: 's2i1', text: 'Data pasien terintegrasi (lab, radiologi, obat dalam satu tampilan)', buktiHint: 'Screenshot tampilan CDR terpadu' },
      { id: 's2i2', text: 'Riwayat pasien dapat ditelusuri lintas unit', buktiHint: 'Video/screenshot demonstrasi penelusuran' },
      { id: 's2i3', text: 'Ada manajemen user dan hak akses', buktiHint: 'Screenshot panel manajemen user' },
      { id: 's2i4', text: 'Ada fitur keamanan dasar (login, password)', buktiHint: 'Screenshot halaman login / kebijakan password' },
      { id: 's2i5', text: 'Tersedia terminologi medis terkontrol (ICD-10/LOINC/SNOMED CT/DICOM)', buktiHint: 'Laporan penggunaan koding standar' },
      { id: 's2i6', text: 'Tersedia document imaging', buktiHint: 'Screenshot fitur document imaging dalam SIMRS' },
    ],
  },
  3: {
    title: 'Stage 3 — Dokumentasi Klinis & e-Prescribing',
    items: [
      { id: 's3i1', text: 'Dokumentasi asuhan keperawatan tersedia dalam sistem', buktiHint: 'Screenshot formulir asuhan keperawatan elektronik' },
      { id: 's3i2', text: 'Sistem peresepan elektronik (e-prescribing) terimplementasi', buktiHint: 'Screenshot modul e-prescribing' },
      { id: 's3i3', text: 'Dokumentasi asuhan keperawatan terisi', buktiHint: 'Laporan persentase pengisian dokumentasi keperawatan' },
      { id: 's3i4', text: 'Tersedia Clinical Decision Support System (CDSS) meliputi sistem peringatan interaksi obat dengan obat, obat dengan makanan, dan obat dengan hasil lab', buktiHint: 'Screenshot alert CDSS interaksi obat' },
      { id: 's3i5', text: 'PACS tersedia di luar bagian radiologi (dapat diakses/dilihat petugas lain)', buktiHint: 'Screenshot akses PACS dari unit non-radiologi' },
      { id: 's3i6', text: 'Terimplementasi sistem kontrol akses berbasis peran (RBAC)', buktiHint: 'Screenshot konfigurasi RBAC dalam SIMRS' },
    ],
  },
  4: {
    title: 'Stage 4 — CPOE & Clinical Decision Support',
    items: [
      { id: 's4i1', text: 'Dokter melakukan order atau permintaan pemeriksaan penunjang secara elektronik', buktiHint: 'Screenshot CPOE order lab/radiologi' },
      { id: 's4i2', text: 'Tersedianya sistem pendukung keputusan klinis (CDS) sederhana', buktiHint: 'Screenshot CDS aktif saat order' },
      { id: 's4i3', text: 'Resep diinputkan dokter secara elektronik', buktiHint: 'Screenshot e-prescribing oleh dokter' },
      { id: 's4i4', text: 'Order pemeriksaan penunjang diinputkan secara elektronik', buktiHint: 'Laporan penggunaan CPOE penunjang' },
      { id: 's4i5', text: 'Tenaga kesehatan memiliki akses database pasien regional atau nasional untuk decision making pengobatan, medical imaging, imunisasi, dan hasil lab', buktiHint: 'Screenshot akses data pasien regional/nasional' },
    ],
  },
  5: {
    title: 'Stage 5 — Dokumentasi Dokter & Keamanan Lanjutan',
    items: [
      { id: 's5i1', text: 'Tersedia dokumentasi dokter (catatan perkembangan, konsultasi, ringkasan pulang, daftar diagnosis, dan lainnya) menggunakan template yang terstruktur dan data diskrit untuk 50% dari lingkup rumah sakit', buktiHint: 'Laporan persentase e-documentation dokter' },
      { id: 's5i2', text: 'Ada sistem pencegahan intrusi/keamanan akses tingkat lanjut (IDS/IPS)', buktiHint: 'Dokumentasi instalasi IDS/IPS' },
      { id: 's5i3', text: 'Terimplementasi operasi di jaringan dan remote wiping (kemampuan penghapusan data jarak jauh) saat terjadi pencurian data', buktiHint: 'Kebijakan dan dokumentasi teknis remote wiping' },
      { id: 's5i4', text: 'Terdapat fitur audit trail', buktiHint: 'Screenshot log audit trail dalam sistem' },
    ],
  },
  6: {
    title: 'Stage 6 — Closed-Loop Administration',
    items: [
      { id: 's6i1', text: 'Peresepan dan pemberian obat kepada pasien tercatat secara elektronik', buktiHint: 'Screenshot MAR elektronik' },
      { id: 's6i2', text: 'Terdapat verifikasi identitas pasien dan obat yang diberikan secara elektronik', buktiHint: 'Foto/video scanning barcode pasien + obat' },
      { id: 's6i3', text: 'Permintaan transfusi darah diinputkan ke dalam sistem', buktiHint: 'Screenshot order transfusi elektronik' },
      { id: 's6i4', text: 'Terdapat verifikasi identitas pasien dan kantong darah secara elektronik sebelum transfusi dilakukan', buktiHint: 'Foto/video scanning kantong darah + gelang pasien' },
      { id: 's6i5', text: 'Instruksi pemberian ASI diinputkan ke dalam sistem', buktiHint: 'Screenshot instruksi ASI dalam SIMRS' },
      { id: 's6i6', text: 'Terdapat verifikasi identitas bayi dan ibu secara elektronik sebelum ASI diberikan', buktiHint: 'Foto/video verifikasi identitas bayi-ibu' },
      { id: 's6i7', text: 'Spesimen pemeriksaan penunjang memiliki identitas unik dan dapat dilacak statusnya (diambil, diproses, hasil)', buktiHint: 'Screenshot tracking spesimen dalam sistem LIS' },
    ],
  },
  7: {
    title: 'Stage 7 — Paperless & HIE Penuh',
    items: [
      { id: 's7i1', text: 'Kelengkapan pengisian dokumentasi klinis secara elektronik mencapai 90%', buktiHint: 'Laporan persentase kelengkapan RM elektronik' },
      { id: 's7i2', text: 'Pelaksanaan CPOE melalui sistem elektronik mencapai 90%', buktiHint: 'Laporan penggunaan CPOE keseluruhan' },
      { id: 's7i3', text: 'Pelaksanaan closed-loop administration mencapai 95%', buktiHint: 'Laporan pelaksanaan closed-loop' },
      { id: 's7i4', text: 'Sistem telah terintegrasi penuh dengan SATUSEHAT', buktiHint: 'Laporan sinkronisasi data ke SATUSEHAT' },
      { id: 's7i5', text: 'Terdapat fitur disaster recovery/backup pada server terpisah', buktiHint: 'Dokumentasi konfigurasi DR/backup' },
    ],
  },
};

// Jumlah indikator per stage (total keseluruhan = 39)
export const STAGE_INDICATOR_COUNTS: Record<number, number> = {
  0: 3,
  1: 3,
  2: 6,
  3: 6,
  4: 5,
  5: 4,
  6: 7,
  7: 5,
};

// Skor kumulatif hingga stage N (jumlah indikator dari stage 0 s.d. N)
export const STAGE_CUMULATIVE_SCORES: Record<number, number> = {
  0: 3,
  1: 6,
  2: 12,
  3: 18,
  4: 23,
  5: 27,
  6: 34,
  7: 39,
};

const TOTAL_INDICATORS = 39;

/**
 * Hitung persentase skor EMRAM berdasarkan stage terakhir yang diverifikasi.
 * Rumus: skor_kumulatif_hingga_stage_terakhir / 39 * 100
 */
export function calcEmramScoreByStage(stage: number): number {
  const cumulative = STAGE_CUMULATIVE_SCORES[stage] ?? 0;
  return Math.round((cumulative / TOTAL_INDICATORS) * 100);
}

/**
 * Deteksi stage tertinggi yang jawaban-nya sudah diisi (ada emramAnswers untuk stage itu).
 */
export function detectHighestFilledStage(emramAnswers: Record<string, string> | undefined): number {
  if (!emramAnswers) return -1;
  for (let s = 7; s >= 0; s--) {
    const stageItems = EMRAM_INDICATORS[s]?.items ?? [];
    const hasAny = stageItems.some(item => emramAnswers[item.id] != null);
    if (hasAny) return s;
  }
  return -1;
}

export function isTerpenuhiFromAnswers(
  stageNum: number,
  idx: number,
  emramAnswers: Record<string, 'yes' | 'partial' | 'no'> | undefined,
  currentStage: number,
  totalScore: number
): boolean {
  if (stageNum < currentStage) return true;
  if (emramAnswers) {
    const itemId = EMRAM_INDICATORS[stageNum]?.items[idx]?.id;
    if (itemId) {
      const answer = emramAnswers[itemId];
      return answer === 'yes' || answer === 'partial';
    }
  }
  const thresholds = [45, 58, 68, 78];
  return totalScore >= (thresholds[idx] ?? 70);
}

export function toRSPYCode(id: string): string {
  const num = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return `RSPY${String(num).padStart(3, '0')}`;
}
