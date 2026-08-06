<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseActivity extends Model
{
    protected $fillable = [
        'case_id',
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

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
