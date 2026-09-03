<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\Circle;
use App\Models\Complaint;
use App\Models\CourtCase;
use App\Models\Enquiry;
use App\Models\OffenceType;
use App\Models\Verification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DepartmentProgressController extends Controller
{
    private const ALLOWED_ROLES = [
        'director_general',
        'additional_director',
        'dd_legal',
        'ad_legal',
        'admin',
    ];

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Strict Role Security: Only DG, Additional Director, DD Legal, AD Legal, Admin
        if (!$user || !$user->hasAnyRole(self::ALLOWED_ROLES)) {
            return response()->json([
                'message' => 'Unauthorized. This monitoring dashboard is restricted to Executive and Legal officers only.'
            ], 403);
        }

        $year = (int) $request->input('year', now()->year);
        $circleId = $request->input('circle_id') ? (int) $request->input('circle_id') : null;
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $cacheKey = "dept_prog:v1:{$user->id}:{$year}:" . ($circleId ?: 'all') . ":{$dateFrom}:{$dateTo}";

        $payload = Cache::remember($cacheKey, 60, function () use ($year, $circleId, $dateFrom, $dateTo) {
            return $this->buildProgressData($year, $circleId, $dateFrom, $dateTo);
        });

        return response()->json($payload);
    }

    private function buildProgressData(int $year, ?int $circleId, ?string $dateFrom, ?string $dateTo): array
    {
        // 1. Fetch all Circles for dropdown & circle-by-circle comparative analysis
        $circles = Circle::query()->select('id', 'name', 'code')->orderBy('name')->get();

        // 2. Base queries with optional date / year filtering
        $cmpQuery = Complaint::query();
        $enqQuery = Enquiry::query();
        $caseQuery = CaseFile::query();
        $courtQuery = CourtCase::query();

        if ($dateFrom) {
            $cmpQuery->whereDate('created_at', '>=', $dateFrom);
            $enqQuery->whereDate('created_at', '>=', $dateFrom);
            $caseQuery->whereDate('created_at', '>=', $dateFrom);
            $courtQuery->whereDate('created_at', '>=', $dateFrom);
        } elseif ($year) {
            $cmpQuery->whereYear('created_at', $year);
            $enqQuery->whereYear('created_at', $year);
            $caseQuery->whereYear('created_at', $year);
            $courtQuery->whereYear('created_at', $year);
        }

        if ($dateTo) {
            $cmpQuery->whereDate('created_at', '<=', $dateTo);
            $enqQuery->whereDate('created_at', '<=', $dateTo);
            $caseQuery->whereDate('created_at', '<=', $dateTo);
            $courtQuery->whereDate('created_at', '<=', $dateTo);
        }

        // If a specific circle is chosen in the filter
        if ($circleId) {
            $cmpQuery->where('circle_id', $circleId);
            $enqQuery->where(function ($q) use ($circleId) {
                $q->whereHas('complaint', fn ($sq) => $sq->where('circle_id', $circleId))
                  ->orWhere('direct_info->circle_id', $circleId)
                  ->orWhere('direct_info->circle_id', (string) $circleId);
            });
            $caseQuery->where(function ($q) use ($circleId) {
                $q->whereHas('enquiry.complaint', fn ($sq) => $sq->where('circle_id', $circleId))
                  ->orWhere('direct_info->circle_id', $circleId)
                  ->orWhere('direct_info->circle_id', (string) $circleId);
            });
        }

        // 3. Overall KPI Metrics
        $totalComplaints = (clone $cmpQuery)->count();
        $resolvedComplaints = (clone $cmpQuery)
            ->where(function ($q) {
                $q->whereNotNull('final_status')
                  ->orWhereIn('status', ['complete', 'invalid', 'irrelevant']);
            })->count();

        $activeEnquiries = (clone $enqQuery)
            ->whereNotIn('status', ['approved', 'closed'])
            ->count();

        $totalEnquiries = (clone $enqQuery)->count();

        $registeredCases = (clone $caseQuery)->count();
        $finalizedCases = (clone $caseQuery)
            ->where('status', 'closed')
            ->count();

        $totalCourtCases = (clone $courtQuery)->count();
        $activeCourtCases = (clone $courtQuery)
            ->whereNotIn('status', ['verdict_given', 'closed', 'dismissed'])
            ->count();

        // Legal Scrutiny & CFRs pending approval (for Legal Chain & DG)
        $legalStatuses = ['cfr_submitted', 'legal_review_dd', 'legal_review_ad', 'legal_review_dg'];
        $pendingLegalEnquiries = (clone $enqQuery)->whereIn('status', $legalStatuses)->count();
        $pendingLegalCases = (clone $caseQuery)->whereIn('status', $legalStatuses)->count();
        $pendingLegalReviews = $pendingLegalEnquiries + $pendingLegalCases;

        // Overall Disposal calculation
        $totalWorkload = $totalComplaints + $totalEnquiries + $registeredCases;
        $totalDisposed = $resolvedComplaints + $finalizedCases;
        $overallDisposalRate = $totalWorkload > 0 ? (int) round(($totalDisposed / max(1, $totalComplaints + $registeredCases)) * 100) : 0;
        $overallDisposalRate = min(100, $overallDisposalRate);

        // 4. Circle-by-Circle Detailed Breakdown
        $circleBreakdown = [];
        $circleBarChart = [];

        foreach ($circles as $c) {
            $cCmpTotal = Complaint::where('circle_id', $c->id)
                ->when($year, fn ($q) => $q->whereYear('created_at', $year))
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count();

            $cCmpResolved = Complaint::where('circle_id', $c->id)
                ->when($year, fn ($q) => $q->whereYear('created_at', $year))
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->where(function ($q) {
                    $q->whereNotNull('final_status')
                      ->orWhereIn('status', ['complete', 'invalid', 'irrelevant']);
                })->count();

            $cEnqTotal = Enquiry::where(function ($q) use ($c) {
                    $q->whereHas('complaint', fn ($sq) => $sq->where('circle_id', $c->id))
                      ->orWhere('direct_info->circle_id', $c->id)
                      ->orWhere('direct_info->circle_id', (string) $c->id);
                })
                ->when($year, fn ($q) => $q->whereYear('created_at', $year))
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count();

            $cCasesTotal = CaseFile::where(function ($q) use ($c) {
                    $q->whereHas('enquiry.complaint', fn ($sq) => $sq->where('circle_id', $c->id))
                      ->orWhere('direct_info->circle_id', $c->id)
                      ->orWhere('direct_info->circle_id', (string) $c->id);
                })
                ->when($year, fn ($q) => $q->whereYear('created_at', $year))
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count();

            $cCasesFinalized = CaseFile::where(function ($q) use ($c) {
                    $q->whereHas('enquiry.complaint', fn ($sq) => $sq->where('circle_id', $c->id))
                      ->orWhere('direct_info->circle_id', $c->id)
                      ->orWhere('direct_info->circle_id', (string) $c->id);
                })
                ->when($year, fn ($q) => $q->whereYear('created_at', $year))
                ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->where('status', 'closed')
                ->count();

            $cLegalPending = Enquiry::where(function ($q) use ($c) {
                    $q->whereHas('complaint', fn ($sq) => $sq->where('circle_id', $c->id))
                      ->orWhere('direct_info->circle_id', $c->id)
                      ->orWhere('direct_info->circle_id', (string) $c->id);
                })
                ->whereIn('status', $legalStatuses)
                ->count() + CaseFile::where(function ($q) use ($c) {
                    $q->whereHas('enquiry.complaint', fn ($sq) => $sq->where('circle_id', $c->id))
                      ->orWhere('direct_info->circle_id', $c->id)
                      ->orWhere('direct_info->circle_id', (string) $c->id);
                })
                ->whereIn('status', $legalStatuses)
                ->count();

            $cTotalAll = $cCmpTotal + $cCasesTotal;
            $cResolvedAll = $cCmpResolved + $cCasesFinalized;
            $cRate = $cTotalAll > 0 ? (int) round(($cResolvedAll / $cTotalAll) * 100) : 0;
            $cRate = min(100, $cRate);

            $badge = 'low';
            if ($cRate >= 70) {
                $badge = 'high';
            } elseif ($cRate >= 40) {
                $badge = 'medium';
            }

            $item = [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'total_complaints' => $cCmpTotal,
                'resolved_complaints' => $cCmpResolved,
                'total_enquiries' => $cEnqTotal,
                'total_cases' => $cCasesTotal,
                'finalized_cases' => $cCasesFinalized,
                'pending_legal' => $cLegalPending,
                'disposal_rate' => $cRate,
                'status_badge' => $badge,
            ];

            $circleBreakdown[] = $item;

            // Bar chart data (only circles with at least some volume or top 10)
            $circleBarChart[] = [
                'name' => $c->name,
                'code' => $c->code ?: $c->name,
                'total' => $cCmpTotal + $cEnqTotal + $cCasesTotal,
                'disposed' => $cCmpResolved + $cCasesFinalized,
                'pending' => max(0, ($cCmpTotal + $cEnqTotal + $cCasesTotal) - ($cCmpResolved + $cCasesFinalized)),
                'rate' => $cRate,
            ];
        }

        // Sort circle breakdown by total volume descending
        usort($circleBreakdown, fn ($a, $b) => ($b['total_complaints'] + $b['total_enquiries']) <=> ($a['total_complaints'] + $a['total_enquiries']));
        usort($circleBarChart, fn ($a, $b) => $b['total'] <=> $a['total']);

        // 5. Pie Chart Data: Workflow Stage Distribution
        $workflowPie = [
            [
                'name' => 'Complaints (CMU)',
                'count' => max(0, $totalComplaints - $resolvedComplaints),
                'color' => '#0284c7', // Sky blue
            ],
            [
                'name' => 'Active Enquiries',
                'count' => $activeEnquiries,
                'color' => '#f59e0b', // Amber
            ],
            [
                'name' => 'Active Cases (FIR)',
                'count' => max(0, $registeredCases - $finalizedCases),
                'color' => '#ef4444', // Red
            ],
            [
                'name' => 'Court Trials',
                'count' => $activeCourtCases,
                'color' => '#8b5cf6', // Violet
            ],
            [
                'name' => 'Disposed / Closed',
                'count' => $totalDisposed,
                'color' => '#10b981', // Green
            ],
        ];

        // 6. Pie Chart / Bar Data: Offence Categories Breakdown
        $categoryBreakdown = OffenceType::query()
            ->selectRaw('offence_types.name, COUNT(*) as count')
            ->join('complaints', 'offence_types.value', '=', 'complaints.offence_type')
            ->whereIn('complaints.id', (clone $cmpQuery)->select('id'))
            ->groupBy('offence_types.name')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(function ($row, $i) {
                $palette = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
                return [
                    'name' => $row->name,
                    'count' => (int) $row->count,
                    'color' => $palette[$i % count($palette)],
                ];
            });

        // 7. Monthly Trends (Inflow vs Disposal)
        $monthlyTrends = [];
        $receivedMonths = (clone $cmpQuery)
            ->selectRaw('MONTH(created_at) as m, COUNT(*) as c')
            ->groupBy('m')
            ->pluck('c', 'm');

        $resolvedMonths = (clone $cmpQuery)
            ->where(function ($q) {
                $q->whereNotNull('final_status')
                  ->orWhereIn('status', ['complete', 'invalid', 'irrelevant']);
            })
            ->selectRaw('MONTH(updated_at) as m, COUNT(*) as c')
            ->groupBy('m')
            ->pluck('c', 'm');

        for ($m = 1; $m <= 12; $m++) {
            $monthlyTrends[] = [
                'month' => date('M', mktime(0, 0, 0, $m, 1)),
                'received' => (int) ($receivedMonths[$m] ?? 0),
                'resolved' => (int) ($resolvedMonths[$m] ?? 0),
            ];
        }

        // 8. Recent Legal Review Backlog Items (CFRs & Opinions for AD/DD/DG)
        $legalBacklog = Enquiry::whereIn('status', $legalStatuses)
            ->with(['complaint.circle'])
            ->latest('updated_at')
            ->limit(8)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'type' => 'Enquiry CFR',
                'number' => $e->enquiry_no ?: ("ENQ-" . str_pad($e->id, 5, '0', STR_PAD_LEFT)),
                'circle' => $e->complaint?->circle?->name ?: 'Headquarters',
                'status' => $e->status,
                'updated_at' => $e->updated_at ? $e->updated_at->format('d M Y') : 'N/A',
            ]);

        return [
            'metrics' => [
                'total_workload' => $totalWorkload,
                'total_complaints' => $totalComplaints,
                'resolved_complaints' => $resolvedComplaints,
                'total_enquiries' => $totalEnquiries,
                'active_enquiries' => $activeEnquiries,
                'registered_cases' => $registeredCases,
                'finalized_cases' => $finalizedCases,
                'total_court_cases' => $totalCourtCases,
                'pending_legal_reviews' => $pendingLegalReviews,
                'overall_disposal_rate' => $overallDisposalRate,
            ],
            'circles' => $circles,
            'circle_breakdown' => $circleBreakdown,
            'circle_bar_chart' => array_slice($circleBarChart, 0, 10), // Top 10 circles
            'workflow_pie' => $workflowPie,
            'category_breakdown' => $categoryBreakdown,
            'monthly_trends' => $monthlyTrends,
            'legal_backlog' => $legalBacklog,
            'filters' => [
                'year' => $year,
                'circle_id' => $circleId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ];
    }
}
