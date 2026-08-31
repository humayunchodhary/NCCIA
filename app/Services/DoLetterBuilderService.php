<?php

namespace App\Services;

use App\Models\Arrest;
use App\Models\CaseFile;
use App\Models\Circle;
use App\Models\Enquiry;
use App\Models\ForensicRequest;
use Carbon\Carbon;

class DoLetterBuilderService
{
    public function build(int $circleId, Carbon $month): array
    {
        $circle = Circle::find($circleId);
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();
        $label = $start->format('F-Y');

        $casesAdded = CaseFile::query()
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $casesClosed = CaseFile::query()
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->where('status', 'closed')
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        $casesPending = CaseFile::query()
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereNotIn('status', ['closed'])
            ->count();

        $enquiriesAdded = Enquiry::query()
            ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $enquiriesClosed = Enquiry::query()
            ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereIn('status', ['closed', 'approved'])
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        $enquiriesPending = Enquiry::query()
            ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereNotIn('status', ['closed', 'approved'])
            ->count();

        $cfrPendingLegal = Enquiry::query()
            ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereIn('status', ['legal_review_dd', 'legal_review_ad', 'cfr_submitted'])
            ->count();

        $forensicPending = ForensicRequest::query()
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereNotIn('status', ['handed_over'])
            ->count();

        $arrestedList = Arrest::query()
            ->with(['caseFile.enquiry.complaint'])
            ->whereBetween('arrest_date', [$start, $end])
            ->whereHas('caseFile.enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->latest('arrest_date')
            ->limit(500)
            ->get()
            ->map(fn (Arrest $a, $i) => [
                'sr' => $i + 1,
                'fir_no' => $a->caseFile?->fir_no,
                'accused_name' => $a->accused_name,
                'arrest_date' => optional($a->arrest_date)->format('d.m.Y'),
                'address' => $a->caseFile?->enquiry?->complaint?->address,
            ])
            ->values()
            ->all();

        return [
            'month_label' => $label,
            'report_month' => $start->toDateString(),
            'circle_name' => $circle?->name,
            'payload' => [
                'cases' => [
                    'at_beginning' => max(0, $casesPending - $casesAdded + $casesClosed),
                    'added' => $casesAdded,
                    'total' => $casesAdded,
                    'interim_challan' => 0,
                    'final_challan' => $casesClosed,
                    'discharge' => 0,
                    'transferred' => 0,
                    'merged' => 0,
                    'pending' => $casesPending,
                ],
                'cfr_pendency' => [
                    'total_cfrs' => Enquiry::query()
                        ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
                        ->whereIn('status', ['cfr_submitted', 'legal_review_dd', 'legal_review_ad', 'legal_review_dg'])
                        ->count(),
                    'pending_legal' => $cfrPendingLegal,
                    'pending_forensic' => $forensicPending,
                    'pending_investigation' => $casesPending,
                    'total_pending' => $casesPending + $enquiriesPending,
                ],
                'enquiries' => [
                    'at_beginning' => max(0, $enquiriesPending - $enquiriesAdded + $enquiriesClosed),
                    'added' => $enquiriesAdded,
                    'closed' => $enquiriesClosed,
                    'pending' => $enquiriesPending,
                ],
                'raid' => [
                    'total_raid' => 0,
                    'cases_after_raid' => 0,
                    'enquiries_after_raid' => 0,
                ],
                'pos' => ['previous' => 0, 'added' => 0, 'arrested' => 0, 'pending' => 0],
                'cas' => ['previous' => 0, 'added' => 0, 'arrested' => 0, 'pending' => 0],
                'accused_arrested' => $arrestedList,
            ],
        ];
    }
}
