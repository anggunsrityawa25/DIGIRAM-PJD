<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\EmramIndicator;

class EmramStage extends Model
{
    protected $primaryKey = 'stage';
    protected $keyType    = 'int';
    public $incrementing  = false;

    protected $fillable = ['stage', 'title', 'description', 'sort_order', 'is_active'];

    protected $casts = [
        'stage'      => 'integer',
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

    public function indicators()
    {
        return $this->hasMany(EmramIndicator::class, 'stage', 'stage')
                    ->orderBy('sort_order')
                    ->orderBy('id');
    }

    public function activeIndicators()
    {
        return $this->hasMany(EmramIndicator::class, 'stage', 'stage')
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('id');
    }
}