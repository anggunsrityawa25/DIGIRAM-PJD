<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ubah kolom stage_result dari tinyInteger ke smallInteger
     * agar bisa menyimpan nilai persentase 0-100.
     * tinyInteger hanya -128 s/d 127 (masih cukup), tapi smallInteger lebih eksplisit.
     */
    public function up(): void
    {
        Schema::table('emram_assessments', function (Blueprint $table) {
            $table->smallInteger('stage_result')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('emram_assessments', function (Blueprint $table) {
            $table->tinyInteger('stage_result')->nullable()->change();
        });
    }
};
