<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Enquiry extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }

    protected $fillable = [
        'complaint_id',
        'enquiry_number',
        'enquiry_officer_id',
        'status',
        'recommendation',
        'closure_reason',
        'transfer_department',
        'transfer_circle',
        'merge_complaint_id',
        'cfr_summary',
        'reg_date',
        'assignment_date',
        'submitted_at',
        'approved_at',
        'case_file_id',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function officer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enquiry_officer_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(EnquiryActivity::class);
    }

    public function legalOpinions(): HasMany
    {
        return $this->hasMany(EnquiryLegalOpinion::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(EnquiryApproval::class);
    }

    /**
     * Data isolation: users only see enquiries assigned to them
     * (or that belong to complaints they can see). Supervisory roles see all.
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

        if ($user->hasRole('enquiry_officer')) {
            return $query->where('enquiry_officer_id', $user->id);
        }

        $complaintIds = Complaint::visibleTo($user)->pluck('id');

        if ($complaintIds->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('complaint_id', $complaintIds);
    }
}
