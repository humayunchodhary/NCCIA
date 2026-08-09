<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\Complaint;
use App\Models\CourtVerdict;
use App\Models\Enquiry;
use App\Models\Verification;
use App\Models\OffenceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $year = request('year', now()->year);

        // ─── Stats ────────────────────────────────────────────────
        $totalVerifications       = Verification::count();
        $pendingVerifications     = Verification::where('status', 'assigned')->count();
        $pendingReview            = Verification::whereIn('status', ['submitted', 'sent_back'])->count();

        $avgWaitDays = Verification::whereNotNull('assigned_at')
            ->selectRaw('COALESCE(AVG(DATEDIFF(COALESCE(assigned_at, created_at), created_at)), 0) as avg')
            ->value('avg');

        $finalizedCases       = CaseFile::where('status', 'closed')->count();
        $finalizedThisMonth   = CaseFile::where('status', 'closed')
            ->whereYear('updated_at', now()->year)
            ->whereMonth('updated_at', now()->month)
            ->count();

        $convertedToEnquiry = Enquiry::count();
        $activeEnquiries    = Enquiry::whereNotIn('status', ['approved', 'closed'])->count();

        $recommendedClosure = Enquiry::where('recommendation', 'closure')->count();
        $awaitingApproval   = Enquiry::where('status', 'cfr_submitted')->count();

        $closedNonPursuance = Enquiry::where('closure_reason', 'non_pursuance')->count();
        $closedNpLast30     = Enquiry::where('closure_reason', 'non_pursuance')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $closedNonEvidence = Enquiry::where('closure_reason', 'non_evidence')->count();
        $neUnderReview     = Enquiry::where('closure_reason', 'non_evidence')
            ->where('status', 'in_progress')
            ->count();

        $avgProcessingDays = Complaint::where(function ($q) {
            $q->whereNotNull('final_status')
              ->orWhereIn('status', ['complete', 'invalid', 'irrelevant']);
        })
        ->selectRaw('COALESCE(AVG(DATEDIFF(updated_at, created_at)), 0) as avg')
        ->value('avg');

        $transferCircles = Complaint::whereNotNull('circle_id')
            ->where('status', 'complete')
            ->count();

        $mergeOther    = Complaint::has('enquiries', '>=', 1)->count();
        $jurisdictionWanted = Enquiry::where('status', 'registered')->count();

        $totalComplaints = Complaint::count();
        $resolvedComplaints = Complaint::where(function ($q) {
            $q->whereNotNull('final_status')
              ->orWhereIn('status', ['invalid', 'irrelevant']);
        })->count();
        $overallPerformance = $totalComplaints > 0
            ? round(($resolvedComplaints / $totalComplaints) * 100)
            : 0;

        $stats = [
            'total_verifications'   => $totalVerifications,
            'pending_verifications' => $pendingVerifications,
            'pending_review'        => $pendingReview,
            'avg_wait_days'         => round((float) $avgWaitDays, 1),
            'finalized_cases'       => $finalizedCases,
            'finalized_this_month'  => $finalizedThisMonth,
            'converted_to_enquiry'  => $convertedToEnquiry,
            'active_enquiries'      => $activeEnquiries,
            'recommended_closure'   => $recommendedClosure,
            'awaiting_approval'     => $awaitingApproval,
            'closed_non_pursuance'  => $closedNonPursuance,
            'closed_np_last_30'     => $closedNpLast30,
            'closed_non_evidence'   => $closedNonEvidence,
            'ne_under_review'       => $neUnderReview,
            'avg_processing_days'   => round((float) $avgProcessingDays, 1),
            'transfer_circles'      => $transferCircles,
            'merge_other'           => $mergeOther,
            'jurisdiction_wanted'   => $jurisdictionWanted,
            'overall_performance'   => $overallPerformance,
        ];

        // ─── Monthly Trends ───────────────────────────────────────
        $monthlyTrends = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthStr = sprintf('%04d-%02d', $year, $m);

            $received = Complaint::whereYear('created_at', $year)
                ->whereMonth('created_at', $m)
                ->count();

            $resolved = Complaint::where(function ($q) {
                $q->whereNotNull('final_status')
                  ->orWhereIn('status', ['invalid', 'irrelevant']);
            })
            ->whereYear('updated_at', $year)
            ->whereMonth('updated_at', $m)
            ->count();

            $converted = Enquiry::whereYear('created_at', $year)
                ->whereMonth('created_at', $m)
                ->count();

            $monthlyTrends[] = [
                'month'     => date('M', mktime(0, 0, 0, $m, 1)),
                'received'  => $received,
                'resolved'  => $resolved,
                'converted' => $converted,
            ];
        }

        // ─── Category Breakdown (web view) ─────────────────────────
        $categoryColors = [
            'Financial / Banking Fraud'      => '#FDDF00',
            'Cyberstalking'                  => '#264078',
            'Hacking / Unauthorized Access'  => '#267859',
            'Impersonation / Identity Theft' => '#9b3232',
        ];

        $rawCategories = OffenceType::selectRaw('offence_types.value, offence_types.name, count(*) as total')
            ->join('complaints', 'offence_types.value', '=', 'complaints.offence_type')
            ->groupBy('offence_types.value', 'offence_types.name')
            ->orderByDesc('total')
            ->get();

        $totalCategorized = $rawCategories->sum('total');
        $categoryBreakdown = $rawCategories->map(function ($item) use ($categoryColors, $totalCategorized) {
            return [
                'name'       => $item->name,
                'count'      => $item->total,
                'percentage' => $totalCategorized > 0
                    ? round(($item->total / $totalCategorized) * 100)
                    : 0,
                'color'      => $categoryColors[$item->name] ?? '#1950c7',
            ];
        });

        // ─── Recent Complaints ────────────────────────────────────
        $recentComplaints = Complaint::with('circle')
            ->latest()
            ->take(5)
            ->get();

        // ─── Recent Activity ──────────────────────────────────────
        $recentActivity = collect();

        if (class_exists(\Spatie\Activitylog\Models\Activity::class)) {
            $recentActivity = \Spatie\Activitylog\Models\Activity::latest()->take(10)->get()
                ->map(function ($a) {
                    return (object) [
                        'description' => $a->description,
                        'causer_name' => $a->causer?->name ?? 'System',
                        'created_at'  => $a->created_at,
                    ];
                });
        } else {
            $recentFromComplaints = Complaint::latest()->take(3)->get()->map(function ($c) {
                return (object) [
                    'description' => "New complaint registered — {$c->tracking_no}",
                    'causer_name' => $c->operator_name ?? 'N/A',
                    'created_at'  => $c->created_at,
                ];
            });

            $recentFromVerifications = Verification::with('complaint')
                ->latest()->take(3)->get()->map(function ($v) {
                    return (object) [
                        'description' => "Verification " . ($v->status ?? 'updated') . " — #{$v->complaint?->tracking_no}",
                        'causer_name' => $v->officer?->name ?? 'N/A',
                        'created_at'  => $v->created_at,
                    ];
                });

            $recentFromEnquiries = Enquiry::latest()->take(2)->get()->map(function ($e) {
                return (object) [
                    'description' => "Enquiry {$e->enquiry_number} — {$e->status}",
                    'causer_name' => $e->officer?->name ?? 'N/A',
                    'created_at'  => $e->created_at,
                ];
            });

            $recentFromCases = CaseFile::latest()->take(2)->get()->map(function ($cf) {
                return (object) [
                    'description' => "Case {$cf->fir_no} — {$cf->status}",
                    'causer_name' => $cf->investigationOfficer?->name ?? 'N/A',
                    'created_at'  => $cf->created_at,
                ];
            });

            $recentActivity = $recentFromComplaints
                ->concat($recentFromVerifications)
                ->concat($recentFromEnquiries)
                ->concat($recentFromCases)
                ->sortByDesc('created_at')
                ->take(10)
                ->values();
        }

        // ─── User Account Levels (static for now) ─────────────────
        $accountLevels = [];

        // ─── Available Years ──────────────────────────────────────
        $oldestYear = Complaint::min(DB::raw("YEAR(created_at)")) ?? now()->year;
        $availableYears = range(now()->year, $oldestYear);

        return view('pages.dashboard', compact(
            'stats',
            'monthlyTrends',
            'categoryBreakdown',
            'recentComplaints',
            'recentActivity',
            'accountLevels',
            'availableYears',
        ));
    }

    public function apiIndex()
    {
        try {
        $user = request()->user();
        $role = $user?->roles?->first()?->name ?? $user?->role ?? 'operator';
        $year = (int) request('year', now()->year);
        $dateFrom = request('date_from');
        $dateTo = request('date_to');
        $accountFilter = request('account');

        $cacheKey = 'dash:v2:' . ($user?->id ?: 0) . ':' . md5(json_encode([$role, $year, $dateFrom, $dateTo, $accountFilter]));

        $payload = Cache::remember($cacheKey, 60, function () use ($user, $role, $year, $dateFrom, $dateTo) {
        // ─── Role-based base queries (data isolation via Complaint::visibleTo) ──
        $cmpQuery = Complaint::visibleTo($user);

        if ($dateFrom) {
            $cmpQuery = $cmpQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $cmpQuery = $cmpQuery->whereDate('created_at', '<=', $dateTo);
        }

        // Subqueries — never pluck millions of IDs into PHP
        $verQuery = Verification::whereIn('complaint_id', (clone $cmpQuery)->select('id'));
        $enqQuery = Enquiry::whereIn('complaint_id', (clone $cmpQuery)->select('id'));
        $caseQuery = CaseFile::whereIn('enquiry_id', (clone $enqQuery)->select('id'));

        // ─── Stats ─────────────────────────────────────────────────
        $totalVerifications       = (clone $verQuery)->count();
        $pendingVerifications     = (clone $verQuery)->where('status', 'assigned')->count();
        $pendingReview            = (clone $verQuery)->whereIn('status', ['submitted', 'sent_back'])->count();

        $avgWaitDays = (clone $verQuery)->whereNotNull('assigned_at')
            ->selectRaw('COALESCE(AVG(DATEDIFF(COALESCE(assigned_at, created_at), created_at)), 0) as avg')
            ->value('avg');

        $finalizedCases       = (clone $caseQuery)->where('status', 'closed')->count();
        $finalizedThisMonth   = (clone $caseQuery)->where('status', 'closed')
            ->whereYear('updated_at', $year)
            ->whereMonth('updated_at', now()->month)
            ->count();

        $convertedToEnquiry = (clone $enqQuery)->count();
        $activeEnquiries    = (clone $enqQuery)->whereNotIn('status', ['approved', 'closed'])->count();

        $recommendedClosure = (clone $enqQuery)->where('recommendation', 'closure')->count();
        $awaitingApproval   = (clone $enqQuery)->where('status', 'cfr_submitted')->count();

        $closedNonPursuance = (clone $enqQuery)->where('closure_reason', 'non_pursuance')->count();
        $closedNpLast30     = (clone $enqQuery)->where('closure_reason', 'non_pursuance')
            ->where('created_at', '>=', now()->subDays(30))->count();

        $closedNonEvidence = (clone $enqQuery)->where('closure_reason', 'non_evidence')->count();
        $neUnderReview     = (clone $enqQuery)->where('closure_reason', 'non_evidence')
            ->where('status', 'in_progress')->count();

        $avgProcessingDays = (clone $cmpQuery)
            ->where(function ($q) {
                $q->whereNotNull('final_status')
                  ->orWhereIn('status', ['complete', 'invalid', 'irrelevant']);
            })
            ->selectRaw('COALESCE(AVG(DATEDIFF(updated_at, created_at)), 0) as avg')
            ->value('avg');

        $transferCircles = (clone $cmpQuery)->whereNotNull('circle_id')
            ->where('status', 'complete')->count();

        $mergeOther    = (clone $cmpQuery)->has('enquiries', '>=', 1)->count();
        $jurisdictionWanted = (clone $enqQuery)->where('status', 'registered')->count();

        $totalComplaints = (clone $cmpQuery)->count();
        $resolvedComplaints = (clone $cmpQuery)
            ->where(function ($q) {
                $q->whereNotNull('final_status')
                  ->orWhereIn('status', ['invalid', 'irrelevant']);
            })
            ->count();
        $overallPerformance = $totalComplaints > 0
            ? round(($resolvedComplaints / $totalComplaints) * 100) : 0;

        // ─── Workflow stages via COUNT queries (no full-table hydrate) ──
        $workflowStages = [
            'resolved' => (clone $cmpQuery)->where(function ($q) {
                $q->whereNotNull('final_status')->orWhereIn('status', ['invalid', 'irrelevant']);
            })->count(),
            'case_filed' => (clone $cmpQuery)->whereNull('final_status')
                ->whereNotIn('status', ['invalid', 'irrelevant'])
                ->whereHas('caseFiles')->count(),
            'enquiry' => (clone $cmpQuery)->whereNull('final_status')
                ->whereNotIn('status', ['invalid', 'irrelevant'])
                ->whereHas('enquiry')->whereDoesntHave('caseFiles')->count(),
            'verification_submitted' => (clone $cmpQuery)->whereNull('final_status')
                ->whereDoesntHave('enquiry')
                ->whereHas('verification', fn ($q) => $q->whereIn('status', ['submitted', 'approved']))
                ->count(),
            'verification' => (clone $cmpQuery)->whereNull('final_status')
                ->whereDoesntHave('enquiry')
                ->whereHas('verification', fn ($q) => $q->whereNotIn('status', ['submitted', 'approved', 'closed']))
                ->count(),
            'scrutiny_complete' => (clone $cmpQuery)->where('status', 'complete')->whereNotNull('tracking_no')
                ->whereNull('final_status')
                ->whereDoesntHave('verification')->count(),
            'registered' => (clone $cmpQuery)->where(function ($q) {
                $q->where('status', 'incomplete')->orWhereNull('tracking_no');
            })->whereNull('final_status')->whereDoesntHave('verification')->count(),
        ];

        $stageWeights = [
            'registered' => 10, 'scrutiny_complete' => 25, 'verification' => 40,
            'verification_submitted' => 60, 'enquiry' => 80, 'case_filed' => 90, 'resolved' => 100,
        ];
        $weighted = 0;
        $stageTotal = 0;
        foreach ($workflowStages as $k => $n) {
            $weighted += $n * ($stageWeights[$k] ?? 0);
            $stageTotal += $n;
        }
        $avgCompletion = $stageTotal > 0 ? (int) round($weighted / $stageTotal) : 0;

        $completeCount = (clone $cmpQuery)->where('status', 'complete')->whereNotNull('tracking_no')->count();
        $incompleteCount = (clone $cmpQuery)->where(function ($q) {
            $q->where('status', 'incomplete')
              ->orWhereNull('tracking_no')
              ->orWhereIn('scrutiny_result', ['incomplete', 'invalid', 'irrelevant']);
        })->count();
        $withVoCount = (clone $verQuery)->count();

        $stats = [
            'total_complaints'      => $totalComplaints,
            'complete_registrations'=> $completeCount,
            'incomplete_registrations' => $incompleteCount,
            'with_verification'     => $withVoCount,
            'total_verifications'   => $totalVerifications,
            'pending_verifications' => $pendingVerifications,
            'pending_review'        => $pendingReview,
            'avg_wait_days'         => round((float) $avgWaitDays, 1),
            'finalized_cases'       => $finalizedCases,
            'finalized_this_month'  => $finalizedThisMonth,
            'converted_to_enquiry'  => $convertedToEnquiry,
            'active_enquiries'      => $activeEnquiries,
            'recommended_closure'   => $recommendedClosure,
            'awaiting_approval'     => $awaitingApproval,
            'closed_non_pursuance'  => $closedNonPursuance,
            'closed_np_last_30'     => $closedNpLast30,
            'closed_non_evidence'   => $closedNonEvidence,
            'ne_under_review'       => $neUnderReview,
            'avg_processing_days'   => round((float) $avgProcessingDays, 1),
            'transfer_circles'      => $transferCircles,
            'merge_other'           => $mergeOther,
            'jurisdiction_wanted'   => $jurisdictionWanted,
            'overall_performance'   => $overallPerformance,
            'avg_completion'        => $avgCompletion,
            'workflow_stages'       => $workflowStages,
        ];
        // ─── Monthly Trends (3 grouped queries, not 36 counts) ─────
        $receivedMap = (clone $cmpQuery)->whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as m, COUNT(*) as c')
            ->groupBy('m')->pluck('c', 'm');
        $resolvedMap = (clone $cmpQuery)
            ->where(function ($q) {
                $q->whereNotNull('final_status')->orWhereIn('status', ['invalid', 'irrelevant']);
            })
            ->whereYear('updated_at', $year)
            ->selectRaw('MONTH(updated_at) as m, COUNT(*) as c')
            ->groupBy('m')->pluck('c', 'm');
        $convertedMap = (clone $enqQuery)->whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as m, COUNT(*) as c')
            ->groupBy('m')->pluck('c', 'm');

        $monthlyTrends = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyTrends[] = [
                'month'     => date('M', mktime(0, 0, 0, $m, 1)),
                'received'  => (int) ($receivedMap[$m] ?? 0),
                'resolved'  => (int) ($resolvedMap[$m] ?? 0),
                'converted' => (int) ($convertedMap[$m] ?? 0),
            ];
        }

        // ─── Category Breakdown (scoped to visible complaints) ─────
        $categoryColors = [
            'Financial / Banking Fraud'      => '#FDDF00',
            'Cyberstalking'                  => '#264078',
            'Hacking / Unauthorized Access'  => '#267859',
            'Impersonation / Identity Theft' => '#9b3232',
        ];

        $categoryBreakdown = OffenceType::query()
            ->selectRaw('offence_types.value, offence_types.name, COUNT(*) as total')
            ->join('complaints', 'offence_types.value', '=', 'complaints.offence_type')
            ->whereIn('complaints.id', (clone $cmpQuery)->select('id'))
            ->groupBy('offence_types.value', 'offence_types.name')
            ->orderByDesc('total')
            ->limit(12)
            ->get();

        $totalCategorized = $categoryBreakdown->sum('total');
        $categoryBreakdown = $categoryBreakdown->map(function ($item) use ($categoryColors, $totalCategorized) {
            $item->color = $categoryColors[$item->name] ?? '#1950c7';
            $item->percentage = $totalCategorized > 0 ? round(($item->total / $totalCategorized) * 100) : 0;
            return $item;
        });

        $recentLimit = ($role === 'operator') ? 20 : 5;
        $recentComplaints = (clone $cmpQuery)
            ->with(['verification.officer', 'enquiry', 'caseFiles'])
            ->latest('id')
            ->take($recentLimit)
            ->get()
            ->map(function (Complaint $c) {
                return [
                    'id'                  => $c->id,
                    'tracking_no'         => $c->tracking_no,
                    'diary_no'            => $c->diary_no,
                    'complainant_name'    => $c->complainant_name,
                    'offence_type'        => $c->offence_type,
                    'priority_type'       => $c->priority_type,
                    'operator_name'       => $c->operator_name,
                    'status'              => $c->status,
                    'scrutiny_result'     => $c->scrutiny_result,
                    'created_at'          => $c->created_at?->toISOString(),
                    'progress_percent'    => $c->progressPercent(),
                    'progress_stage'      => $c->progressStage(),
                    'verification_status' => $c->verification?->status,
                    'officer_name'        => $c->verification?->officer?->name,
                ];
            });

        return compact('stats', 'monthlyTrends', 'categoryBreakdown', 'recentComplaints');
        });

        return response()->json($payload);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }
}
