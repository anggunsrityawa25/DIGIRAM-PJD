<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── MASTER STAGE EMRAM ──────────────────────────────────────────────
        if (!Schema::hasTable('emram_stages')) {
            Schema::create('emram_stages', function (Blueprint $table) {
                $table->tinyInteger('stage')->primary(); // 0–7
                $table->string('title');                 // "Stage 0 — Pra-Implementasi"
                $table->text('description')->nullable(); // deskripsi singkat stage
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // ── MASTER INDIKATOR EMRAM ───────────────────────────────────────────
        if (!Schema::hasTable('emram_indicators')) {
            Schema::create('emram_indicators', function (Blueprint $table) {
                $table->id();
                $table->tinyInteger('stage')
                      ->references('stage')->on('emram_stages')
                      ->onDelete('cascade');
                $table->string('indicator_code', 20); // e.g. "s0i1", "s3i4"
                $table->text('text');                  // isi teks indikator
                $table->text('bukti_hint')->nullable(); // hint bukti
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['stage', 'indicator_code']);
                $table->index('stage');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('emram_indicators');
        Schema::dropIfExists('emram_stages');
    }
};