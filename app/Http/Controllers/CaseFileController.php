<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\CaseActivity;
use App\Models\CaseLegalOpinion;
use App\Models\CaseApproval;
use App\Models\Enquiry;
use App\Notifications\CaseAssignedNotification;
use App\Services\FirNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CaseFileController extends Controller
{
    public function index()
    {
        $query = CaseFile::visibleTo(request()->user())->with('enquiry', 'investigationOfficer');

        $cases = $query->latest()->paginate(15);

        if (request()->expectsJson()) {
            return response()->json($cases);
        }

        return view('pages.dac-pending', compact('cases'));
    }

    public function create()
    {
        $enquiries = Enquiry::whereIn('status', ['approved', 'closed'])->get();
        return view('pages.dac-new', compact('enquiries'));
    }

    public function store(Request $request, FirNumberGenerator $gen)
    {
        $data = $request->validate([
            'enquiry_id'              => 'required|integer|exists:enquiries,id',
            'fir_no'                  => 'nullable|string|unique:cases,fir_no',
            'investigation_officer_id' => 'nullable|integer|exists:users,id',
            'status'                  => 'nullable|string|max:50',
            'recommendation'          => 'nullable|string|max:30',
            'transfer_department'     => 'nullable|string|max:255',
            'transfer_circle'         => 'nullable|string|max:255',
            'merge_complaint_id'      => 'nullable|string|max:255',
            'actions'                 => 'nullable|string',
            'arrests'                 => 'nullable|string',
            'ad_legal_opinion'       => 'nullable|string',
            'add_director_decision'  => 'nullable|string',
            'dd_legal_opinion'       => 'nullable|string',
            'incharge_approval'      => 'nullable|string|in:agree,review',
            'incharge_remarks'       => 'nullable|string',
        ]);

        // Decode JSON string arrays from FormData
        foreach (['actions', 'arrests'] as $field) {
            if (!empty($data[$field])) {
                $decoded = json_decode($data[$field], true);
                $data[$field] = is_array($decoded) ? $decoded : [];
            } else {
                $data[$field] = [];
            }
        }

        $caseFile = DB::transaction(function () use ($data, $request, $gen) {
            $enquiry = Enquiry::findOrFail($data['enquiry_id']);

            $caseFile = CaseFile::create([
                'enquiry_id'              => $data['enquiry_id'],
                'fir_no'                  => $data['fir_no'] ?? $gen->generate(),
                'investigation_officer_id' => $data['investigation_officer_id'] ?? null,
                'status'                  => 'registered',
            ]);

            // Create activities from checked actions
            if (!empty($data['actions'])) {
                $actionTypes = [
                    'dac_request'   => 'DAC Request',
                    'mobile_record' => 'Mobile Record Obtained',
                    'bank_record'   => 'Bank Record Obtained',
                    'notice'        => 'Notice Issued',
                    'diary'         => 'Diary Maintained',
                    'seizure'       => 'Seizure Made',
                    'forensic_report' => 'Forensic Report',
                    'recovery'      => 'Recovery Effected',
                    'raid'          => 'Raid Conducted',
                ];

                foreach ($data['actions'] as $action) {
                    $description = $actionTypes[$action] ?? $action;
                    CaseActivity::create([
                        'case_id'       => $caseFile->id,
                        'type'          => $action,
                        'description'   => $description,
                        'activity_date' => now(),
                        'created_by'    => $request->user()->id,
                    ]);
                }
            }

            // Create arrests
            if (!empty($data['arrests'])) {
                foreach ($data['arrests'] as $a) {
                    $caseFile->arrests()->create([
                        'accused_name'   => $a['accused_name'],
                        'cnic'           => $a['cnic'],
                        'arrest_date'    => $a['arrest_date'],
                        'remand_details' => $a['remand_details'] ?? null,
                    ]);
                }
            }

            // Legal opinions
            if (!empty($data['ad_legal_opinion'])) {
                CaseLegalOpinion::create([
                    'case_id'     => $caseFile->id,
                    'role'        => 'ad_legal',
                    'opinion_text'=> $data['ad_legal_opinion'],
                    'decision'    => $data['ad_legal_opinion'],
                    'created_by'  => $request->user()->id,
                ]);
            }

            if (!empty($data['add_director_decision'])) {
                CaseLegalOpinion::create([
                    'case_id'     => $caseFile->id,
                    'role'        => 'additional_director',
                    'opinion_text'=> '',
                    'decision'    => $data['add_director_decision'],
                    'created_by'  => $request->user()->id,
                ]);
            }

            if (!empty($data['dd_legal_opinion'])) {
                CaseLegalOpinion::create([
                    'case_id'     => $caseFile->id,
                    'role'        => 'dd_legal',
                    'opinion_text'=> '',
                    'decision'    => $data['dd_legal_opinion'],
                    'created_by'  => $request->user()->id,
                ]);
            }

            // Incharge approval
            if (!empty($data['incharge_approval'])) {
                CaseApproval::create([
                    'case_id'           => $caseFile->id,
                    'circle_incharge_id' => $request->user()->id,
                    'decision'          => $data['incharge_approval'],
                    'remarks'           => $data['incharge_remarks'] ?? null,
                ]);
            }

            return $caseFile;
        });

        if ($caseFile->investigation_officer_id) {
            $caseFile->investigationOfficer?->notify(new CaseAssignedNotification($caseFile));
        }

        return redirect()->route('dashboard')
            ->with('success', 'Case/FIR registered — ' . $caseFile->fir_no);
    }

    public function show(CaseFile $caseFile)
    {
        abort_unless(
            CaseFile::visibleTo(request()->user())->whereKey($caseFile->id)->exists(),
            404
        );

        $caseFile->load(
            'enquiry.complaint',
            'investigationOfficer',
            'activities.creator',
            'arrests',
            'legalOpinions.creator',
            'approvals.circleIncharge'
        );

        return response()->json($caseFile);
    }

    public function assignOfficer(Request $request, CaseFile $caseFile)
    {
        $data = $request->validate([
            'investigation_officer_id' => 'required|integer|exists:users,id',
        ]);

        $caseFile->update([
            'investigation_officer_id' => $data['investigation_officer_id'],
            'status'                   => 'assigned',
        ]);

        $caseFile->investigationOfficer?->notify(new CaseAssignedNotification($caseFile));

        return response()->json([
            'message' => 'Investigation officer assigned',
            'data'    => $caseFile->fresh()->load('investigationOfficer'),
        ]);
    }

    public function submitCfr(Request $request, CaseFile $caseFile)
    {
        $data = $request->validate([
            'cfr_summary'    => 'required|string',
            'recommendation' => 'required|string|in:transfer,merge,challan_submission',
        ]);

        $caseFile->update([
            'status'         => 'cfr_submitted',
            'recommendation' => $data['recommendation'],
        ]);

        CaseActivity::create([
            'case_id'       => $caseFile->id,
            'type'          => 'cfr',
            'description'   => $data['cfr_summary'],
            'activity_date' => now(),
            'created_by'    => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'CFR submitted',
            'data'    => $caseFile->fresh()->load('activities'),
        ]);
    }

    public function closed()
    {
        $cases = CaseFile::visibleTo(request()->user())
            ->where('status', 'closed')
            ->with('enquiry', 'investigationOfficer')
            ->latest()
            ->paginate(15);

        return response()->json($cases);
    }

    public function approve(Request $request, CaseFile $caseFile)
    {
        $data = $request->validate([
            'decision'          => 'required|string|in:agree,review',
            'remarks'           => 'nullable|string|max:2000',
            'recommendation'    => 'nullable|string|in:transfer,merge,challan_submission',
            'closure_reason'    => 'nullable|string|max:50',
        ]);

        CaseApproval::create([
            'case_id'           => $caseFile->id,
            'circle_incharge_id' => $request->user()->id,
            'decision'          => $data['decision'],
            'remarks'           => $data['remarks'] ?? null,
        ]);

        $caseFile->update([
            'status'         => $data['decision'] === 'agree' ? 'approved' : 'in_progress',
            'recommendation' => $data['recommendation'] ?? $caseFile->recommendation,
        ]);

        return response()->json([
            'message' => 'Case ' . ($data['decision'] === 'agree' ? 'approved' : 'returned for review'),
            'data'    => $caseFile->fresh()->load('approvals'),
        ]);
    }
}
