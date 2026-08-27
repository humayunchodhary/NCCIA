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
        'direct_info',
        'enquiry_number',
        'enquiry_officer_id',
        'status',
        'recommendation',
        'closure_reason',
        'transfer_department',
        'transfer_circle',
        'merge_complaint_id',
        'cfr_summary',
        'cfr_type',
        'cfr_date',
        'charge_against',
        'oral_evidence',
        'documentary_evidence',
        'plea',
        'conclusion',
        'cfr_remarks',
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

    protected function casts(): array
    {
        return [
            'reg_date'              => 'datetime',
            'assignment_date'       => 'datetime',
            'submitted_at'          => 'datetime',
            'approved_at'           => 'datetime',
            'cfr_date'              => 'date:Y-m-d',
            'notice_date'           => 'date:Y-m-d',
            'notice_served_at'      => 'datetime',
            'notice_served'         => 'boolean',
            'has_unserved_notice'   => 'boolean',
            'slip_generated'        => 'boolean',
            'slip_generated_at'     => 'datetime',
            'notice_count'          => 'integer',
            'direct_info'           => 'array',
        ];
    }

    /**
     * Display reference: complaint tracking no, else direct reference.
     */
    public function reference(): ?string
    {
        return $this->complaint?->tracking_no
            ?: ($this->direct_info['reference_no'] ?? null);
    }

    /**
     * Display complainant name: from complaint, else direct snapshot.
     */
    public function complainantName(): ?string
    {
        return $this->complaint?->complainant_name
            ?: ($this->direct_info['complainant_name'] ?? null);
    }

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

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_file_id');
    }

    public function hasRegisteredCase(): bool
    {
        if ($this->case_file_id) {
            return true;
        }

        return CaseFile::where('enquiry_id', $this->id)->exists();
    }

    public function accusedPersons(): HasMany
    {
        return $this->hasMany(EnquiryAccused::class);
    }

    public function enquiryAttachments(): HasMany
    {
        return $this->hasMany(EnquiryAttachment::class);
    }

    public function requisitions(): HasMany
    {
        return $this->hasMany(EnquiryRequisition::class);
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
        $user = $user ?? auth('api')->user() ?? auth()->user() ?? request()->user();

        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->seesAllData()) {
            return $query;
        }

        $userRole = $user->role ?? '';
        $isPureVo = ($user->hasRole('verification_officer') || $userRole === 'verification_officer')
            && !$user->hasAnyRole([
                'admin', 'circle_incharge', 'enquiry_officer', 'investigation_officer', 'operator',
                'moharrar', 'reader_branch', 'ad_legal', 'dd_legal',
                'additional_director', 'director_general',
            ]) && !in_array($userRole, ['admin', 'circle_incharge', 'enquiry_officer', 'investigation_officer', 'operator', 'moharrar', 'reader_branch', 'inspector', 'sub_inspector', 'officer']);

        if ($isPureVo) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function ($q) use ($user) {
            // 1. Enquiries assigned directly to this officer
            $q->where('enquiry_officer_id', $user->id);

            // 2. Enquiries in the user's circle
            if ($user->circle_id) {
                $q->orWhere(function ($cq) use ($user) {
                    $cq->whereHas('complaint', function ($sub) use ($user) {
                        $sub->where('circle_id', $user->circle_id);
                    })->orWhere(function ($dq) use ($user) {
                        $dq->whereNull('complaint_id')
                           ->where(function ($jsonQ) use ($user) {
                               $jsonQ->where('direct_info->circle_id', $user->circle_id)
                                     ->orWhere('direct_info->circle_id', (string) $user->circle_id);
                           });
                    });
                });
            }

            // 3. For any Enquiry Officer, Inspector or Circle Incharge, allow all circle enquiries or all enquiries
            $isEo = $user->hasAnyRole(['enquiry_officer', 'investigation_officer', 'circle_incharge', 'inspector', 'sub_inspector', 'officer']);
            if ($isEo) {
                if ($user->circle_id) {
                    $q->orWhereHas('complaint', function ($sub) use ($user) {
                        $sub->where('circle_id', $user->circle_id);
                    })->orWhereNull('complaint_id');
                } else {
                    $q->orWhereRaw('1 = 1');
                }
            }

            // 4. Enquiries belonging to complaints visible to user
            $q->orWhereIn('complaint_id', Complaint::visibleTo($user)->select('id'));
        });
    }
}
