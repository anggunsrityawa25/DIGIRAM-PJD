<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah kolom target_stage jika belum ada
        if (!Schema::hasColumn('emram_assessments', 'target_stage')) {
            Schema::table('emram_assessments', function (Blueprint $table) {
                $table->tinyInteger('target_stage')->nullable()->after('evidence_notes');
            });

            // Migrasi data lama: isi target_stage dari stage_result yang sudah ada
            // (data lama: stage_result = target stage RS, sebelum verifikasi)
            DB::statement('UPDATE emram_assessments SET target_stage = stage_result WHERE target_stage IS NULL AND stage_result IS NOT NULL');

            // Untuk assessment yang sudah verified (reviewed/rejected), stage_result tetap
            // Untuk assessment yang belum verified (submitted/under_review/draft), kosongkan stage_result
            DB::statement("UPDATE emram_assessments SET stage_result = NULL WHERE status IN ('draft','submitted','under_review')");
        }
    }

    public function down(): void
    {
        Schema::table('emram_assessments', function (Blueprint $table) {
            $table->dropColumn('target_stage');
        });
    }
};
