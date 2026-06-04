<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmramIndicator extends Model
{
    protected $fillable = [
        'stage', 'indicator_code', 'text', 'bukti_hint', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'stage'      => 'integer',
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

    public function emramStage()
    {
        return $this->belongsTo(EmramStage::class, 'stage', 'stage');
    }
}