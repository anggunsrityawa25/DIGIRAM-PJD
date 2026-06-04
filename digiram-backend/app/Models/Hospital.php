<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'province',
        'type',
        'bed_capacity',
        'current_emram_stage',
        'last_assessment_date',
    ];

    protected $casts = [
        'bed_capacity'         => 'integer',
        'current_emram_stage'  => 'integer',
        'last_assessment_date' => 'date:d/m/Y',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function assessments()
    {
        return $this->hasMany(EmramAssessment::class, 'user_id', 'id');
    }
}