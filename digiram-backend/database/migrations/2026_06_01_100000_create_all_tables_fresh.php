<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. HOSPITALS ──────────────────────────────────────────────────────
        if (!Schema::hasTable('hospitals')) {
            Schema::create('hospitals', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('address')->nullable();
                $table->string('city')->nullable();
                $table->string('province')->nullable();
                $table->string('type', 50)->nullable();
                $table->integer('bed_capacity')->nullable();
                $table->tinyInteger('current_emram_stage')->default(0);
                $table->date('last_assessment_date')->nullable();
                $table->timestamps();
            });
        }

        // ── 2. CACHE ─────────────────────────────────────────────────────────
        if (!Schema::hasTable('cache')) {
            Schema::create('cache', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->mediumText('value');
                $table->integer('expiration');
            });
        }

        if (!Schema::hasTable('cache_locks')) {
            Schema::create('cache_locks', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->string('owner');
                $table->integer('expiration');
            });
        }

        // ── 3. USERS ─────────────────────────────────────────────────────────
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('role')->default('hospital'); // hospital | health_office
                $table->foreignId('hospital_id')->nullable()->constrained('hospitals')->onDelete('cascade');
                $table->rememberToken();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }

        // ── 4. JOBS ─────────────────────────────────────────────────────────
        if (!Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->id();
                $table->string('queue')->index();
                $table->longText('payload');
                $table->unsignedTinyInteger('attempts');
                $table->unsignedInteger('reserved_at')->nullable();
                $table->unsignedInteger('available_at');
                $table->unsignedInteger('created_at');
            });
        }

        if (!Schema::hasTable('job_batches')) {
            Schema::create('job_batches', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('name');
                $table->integer('total_jobs');
                $table->integer('pending_jobs');
                $table->integer('failed_jobs');
                $table->longText('failed_job_ids');
                $table->mediumText('options')->nullable();
                $table->integer('cancelled_at')->nullable();
                $table->integer('created_at');
                $table->integer('finished_at')->nullable();
            });
        }

        if (!Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->text('connection');
                $table->text('queue');
                $table->longText('payload');
                $table->longText('exception');
                $table->timestamp('failed_at')->useCurrent();
            });
        }

        // ── 5. PERSONAL ACCESS TOKENS (Sanctum) ─────────────────────────────
        if (!Schema::hasTable('personal_access_tokens')) {
            Schema::create('personal_access_tokens', function (Blueprint $table) {
                $table->id();
                $table->morphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        // ── 6. EMRAM ASSESSMENTS ─────────────────────────────────────────────
        if (!Schema::hasTable('emram_assessments')) {
            Schema::create('emram_assessments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');

                // Data PIC (pemilik akun yang mengisi)
                $table->string('pic_name')->nullable();
                $table->string('pic_email')->nullable();

                // Koordinator RME (bisa berbeda dengan pemilik akun)
                $table->string('koordinator_rme')->nullable();
                $table->string('koordinator_email')->nullable();

                // Vendor & sistem RME
                $table->string('vendor_simrs')->nullable();
                $table->string('nama_sistem_rme')->nullable();

                // Periode & Jawaban
                $table->string('periode')->nullable();
                $table->json('answers')->nullable();
                $table->json('evidence_files')->nullable();
                $table->json('evidence_notes')->nullable();

                // Hasil & Status
                $table->tinyInteger('target_stage')->nullable();  // stage yang RS ajukan
                $table->tinyInteger('stage_result')->nullable();  // stage hasil verifikasi dinkes
                $table->string('status')->default('draft');
                $table->timestamp('tanggal_assessment')->nullable();
                $table->timestamp('submitted_at')->nullable();

                // Verifikasi Dinkes
                $table->text('verification_notes')->nullable();
                $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();

                // Verifikasi Tahap 1: Tinjau Laporan
                $table->string('tinjau_keputusan')->nullable();
                $table->text('tinjau_catatan')->nullable();

                // Verifikasi Tahap 2: Kunjungi RS
                $table->string('pic_dinkes')->nullable();
                $table->date('tanggal_kunjungan')->nullable();
                $table->json('temuan_per_stage')->nullable();
                $table->json('keputusan_per_stage')->nullable();
                $table->text('catatan_kunjungan')->nullable();

                // Verifikasi Tahap 3: Keputusan Akhir
                $table->string('keputusan_akhir')->nullable();
                $table->text('catatan_akhir')->nullable();
                $table->timestamp('verified_at')->nullable();

                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('emram_assessments');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('hospitals');
    }
};
