<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnquiryActivity extends Model
{
    protected $fillable = [
        'enquiry_id',
        'type',
        'description',
        'activity_date',
        'attachment_path',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'activity_date' => 'date:Y-m-d',
        ];
    }

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
