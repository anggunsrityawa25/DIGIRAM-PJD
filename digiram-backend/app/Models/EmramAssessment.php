<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmramAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        // Informasi PIC (pemilik akun yang mengisi)
        'pic_name',
        'pic_email',
        // Koordinator RME (orang yang bertanggung jawab di lapangan, bisa berbeda)
        'koordinator_rme',
        'koordinator_email',
        // Vendor & sistem RME
        'vendor_simrs',
        'nama_sistem_rme',
        // Data periode & jawaban
        'periode',
        'answers',
        'evidence_files',
        'evidence_notes',
        // Hasil
        'target_stage',
        'stage_result',
        'status',
        'tanggal_assessment',
        'submitted_at',
        // Sinkronisasi & Penguncian
        'is_synced',
        'synced_at',
        'is_locked',
        'locked_at',
        // Verifikasi Dinkes
        'verification_notes',
        'reviewer_id',
        // Field verifikasi 3 tahap
        'tinjau_keputusan',
        'tinjau_catatan',
        'pic_dinkes',
        'tanggal_kunjungan',
        'temuan_per_stage',
        'keputusan_per_stage',
        'catatan_kunjungan',
        'keputusan_akhir',
        'catatan_akhir',
        'verified_at',
    ];

    protected $casts = [
        'answers'             => 'array',
        'evidence_files'      => 'array',
        'evidence_notes'      => 'array',
        'temuan_per_stage'    => 'array',
        'keputusan_per_stage' => 'array',
        'tanggal_assessment'  => 'datetime',
        'submitted_at'        => 'datetime',
        'synced_at'           => 'datetime',
        'is_synced'           => 'boolean',
        'is_locked'           => 'boolean',
        'locked_at'           => 'datetime',
        'verified_at'         => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function evidence()
    {
        return $this->hasMany(AssessmentEvidence::class);
    }
}