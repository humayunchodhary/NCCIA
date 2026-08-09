<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Complaint extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty();
    }

    protected $fillable = [
        'tracking_no',
        'source',
        'complainant_name',
        'cnic',
        'contact_no',
        'contact_country_code',
        'nationality',
        'passport_no',
        'address',
        'post_address',
        'profession',
        'report_date',
        'diary_no',
        'received_via',
        'received_from',
        'cmu',
        'priority_type',
        'offence_type',
        'amount_involved',
        'occurrence_date',
        'laws',
        'description',
        'evidence',
        'operator_name',
        'operator_designation',
        'entry_time',
        'scrutiny_result',
        'operator_remarks',
        'registration_message',
        'registration_notify_via',
        'registration_notified_at',
        'status',
        'final_status',
        'closure_reason',
        'merged_with_id',
        'transfer_to_department',
        'transfer_to_circle_id',
        'enquiry_id',
        'user_id',
        'operator_id',
        'circle_id',
        'attachment',
        'slip_generated',
        'slip_generated_at',
        'slip_number',
    ];

    protected function casts(): array
    {
        return [
            'laws' => 'array',
            'evidence' => 'array',
            'amount_involved' => 'decimal:2',
            'report_date' => 'date:Y-m-d',
            'occurrence_date' => 'date:Y-m-d',
            'entry_time' => 'datetime',
            'slip_generated_at' => 'datetime',
            'registration_notified_at' => 'datetime',
            'slip_generated' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function circle(): BelongsTo
    {
        return $this->belongsTo(Circle::class);
    }

    public function verification(): HasOne
    {
        return $this->hasOne(Verification::class);
    }

    public function caseFiles(): HasManyThrough
    {
        return $this->hasManyThrough(CaseFile::class, Enquiry::class, 'complaint_id', 'enquiry_id', 'id', 'id');
    }

    public function enquiries(): HasMany
    {
        return $this->hasMany(Enquiry::class);
    }

    public function mergedWith(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'merged_with_id');
    }

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class, 'enquiry_id');
    }

    public function transferToCircle(): BelongsTo
    {
        return $this->belongsTo(Circle::class, 'transfer_to_circle_id');
    }

    /**
     * Data isolation: a user may only see complaints they own/are assigned to.
     * Supervisory roles (admin etc.) see everything.
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

        if ($user->hasRole('circle_incharge')) {
            return $user->circle_id
                ? $query->where('circle_id', $user->circle_id)
                : $query->whereNull('circle_id');
        }

        if ($user->hasRole('operator')) {
            return $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('operator_id', $user->id);
            });
        }

        $ids = collect();

        if ($user->hasRole('verification_officer')) {
            $ids = $ids->merge(
                Verification::where('verification_officer_id', $user->id)->pluck('complaint_id')
            );
        }

        if ($user->hasRole('enquiry_officer')) {
            $ids = $ids->merge(
                Enquiry::where('enquiry_officer_id', $user->id)->pluck('complaint_id')
            );
        }

        if ($user->hasRole('investigation_officer')) {
            $enquiryIds = CaseFile::where('investigation_officer_id', $user->id)->pluck('enquiry_id');
            $ids = $ids->merge(
                Enquiry::whereIn('id', $enquiryIds)->pluck('complaint_id')
            );
        }

        if ($ids->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('id', $ids->unique()->values());
    }

    /**
     * Lifecycle progress percentage (aligned with realerp_nccia.sql):
     * incomplete(10) → complete(25) → verification assigned(40)
     * → verification submitted/approved(60) → enquiry registered(70)
     * → enquiry in_progress/cfr_submitted(80) → enquiry approved(85)
     * → enquiry closed/converted_to_case(95) → case registered(90)
     * → case closed(100). Terminal: final_status set → 100.
     */
    public function progressPercent(): int
    {
        if ($this->final_status) {
            return 100;
        }

        if (in_array($this->status, ['invalid', 'irrelevant'])) {
            return 100;
        }

        $case = $this->caseFiles->first();
        if ($case) {
            return $case->status === 'closed' ? 100 : 90;
        }

        $enquiry = $this->enquiry;
        if ($enquiry) {
            if (in_array($enquiry->status, ['closed', 'converted_to_case'])) {
                return 95;
            }
            if ($enquiry->status === 'approved') {
                return 85;
            }
            if (in_array($enquiry->status, ['cfr_submitted', 'in_progress'])) {
                return 80;
            }
            return 70;
        }

        $verification = $this->verification;
        if ($verification) {
            return in_array($verification->status, ['submitted', 'approved']) ? 60 : 40;
        }

        return $this->status === 'complete' ? 25 : 10;
    }

    public function progressStage(): string
    {
        $p = $this->progressPercent();
        if ($p >= 100) return 'Resolved';
        if ($p >= 95)  return 'Enquiry Closed';
        if ($p >= 90)  return 'Case Registered';
        if ($p >= 85)  return 'Enquiry Approved';
        if ($p >= 80)  return 'Enquiry CFR Submitted';
        if ($p >= 70)  return 'Enquiry Registered';
        if ($p >= 60)  return 'Verification Approved';
        if ($p >= 40)  return 'Under Verification';
        if ($p >= 25)  return 'Scrutiny Complete';
        return 'Incomplete';
    }
}
