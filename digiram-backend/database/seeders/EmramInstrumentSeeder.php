<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmramStage;
use App\Models\EmramIndicator;

class EmramInstrumentSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            0 => [
                'title'       => 'Stage 0 — Pra-Implementasi',
                'description' => 'Modul-modul dasar tersedia dalam SIMRS namun belum terimplementasi.',
                'items' => [
                    ['s0i1', 'Modul laboratorium tersedia dalam SIMRS', 'Screenshot modul LIS'],
                    ['s0i2', 'Modul farmasi tersedia dalam SIMRS', 'Screenshot modul farmasi'],
                    ['s0i3', 'Modul radiologi tersedia dalam SIMRS', 'Screenshot modul radiologi'],
                ],
            ],
            1 => [
                'title'       => 'Stage 1 — Ancillary Systems',
                'description' => 'Sistem penunjang (lab, farmasi, radiologi) sudah terimplementasi dan digunakan.',
                'items' => [
                    ['s1i1', 'Modul laboratorium sudah terimplementasi dan digunakan', 'Laporan penggunaan LIS'],
                    ['s1i2', 'Modul farmasi sudah terimplementasi dan digunakan', 'Laporan operasional farmasi'],
                    ['s1i3', 'Modul radiologi sudah terimplementasi (belum wajib DICOM/PACS)', 'Screenshot RIS / modul radiologi'],
                ],
            ],
            2 => [
                'title'       => 'Stage 2 — CDR & Interoperabilitas Internal',
                'description' => 'Data pasien terintegrasi dalam Clinical Data Repository (CDR).',
                'items' => [
                    ['s2i1', 'Data pasien terintegrasi (lab, radiologi, obat dalam satu tampilan)', 'Screenshot tampilan CDR terpadu'],
                    ['s2i2', 'Riwayat pasien dapat ditelusuri lintas unit', 'Video/screenshot demonstrasi penelusuran'],
                    ['s2i3', 'Ada manajemen user dan hak akses', 'Screenshot panel manajemen user'],
                    ['s2i4', 'Ada fitur keamanan dasar (login, password)', 'Screenshot halaman login / kebijakan password'],
                    ['s2i5', 'Tersedia terminologi medis terkontrol (ICD-10/LOINC/SNOMED CT/DICOM)', 'Laporan penggunaan koding standar'],
                    ['s2i6', 'Tersedia document imaging', 'Screenshot fitur document imaging dalam SIMRS'],
                ],
            ],
            3 => [
                'title'       => 'Stage 3 — Dokumentasi Klinis & e-Prescribing',
                'description' => 'Dokumentasi asuhan klinis dan peresepan elektronik tersedia.',
                'items' => [
                    ['s3i1', 'Dokumentasi asuhan keperawatan tersedia dalam sistem', 'Screenshot formulir asuhan keperawatan elektronik'],
                    ['s3i2', 'Sistem peresepan elektronik (e-prescribing) terimplementasi', 'Screenshot modul e-prescribing'],
                    ['s3i3', 'Dokumentasi asuhan keperawatan terisi', 'Laporan persentase pengisian dokumentasi keperawatan'],
                    ['s3i4', 'Tersedia Clinical Decision Support System (CDSS) meliputi sistem peringatan interaksi obat dengan obat, obat dengan makanan, dan obat dengan hasil lab', 'Screenshot alert CDSS interaksi obat'],
                    ['s3i5', 'PACS tersedia di luar bagian radiologi (dapat diakses/dilihat petugas lain)', 'Screenshot akses PACS dari unit non-radiologi'],
                    ['s3i6', 'Terimplementasi sistem kontrol akses berbasis peran (RBAC)', 'Screenshot konfigurasi RBAC dalam SIMRS'],
                ],
            ],
            4 => [
                'title'       => 'Stage 4 — CPOE & Clinical Decision Support',
                'description' => 'Order klinis dan keputusan pendukung dilakukan secara elektronik.',
                'items' => [
                    ['s4i1', 'Dokter melakukan order atau permintaan pemeriksaan penunjang secara elektronik', 'Screenshot CPOE order lab/radiologi'],
                    ['s4i2', 'Tersedianya sistem pendukung keputusan klinis (CDS) sederhana', 'Screenshot CDS aktif saat order'],
                    ['s4i3', 'Resep diinputkan dokter secara elektronik', 'Screenshot e-prescribing oleh dokter'],
                    ['s4i4', 'Order pemeriksaan penunjang diinputkan secara elektronik', 'Laporan penggunaan CPOE penunjang'],
                    ['s4i5', 'Tenaga kesehatan memiliki akses database pasien regional atau nasional untuk decision making pengobatan, medical imaging, imunisasi, dan hasil lab', 'Screenshot akses data pasien regional/nasional'],
                ],
            ],
            5 => [
                'title'       => 'Stage 5 — Dokumentasi Dokter & Keamanan Lanjutan',
                'description' => 'Dokumentasi dokter terstruktur dan keamanan sistem tingkat lanjut.',
                'items' => [
                    ['s5i1', 'Tersedia dokumentasi dokter (catatan perkembangan, konsultasi, ringkasan pulang, daftar diagnosis, dan lainnya) menggunakan template yang terstruktur dan data diskrit untuk 50% dari lingkup rumah sakit', 'Laporan persentase e-documentation dokter'],
                    ['s5i2', 'Ada sistem pencegahan intrusi/keamanan akses tingkat lanjut (IDS/IPS)', 'Dokumentasi instalasi IDS/IPS'],
                    ['s5i3', 'Terimplementasi operasi di jaringan dan remote wiping (kemampuan penghapusan data jarak jauh) saat terjadi pencurian data', 'Kebijakan dan dokumentasi teknis remote wiping'],
                    ['s5i4', 'Terdapat fitur audit trail', 'Screenshot log audit trail dalam sistem'],
                ],
            ],
            6 => [
                'title'       => 'Stage 6 — Closed-Loop Administration',
                'description' => 'Administrasi obat, darah, dan ASI terverifikasi secara elektronik.',
                'items' => [
                    ['s6i1', 'Peresepan dan pemberian obat kepada pasien tercatat secara elektronik', 'Screenshot MAR elektronik'],
                    ['s6i2', 'Terdapat verifikasi identitas pasien dan obat yang diberikan secara elektronik', 'Foto/video scanning barcode pasien + obat'],
                    ['s6i3', 'Permintaan transfusi darah diinputkan ke dalam sistem', 'Screenshot order transfusi elektronik'],
                    ['s6i4', 'Terdapat verifikasi identitas pasien dan kantong darah secara elektronik sebelum transfusi dilakukan', 'Foto/video scanning kantong darah + gelang pasien'],
                    ['s6i5', 'Instruksi pemberian ASI diinputkan ke dalam sistem', 'Screenshot instruksi ASI dalam SIMRS'],
                    ['s6i6', 'Terdapat verifikasi identitas bayi dan ibu secara elektronik sebelum ASI diberikan', 'Foto/video verifikasi identitas bayi-ibu'],
                    ['s6i7', 'Spesimen pemeriksaan penunjang memiliki identitas unik dan dapat dilacak statusnya (diambil, diproses, hasil)', 'Screenshot tracking spesimen dalam sistem LIS'],
                ],
            ],
            7 => [
                'title'       => 'Stage 7 — Paperless & HIE Penuh',
                'description' => 'Rekam medis elektronik penuh dan integrasi Health Information Exchange.',
                'items' => [
                    ['s7i1', 'Kelengkapan pengisian dokumentasi klinis secara elektronik mencapai 90%', 'Laporan persentase kelengkapan RM elektronik'],
                    ['s7i2', 'Pelaksanaan CPOE melalui sistem elektronik mencapai 90%', 'Laporan penggunaan CPOE keseluruhan'],
                    ['s7i3', 'Pelaksanaan closed-loop administration mencapai 95%', 'Laporan pelaksanaan closed-loop'],
                    ['s7i4', 'Sistem telah terintegrasi penuh dengan SATUSEHAT', 'Laporan sinkronisasi data ke SATUSEHAT'],
                    ['s7i5', 'Terdapat fitur disaster recovery/backup pada server terpisah', 'Dokumentasi konfigurasi DR/backup'],
                ],
            ],
        ];

        foreach ($data as $stageNum => $stageDef) {
            $stage = EmramStage::updateOrCreate(
                ['stage' => $stageNum],
                [
                    'title'       => $stageDef['title'],
                    'description' => $stageDef['description'],
                    'sort_order'  => $stageNum,
                    'is_active'   => true,
                ]
            );

            foreach ($stageDef['items'] as $idx => [$code, $text, $hint]) {
                EmramIndicator::updateOrCreate(
                    ['stage' => $stageNum, 'indicator_code' => $code],
                    [
                        'text'       => $text,
                        'bukti_hint' => $hint,
                        'sort_order' => $idx + 1,
                        'is_active'  => true,
                    ]
                );
            }
        }
    }
}