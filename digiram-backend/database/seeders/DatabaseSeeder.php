<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Hospital;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. DATA RUMAH SAKIT (lengkap dengan semua kolom)
        // ==========================================
        $hospitals = [
            [
                'name'                 => 'RS PAPYRUS',
                'address'              => 'Gedung Isoreksohdiprojo, Sekolah Vokasi UGM',
                'city'                 => 'Sleman',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'General',
                'bed_capacity'         => 145,
                'current_emram_stage'  => 4,
                'last_assessment_date' => '2026-02-15',
            ],
            [
                'name'                 => 'RSUP Dr. Sardjito',
                'address'              => 'Jalan Kesehatan Nomor 1, Sekip, Sinduadi, Mlati',
                'city'                 => 'Sleman',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Pendidikan',
                'bed_capacity'         => 850,
                'current_emram_stage'  => 5,
                'last_assessment_date' => '2026-01-10',
            ],
            [
                'name'                 => 'RS Bethesda Yogyakarta',
                'address'              => 'Jl. Jend. Sudirman No.70, Kotabaru, Gondokusuman',
                'city'                 => 'Kota Yogyakarta',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 430,
                'current_emram_stage'  => 3,
                'last_assessment_date' => '2025-11-20',
            ],
            [
                'name'                 => 'RSUD Panembahan Senopati',
                'address'              => 'Jl. Dr. Wahidin Sudiro Husodo, Trirenggo, Bantul',
                'city'                 => 'Bantul',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 310,
                'current_emram_stage'  => 2,
                'last_assessment_date' => '2025-09-05',
            ],
            [
                'name'                 => 'RS PKU Muhammadiyah Yogyakarta',
                'address'              => 'Jl. KH. Ahmad Dahlan No.20, Ngupasan, Gondomanan',
                'city'                 => 'Kota Yogyakarta',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 280,
                'current_emram_stage'  => 3,
                'last_assessment_date' => '2025-12-01',
            ],
            [
                'name'                 => 'RS Panti Rapih',
                'address'              => 'Jl. Cik Di Tiro No.30, Samirono, Terban, Gondokusuman',
                'city'                 => 'Kota Yogyakarta',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 420,
                'current_emram_stage'  => 4,
                'last_assessment_date' => '2026-03-12',
            ],
            [
                'name'                 => 'RSUD Sleman',
                'address'              => 'Jl. Bhayangkara No.48, Temulawak, Triharjo',
                'city'                 => 'Sleman',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 200,
                'current_emram_stage'  => 0,  // Baru, belum pernah audit
                'last_assessment_date' => null,
            ],
            [
                'name'                 => 'RS JIH Yogyakarta',
                'address'              => 'Jl. Ring Road Utara No.160, Condongcatur, Depok',
                'city'                 => 'Sleman',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 190,
                'current_emram_stage'  => 1,
                'last_assessment_date' => '2025-08-14',
            ],
            [
                'name'                 => 'RSUD Wates',
                'address'              => 'Jl. Tentara Pelajar No. 5, Beji, Wates',
                'city'                 => 'Kulon Progo',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 175,
                'current_emram_stage'  => 1,
                'last_assessment_date' => '2025-10-22',
            ],
            [
                'name'                 => 'RSUD Wonosari',
                'address'              => 'Jl. Taman Bakti No.6, Purbosari, Wonosari',
                'city'                 => 'Gunungkidul',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 160,
                'current_emram_stage'  => 1,
                'last_assessment_date' => '2025-11-08',
            ],
            [
                'name'                 => 'RS Hermina Yogyakarta',
                'address'              => 'Jl. Selokan Mataram RT 06/RW 50, Maguwoharjo, Depok',
                'city'                 => 'Sleman',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 200,
                'current_emram_stage'  => 2,
                'last_assessment_date' => '2025-12-18',
            ],
            [
                'name'                 => 'RSUD Kota Yogyakarta',
                'address'              => 'Jl. Wirosaban No.1, Sorosutan, Umbulharjo',
                'city'                 => 'Kota Yogyakarta',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Umum',
                'bed_capacity'         => 240,
                'current_emram_stage'  => 2,
                'last_assessment_date' => '2025-10-30',
            ],
            [
                'name'                 => 'RSKIA Sadewa',
                'address'              => 'Jl. Babarsari Blok TB 16 No. 13B, Caturtunggal, Depok',
                'city'                 => 'Sleman',
                'province'             => 'Daerah Istimewa Yogyakarta',
                'type'                 => 'Khusus Ibu & Anak',
                'bed_capacity'         => 80,
                'current_emram_stage'  => 1,
                'last_assessment_date' => '2025-09-25',
            ],
        ];

        foreach ($hospitals as $hospital) {
            Hospital::firstOrCreate(['name' => $hospital['name']], $hospital);
        }

        // ==========================================
        // 2. AKUN PENGGUNA
        // ==========================================

        // Akun RS PAPYRUS (sudah berpengalaman, stage 4)
        $papyrus = Hospital::where('name', 'RS PAPYRUS')->first();
        if ($papyrus) {
            User::firstOrCreate(
                ['email' => 'rspapyrus@digiram.com'],
                [
                    'name'        => 'dr. Rizki Pratama, Sp.PD',
                    'password'    => Hash::make('rspapyrus123'),
                    'role'        => 'hospital',
                    'hospital_id' => $papyrus->id,
                ]
            );
        }

        // ── AKUN BARU: RSUD Sleman (baru pertama kali audit, stage 0) ──
        // Persyaratan No. 2: Staf RS dari rumah sakit lain yang belum pernah audit
        // Saat login dan klik "Mulai Audit", langsung diarahkan ke Stage 0
        $sleman = Hospital::where('name', 'RSUD Sleman')->first();
        if ($sleman) {
            User::firstOrCreate(
                ['email' => 'rsud.sleman@digiram.com'],
                [
                    'name'        => 'dr. Sari Dewi Kusuma',
                    'password'    => Hash::make('sleman2026'),
                    'role'        => 'hospital',
                    'hospital_id' => $sleman->id,
                ]
            );
        }

        // Akun Admin Dinkes (untuk verifikasi)
        User::firstOrCreate(
            ['email' => 'admin@digiram.com'],
            [
                'name'        => 'Admin Dinas Kesehatan',
                'password'    => Hash::make('password123'),
                'role'        => 'health_office',
                'hospital_id' => null,
            ]
        );

        // ==========================================
        // 3. INSTRUMEN EMRAM (Stage & Indikator)
        // ==========================================
        $this->call(EmramInstrumentSeeder::class);
    }
}
