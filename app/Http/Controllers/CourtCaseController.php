<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\CourtCase;
use App\Models\CourtReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourtCaseController extends Controller
{
    public function index()
    {
        $courtCases = CourtCase::visibleTo(request()->user())
            ->with('caseFile.enquiry', 'caseFile.investigationOfficer')
            ->latest()
            ->paginate(15);

        return response()->json($courtCases);
    }

    public function show(CourtCase $courtCase)
    {
        abort_unless(
            CourtCase::visibleTo(request()->user())->whereKey($courtCase->id)->exists(),
            404
        );

        $courtCase->load(
            'caseFile.enquiry.complaint',
            'caseFile.investigationOfficer',
            'hearings',
            'reports.submitter',
            'verdicts'
        );

        return response()->json($courtCase);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'case_id'     => 'required|integer|exists:cases,id',
            'court_name'  => 'required|string|max:255',
            'judge_name'  => 'nullable|string|max:255',
            'filing_date' => 'required|date',
        ]);

        $courtCase = DB::transaction(function () use ($data) {
            $caseFile = CaseFile::findOrFail($data['case_id']);
            $caseFile->update(['status' => 'in_progress']);

            return CourtCase::create([
                'case_id'     => $data['case_id'],
                'court_name'  => $data['court_name'],
                'judge_name'  => $data['judge_name'] ?? null,
                'filing_date' => $data['filing_date'],
                'status'      => 'filed',
            ]);
        });

        return response()->json([
            'message' => 'Court case filed',
            'data'    => $courtCase->load('caseFile'),
        ], 201);
    }

    public function update(Request $request, CourtCase $courtCase)
    {
        $data = $request->validate([
            'court_name'  => 'sometimes|string|max:255',
            'judge_name'  => 'nullable|string|max:255',
            'status'      => 'nullable|string|max:50',
            'filing_date' => 'sometimes|date',
        ]);

        $courtCase->update($data);

        return response()->json([
            'message' => 'Court case updated',
            'data'    => $courtCase->fresh()->load('caseFile'),
        ]);
    }

    public function destroy(CourtCase $courtCase)
    {
        $courtCase->hearings()->delete();
        $courtCase->reports()->delete();
        $courtCase->verdicts()->delete();
        $courtCase->delete();

        return response()->json(['message' => 'Court case deleted']);
    }

    public function verdict(Request $request, CourtCase $courtCase)
    {
        $data = $request->validate([
            'verdict'      => 'required|string|in:conviction,acquittal,discharge,dismissed',
            'verdict_date' => 'required|date',
            'details'      => 'nullable|string|max:5000',
        ]);

        $verdict = $courtCase->verdicts()->create([
            'verdict'      => $data['verdict'],
            'verdict_date' => $data['verdict_date'],
            'details'      => $data['details'] ?? null,
        ]);

        $courtCase->update(['status' => 'verdict_given']);

        return response()->json([
            'message' => 'Verdict recorded',
            'data'    => $verdict,
        ], 201);
    }

    public function forwardReport(Request $request, CourtCase $courtCase)
    {
        $data = $request->validate([
            'report_type' => 'required|string|in:173_crpc,supplementary',
            'report_file' => 'required|file|max:20480|mimes:pdf,doc,docx',
        ]);

        $path = $request->file('report_file')->store('court-reports');

        $report = $courtCase->reports()->create([
            'report_type'  => $data['report_type'],
            'file_path'    => $path,
            'submitted_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Report forwarded to court',
            'data'    => $report->load('submitter'),
        ], 201);
    }
}
