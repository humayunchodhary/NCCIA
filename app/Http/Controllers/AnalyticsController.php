<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\OffenceType;
use App\Models\User;
use App\Models\Verification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $year = request('year', now()->year);

        $cmpQuery = Complaint::visibleTo($user);

        $verQuery = Verification::whereIn('complaint_id', (clone $cmpQuery)->pluck('id'));
        $enqQuery = Enquiry::whereIn('complaint_id', (clone $cmpQuery)->pluck('id'));
        $caseEnqIds = (clone $enqQuery)->pluck('id');
        $caseQuery = $caseEnqIds->isNotEmpty()
            ? CaseFile::whereIn('enquiry_id', $caseEnqIds)
            : CaseFile::whereRaw('0=1');

        // ─── Performance Metrics ──────────────────────────────────
        $totalComplaints    = (clone $cmpQuery)->count();
        $resolvedComplaints = (clone $cmpQuery)->where(function ($q) {
            $q->whereNotNull('final_status')
              ->orWhereIn('status', ['invalid', 'irrelevant']);
        })->count();
        $pendingComplaints  = $totalComplaints - $resolvedComplaints;

        $avgResolutionDays = (clone $cmpQuery)->where(function ($q) {
            $q->whereNotNull('final_status')
              ->orWhereIn('status', ['invalid', 'irrelevant']);
        })
            ->selectRaw('COALESCE(AVG(DATEDIFF(COALESCE(updated_at, created_at), created_at)), 0) as avg')
            ->value('avg');

        $closedCases = (clone $caseQuery)->where('status', 'closed')->count();
        $totalCases  = (clone $caseQuery)->count();
        $convictionRate = $totalCases > 0 ? round(($closedCases / $totalCases) * 100) : 0;

        $totalAssignments = 0;
        $completedAssignments = 0;

        // ─── Officer Workload ─────────────────────────────────────
        $officerWorkload = collect();
        $officerRoles = [
            'verification_officer' => ['table' => Verification::class, 'col' => 'verification_officer_id', 'done' => ['submitted', 'approved']],
            'enquiry_officer'      => ['table' => Enquiry::class,      'col' => 'enquiry_officer_id',      'done' => ['approved', 'closed', 'converted_to_case']],
            'investigation_officer'=> ['table' => CaseFile::class,     'col' => 'investigation_officer_id', 'done' => ['closed']],
        ];

        $officers = User::whereHas('roles')->with('roles')->get();

        foreach ($officers as $off) {
            $roleName = $off->roles->first()?->name ?? $off->role ?? '';
            $spec = $officerRoles[$roleName] ?? null;
            if (!$spec) {
                continue;
            }

            $model = $spec['table'];
            $base = $model::where($spec['col'], $off->id);

            // Respect data isolation for non-supervisory viewers
            if (method_exists($model, 'visibleTo') && !$user->seesAllData()) {
                $base = $model::visibleTo($user)->where($spec['col'], $off->id);
            }

            $assigned = (clone $base)->count();
            $completed = (clone $base)->whereIn('status', $spec['done'])->count();

            $totalAssignments += $assigned;
            $completedAssignments += $completed;

            $officerWorkload->push([
                'id'             => $off->id,
                'name'           => $off->name,
                'role'           => ucwords(str_replace('_', ' ', $roleName)),
                'assigned'       => $assigned,
                'completed'      => $completed,
                'pending'        => $assigned - $completed,
                'completionRate' => $assigned > 0 ? round(($completed / $assigned) * 100) : 0,
            ]);
        }

        $officerWorkload = $officerWorkload->sortByDesc('assigned')->values();
        $officerEfficiency = $totalAssignments > 0
            ? round(($completedAssignments / $totalAssignments) * 100)
            : 0;

        $performanceMetrics = [
            'totalComplaints'    => $totalComplaints,
            'resolvedComplaints' => $resolvedComplaints,
            'pendingComplaints'  => $pendingComplaints,
            'avgResolutionDays'  => round((float) $avgResolutionDays, 1),
            'convictionRate'     => $convictionRate,
            'officerEfficiency'  => $officerEfficiency,
        ];

        // ─── Monthly Trends ───────────────────────────────────────
        $monthlyTrends = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyTrends[] = [
                'month'     => date('M', mktime(0, 0, 0, $m, 1)),
                'received'  => (clone $cmpQuery)->whereYear('created_at', $year)->whereMonth('created_at', $m)->count(),
                'resolved'  => (clone $cmpQuery)->where(function ($q) {
                    $q->whereNotNull('final_status')
                      ->orWhereIn('status', ['invalid', 'irrelevant']);
                })->whereYear('updated_at', $year)->whereMonth('updated_at', $m)->count(),
                'converted' => (clone $enqQuery)->whereYear('created_at', $year)->whereMonth('created_at', $m)->count(),
            ];
        }

        // ─── Category Breakdown ───────────────────────────────────
        $categoryColors = [
            'Financial / Banking Fraud'      => '#FDDF00',
            'Cyberstalking'                  => '#264078',
            'Hacking / Unauthorized Access'  => '#267859',
            'Impersonation / Identity Theft' => '#9b3232',
        ];

        $categoryBreakdown = OffenceType::selectRaw('value, name, count(*) as total')
            ->join('complaints', 'offence_types.value', '=', 'complaints.offence_type')
            ->groupBy('value', 'name')
            ->orderByDesc('total')
            ->get();

        $totalCategorized = $categoryBreakdown->sum('total');
        $categoryBreakdown = $categoryBreakdown->map(function ($item) use ($categoryColors, $totalCategorized) {
            $item->color = $categoryColors[$item->name] ?? '#1950c7';
            $item->percentage = $totalCategorized > 0 ? round(($item->total / $totalCategorized) * 100) : 0;
            return $item;
        });

        // ─── Circle Performance ───────────────────────────────────
        $circlePerformance = DB::table('circles')
            ->leftJoin('complaints', 'complaints.circle_id', '=', 'circles.id')
            ->selectRaw('circles.id, circles.name as circle, count(complaints.id) as total, sum(case when complaints.status = ? then 1 else 0 end) as resolved', ['complete'])
            ->groupBy('circles.id', 'circles.name')
            ->get()
            ->map(function ($c) {
                $c->percentage = $c->total > 0 ? round(($c->resolved / $c->total) * 100) : 0;
                return $c;
            });

        // ─── Top Officers ─────────────────────────────────────────
        $topOfficers = $officerWorkload->where('assigned', '>', 0)
            ->sortByDesc('completionRate')
            ->take(10)
            ->map(function ($o) {
                return [
                    'id'              => $o['id'],
                    'name'            => $o['name'],
                    'role'            => $o['role'],
                    'casesHandled'    => $o['assigned'],
                    'resolutionRate'  => $o['completionRate'],
                ];
            })
            ->values();

        // ─── Case Outcomes ────────────────────────────────────────
        $outcomeCounts = (clone $cmpQuery)->get()->groupBy(function ($c) {
            if ($c->progressPercent() >= 100) return 'Resolved';
            if ($c->progressPercent() >= 90)  return 'Case Filed';
            if ($c->progressPercent() >= 70)  return 'Enquiry Stage';
            if ($c->progressPercent() >= 40)  return 'Verification Stage';
            return 'Registered';
        });

        $totalOutcomes = (clone $cmpQuery)->count() ?: 1;
        $caseOutcomes = $outcomeCounts->map(function ($group, $outcome) use ($totalOutcomes) {
            return [
                'outcome'    => $outcome,
                'count'      => $group->count(),
                'percentage' => round(($group->count() / $totalOutcomes) * 100),
            ];
        })->values();

        return response()->json(compact(
            'performanceMetrics',
            'monthlyTrends',
            'categoryBreakdown',
            'circlePerformance',
            'officerWorkload',
            'topOfficers',
            'caseOutcomes'
        ));
    }
}
