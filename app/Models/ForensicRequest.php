<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForensicRequest extends Model
{
    protected $fillable = [
        'request_no', 'enquiry_id', 'case_id', 'submitted_by', 'destination', 'note',
        'status', 'report_code', 'ad_reviewed_by', 'ad_reviewed_at', 'assigned_to',
        'assigned_at', 'opened_at', 'report_ready_at', 'desk_officer_id',
        'desk_notified_at', 'handed_over_at', 'handed_to_user_id', 'handover_remarks',
        'attachment_path',
    ];

    protected function casts(): array
    {
        return [
            'ad_reviewed_at'   => 'datetime',
            'assigned_at'      => 'datetime',
            'opened_at'        => 'datetime',
            'report_ready_at'  => 'datetime',
            'desk_notified_at' => 'datetime',
            'handed_over_at'   => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(ForensicRequestItem::class);
    }

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function adReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ad_reviewed_by');
    }

    public function deskOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'desk_officer_id');
    }

    public function handedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handed_to_user_id');
    }
}
