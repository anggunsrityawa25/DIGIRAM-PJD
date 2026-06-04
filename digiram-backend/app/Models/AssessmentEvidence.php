<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentEvidence extends Model
{
    use HasFactory;

    protected $table = 'assessment_evidence';

    protected $fillable = [
        'assessment_id',
        'indicator_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function assessment()
    {
        return $this->belongsTo(EmramAssessment::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the full file URL for download/preview
     */
    public function getFileUrl()
    {
        return route('assessment.evidence.download', $this->id);
    }
}
