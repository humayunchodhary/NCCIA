<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationReport extends Model
{
    protected $fillable = [
        'complaint_id',
        'tracking_no',
        'assignment_date',
        'verification_date',
        'victim_name',
        'victim_father_name',
        'victim_occupation',
        'victim_gender',
        'victim_cnic',
        'victim_country_code',
        'victim_phone',
        'crime_category',
        'crime_description',
        'city',
        'accused_known',
        'accused',
        'recommendation',
        'closure_reason',
        'recommendation_short',
        'recommendation_full',
        'evidence',
        'signature',
        'inquiry_no',
        'case_no',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'assignment_date' => 'date',
            'verification_date' => 'date',
            'accused_known' => 'boolean',
            'accused' => 'array',
            'evidence' => 'array',
        ];
    }

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Data isolation: users only see reports they created.
     * Supervisory roles see all.
     */
    public function scopeVisibleTo($query, ?User $user)
    {
        $user = $user ?? auth()->user();

        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->seesAllData()) {
            return $query;
        }

        return $query->where('created_by', $user->id);
    }
}
