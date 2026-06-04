<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('emram_assessments', function (Blueprint $table) {
            // Kolom untuk tracking sinkronisasi draft dari RS ke Dinkes
            if (!Schema::hasColumn('emram_assessments', 'is_synced')) {
                $table->boolean('is_synced')->default(false)->after('tanggal_assessment')->comment('Indicates if assessment draft is synced to Dinkes');
            }

            if (!Schema::hasColumn('emram_assessments', 'synced_at')) {
                $table->timestamp('synced_at')->nullable()->after('is_synced')->comment('Timestamp when assessment was first synced to Dinkes');
            }

            // Kolom untuk tracking penguncian stage yang sudah terverifikasi
            if (!Schema::hasColumn('emram_assessments', 'is_locked')) {
                $table->boolean('is_locked')->default(false)->after('synced_at')->comment('Indicates if assessment is locked after verification');
            }

            if (!Schema::hasColumn('emram_assessments', 'locked_at')) {
                $table->timestamp('locked_at')->nullable()->after('is_locked')->comment('Timestamp when assessment was locked');
            }
        });
    }

    public function down(): void
    {
        Schema::table('emram_assessments', function (Blueprint $table) {
            $table->dropColumnIfExists('is_synced');
            $table->dropColumnIfExists('synced_at');
            $table->dropColumnIfExists('is_locked');
            $table->dropColumnIfExists('locked_at');
        });
    }
};
