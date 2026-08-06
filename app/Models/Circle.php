<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Circle extends Model
{
    protected $fillable = ['name', 'code', 'zone_id'];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }
}
