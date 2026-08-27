<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;
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

    protected static function booted(): void
    {
        static::saving(function (CaseFile $caseFile) {
            if (!array_key_exists('priority', $caseFile->getAttributes())) {
                return;
            }
            static $hasPriority = null;
            $hasPriority ??= Schema::hasColumn('cases', 'priority');
            if (!$hasPriority) {
                unset($caseFile->priority);
            }
        });
    }

    protected $table = 'cases';

    protected $fillable = [
        'enquiry_id',
        'direct_info',
        'fir_no',
        'investigation_officer_id',
        'status',
        'priority',
        'recommendation',
        'transfer_department',
        'transfer_circle',
        'merge_complaint_id',
    ];

    protected function casts(): array
    {
        return [
            'direct_info' => 'array',
        ];
    }

    public function reference(): ?string
    {
        return $this->enquiry?->reference()
            ?: ($this->direct_info['reference_no'] ?? null);
    }

    public function complainantName(): ?string
    {
        return $this->enquiry?->complaint?->complainant_name
            ?: ($this->direct_info['complainant_name'] ?? null)
            ?: $this->enquiry?->complainantName();
    }

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

        return $query->where(function ($q) use ($user) {
            $q->whereIn('enquiry_id', Enquiry::visibleTo($user)->select('id'));

            // Direct FIR (no enquiry): show to circle incharge / same-circle users.
            $q->orWhere(function ($d) use ($user) {
                $d->whereNull('enquiry_id')->whereNotNull('direct_info');
                if ($user->circle_id && !$user->hasRole('circle_incharge')) {
                    $d->where('direct_info->circle_id', $user->circle_id);
                } elseif ($user->hasRole('circle_incharge') && $user->circle_id) {
                    $d->where(function ($c) use ($user) {
                        $c->where('direct_info->circle_id', $user->circle_id)
                          ->orWhereNull('direct_info->circle_id');
                    });
                }
            });
        });
    }
}
