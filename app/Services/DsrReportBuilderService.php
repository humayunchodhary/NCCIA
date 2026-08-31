<?php

namespace App\Services;

use App\Models\Arrest;
use App\Models\CaseFile;
use App\Models\Circle;
use App\Models\Complaint;
use App\Models\Enquiry;
use Carbon\Carbon;

class DsrReportBuilderService
{
    public function build(int $circleId, Carbon $date, ?string $unitName = null): array
    {
        $circle = Circle::find($circleId);
        $unit = $unitName ?: ('CCRC-' . ($circle?->name ?? 'Lahore'));
        $day = $date->toDateString();

        $enquiriesRegistered = $this->enquiriesRegistered($circleId, $day);
        $enquiriesClosed = $this->enquiriesClosed($circleId, $day);
        $casesRegistered = $this->casesRegistered($circleId, $day);
        $casesDisposed = $this->casesDisposed($circleId, $day);
        $arrests = $this->arrestsToday($circleId, $day);

        $highlights = [
            'cases' => count($casesRegistered),
            'enquiries_registered' => count($enquiriesRegistered),
            'enquiries_closed' => count($enquiriesClosed),
            'accused_in_lockup' => 0,
            'fresh_arrests' => count($arrests),
            'bail' => 0,
            'old_accused_arrested' => 0,
            'conviction' => count(array_filter($casesDisposed, fn ($r) => ($r['reason'] ?? '') === 'conviction')),
        ];

        return [
            'unit_name' => $unit,
            'report_date' => $day,
            'highlights' => $highlights,
            'payload' => [
                'enquiries_registered' => $enquiriesRegistered,
                'enquiries_closed' => $enquiriesClosed,
                'cases_registered' => $casesRegistered,
                'cases_disposed' => $casesDisposed,
                'arrests' => $arrests,
                'progress_cases' => $this->progressCases($circleId, $date),
                'progress_enquiries' => $this->progressEnquiries($circleId, $date),
                'summary' => [
                    'total_cases_registered' => count($casesRegistered),
                    'total_enquiries_registered' => count($enquiriesRegistered),
                    'total_arrests' => count($arrests),
                ],
            ],
        ];
    }

    private function enquiryBase(int $circleId)
    {
        return Enquiry::query()
            ->with(['complaint.circle', 'officer:id,name'])
            ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId));
    }

    private function enquiriesRegistered(int $circleId, string $day): array
    {
        return $this->enquiryBase($circleId)
            ->where(function ($q) use ($day) {
                $q->whereDate('reg_date', $day)
                    ->orWhere(function ($qq) use ($day) {
                        $qq->whereNull('reg_date')->whereDate('created_at', $day);
                    });
            })
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (Enquiry $e) => $this->mapEnquiryRow($e))
            ->values()
            ->all();
    }

    private function enquiriesClosed(int $circleId, string $day): array
    {
        return $this->enquiryBase($circleId)
            ->whereIn('status', ['closed', 'approved', 'converted_to_case'])
            ->where(function ($q) use ($day) {
                $q->whereDate('approved_at', $day)
                    ->orWhereDate('updated_at', $day);
            })
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (Enquiry $e) => array_merge($this->mapEnquiryRow($e), [
                'closure_reason' => $e->closure_reason,
            ]))
            ->values()
            ->all();
    }

    private function mapEnquiryRow(Enquiry $e): array
    {
        return [
            'enquiry_number' => $e->enquiry_number,
            'dated' => optional($e->reg_date ?? $e->created_at)->format('d.m.Y'),
            'complainant' => $e->complaint?->complainant_name,
            'circle' => $e->complaint?->circle?->name,
            'eo_name' => $e->officer?->name,
            'gist' => $e->cfr_summary ?: $e->complaint?->description,
            'accused' => $e->charge_against,
            'amount_involved' => $e->complaint?->amount_involved,
            'amount_recovered' => null,
            'cms_entered' => $e->enquiry_number ? 'Yes' : 'No',
        ];
    }

    private function casesRegistered(int $circleId, string $day): array
    {
        return CaseFile::query()
            ->with(['enquiry.complaint.circle', 'investigationOfficer:id,name'])
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereDate('created_at', $day)
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (CaseFile $c) => [
                'enquiry_no' => $c->enquiry?->enquiry_number,
                'fir_no' => $c->fir_no,
                'dated' => optional($c->created_at)->format('d.m.Y'),
                'sections' => $c->enquiry?->complaint?->laws,
                'circle' => $c->enquiry?->complaint?->circle?->name,
                'io_name' => $c->investigationOfficer?->name,
                'gist' => $c->enquiry?->cfr_summary ?: $c->enquiry?->complaint?->description,
                'accused' => $c->enquiry?->charge_against,
                'amount_involved' => $c->enquiry?->complaint?->amount_involved,
                'cms_entered' => $c->fir_no ? 'Yes' : 'No',
            ])
            ->values()
            ->all();
    }

    private function casesDisposed(int $circleId, string $day): array
    {
        return CaseFile::query()
            ->with(['enquiry.complaint.circle', 'investigationOfficer:id,name'])
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->where('status', 'closed')
            ->whereDate('updated_at', $day)
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (CaseFile $c) => [
                'fir_no' => $c->fir_no,
                'dated' => optional($c->updated_at)->format('d.m.Y'),
                'circle' => $c->enquiry?->complaint?->circle?->name,
                'io_name' => $c->investigationOfficer?->name,
                'reason' => $c->recommendation ?: 'closed',
            ])
            ->values()
            ->all();
    }

    private function arrestsToday(int $circleId, string $day): array
    {
        return Arrest::query()
            ->with(['caseFile.enquiry.complaint'])
            ->whereDate('arrest_date', $day)
            ->whereHas('caseFile.enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (Arrest $a) => [
                'circle' => $a->caseFile?->enquiry?->complaint?->circle?->name ?? 'NCCIA',
                'accused_name' => $a->accused_name,
                'cnic' => $a->cnic,
                'fir_no' => $a->caseFile?->fir_no,
                'fir_date' => optional($a->caseFile?->created_at)->format('d.m.Y'),
                'arrest_date' => optional($a->arrest_date)->format('d.m.Y'),
            ])
            ->values()
            ->all();
    }

    private function progressCases(int $circleId, Carbon $date): array
    {
        $year = (int) $date->year;
        $pending = CaseFile::query()
            ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereNotIn('status', ['closed'])
            ->count();

        return [[
            'unit' => 'CCRC',
            'previous' => CaseFile::query()
                ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
                ->whereYear('created_at', '<', $year)
                ->count(),
            'added' => CaseFile::query()
                ->whereHas('enquiry.complaint', fn ($q) => $q->where('circle_id', $circleId))
                ->whereYear('created_at', $year)
                ->count(),
            'pending' => $pending,
            'as_on' => $date->format('d.m.Y'),
        ]];
    }

    private function progressEnquiries(int $circleId, Carbon $date): array
    {
        $year = (int) $date->year;
        $pending = Enquiry::query()
            ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
            ->whereNotIn('status', ['closed', 'approved'])
            ->count();

        return [[
            'unit' => 'CCRC',
            'previous' => Enquiry::query()
                ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
                ->whereYear('created_at', '<', $year)
                ->count(),
            'added' => Enquiry::query()
                ->whereHas('complaint', fn ($q) => $q->where('circle_id', $circleId))
                ->whereYear('created_at', $year)
                ->count(),
            'pending' => $pending,
            'as_on' => $date->format('d.m.Y'),
        ]];
    }
}
