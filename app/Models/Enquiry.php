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
        // Witness fields
        'witness_name',
        'witness_cnic',
        'witness_nationality',
        'witness_passport',
        'witness_address',
        'witness_attachment',
        // Notice fields
        'notice_number',
        'notice_type',
        'notice_receiver_name',
        'notice_date',
        'notice_via',
        'notice_person_type',
        'notice_description',
        'notice_address',
        'notice_phone',
        'notice_served',
        'notice_served_at',
        'notice_count',
        // Technical & Forensic Reports
        'technical_report',
        'forensic_report',
        'technical_report_attachment',
        'forensic_report_attachment',
        // Notice flags
        'has_unserved_notice',
        // Slip generation
        'slip_generated',
        'slip_generated_at',
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

    public function witnesses(): HasMany
    {
        return $this->hasMany(EnquiryWitness::class);
    }

    public function notices(): HasMany
    {
        return $this->hasMany(EnquiryNotice::class);
    }

    /**
     * Number of notices on this enquiry where the person failed to appear.
     */
    public function nonAppearanceCount(): int
    {
        return $this->notices()->where('status', 'non_appearance')->count();
    }

    /**
     * Number of notices currently unserved / pending appearance.
     */
    public function unservedNoticeCount(): int
    {
        return $this->notices()->whereIn('status', ['issued', 'unserved'])->count();
    }

    /**
     * True when a person failed to appear (gold star shown on the enquiry).
     */
    public function hasNonAppearance(): bool
    {
        return (bool) $this->nonAppearanceCount();
    }

    /**
     * After three non-appearance notices the matter is referred to court
     * and a case file is registered against the person.
     */
    public function shouldReferToCourt(): bool
    {
        return $this->nonAppearanceCount() >= 3;
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
