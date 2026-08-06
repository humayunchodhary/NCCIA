<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CaseFile extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }

    protected $table = 'cases';

    protected $fillable = [
        'enquiry_id',
        'complaint_id',
        'fir_no',
        'investigation_officer_id',
        'status',
        'recommendation',
        'transfer_department',
        'transfer_circle',
        'merge_complaint_id',
    ];

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    public function investigationOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investigation_officer_id');
    }

    public function mergeComplaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'merge_complaint_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(CaseActivity::class, 'case_id');
    }

    public function arrests(): HasMany
    {
        return $this->hasMany(Arrest::class, 'case_id');
    }

    public function legalOpinions(): HasMany
    {
        return $this->hasMany(CaseLegalOpinion::class, 'case_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(CaseApproval::class, 'case_id');
    }

    /**
     * Data isolation: users only see cases they are investigating
     * (or that come from enquiries/complaints they can see). Supervisory roles see all.
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

        if ($user->hasRole('investigation_officer')) {
            return $query->where('investigation_officer_id', $user->id);
        }

        $enquiryIds = Enquiry::visibleTo($user)->pluck('id');

        if ($enquiryIds->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('enquiry_id', $enquiryIds);
    }
}
