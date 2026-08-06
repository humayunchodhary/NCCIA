<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnquiryWitness extends Model
{
    protected $fillable = [
        'enquiry_id',
        'name',
        'cnic',
        'nationality',
        'passport',
        'address',
        'attachment',
    ];

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }
}