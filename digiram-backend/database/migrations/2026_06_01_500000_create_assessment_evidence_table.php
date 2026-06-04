<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('assessment_evidence')) {
            Schema::create('assessment_evidence', function (Blueprint $table) {
                $table->id();
                $table->foreignId('assessment_id')->constrained('emram_assessments')->onDelete('cascade');
                $table->string('indicator_id')->comment('Indicator number (e.g., 0_1, 1_2, etc.)');
                $table->string('file_name')->comment('Original file name');
                $table->string('file_path')->comment('Path in storage/app/assessments/');
                $table->string('file_type')->nullable()->comment('MIME type (image/jpeg, application/pdf, etc.)');
                $table->bigInteger('file_size')->nullable()->comment('File size in bytes');
                $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
                $table->text('notes')->nullable()->comment('Description of the evidence');
                $table->timestamps();

                // Indexes for common queries
                $table->index(['assessment_id', 'indicator_id']);
                $table->index('uploaded_by');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_evidence');
    }
};
