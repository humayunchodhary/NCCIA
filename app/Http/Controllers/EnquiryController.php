<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\EnquiryActivity;
use App\Models\EnquiryLegalOpinion;
use App\Models\EnquiryApproval;
use App\Models\User;
use App\Notifications\EnquiryAssignedNotification;
use App\Services\EnquiryNumberGenerator;
use App\Services\FirNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnquiryController extends Controller
{
    public function store(Request $request, EnquiryNumberGenerator $gen)
    {
        $data = $request->validate([
            'tracking_no'             => 'nullable|string|max:255',
            'complaint_id'            => 'nullable|integer|exists:complaints,id',
            'enquiry_number'          => 'nullable|string|max:255',
            'reg_date'                => 'nullable|date',
            'assignment_date'         => 'nullable|date',
            'status'                  => 'required|string|in:registered,assigned,in_progress,cfr_submitted,approved,closed,transferred,converted_to_case',

            'enquiry_officer_id'      => 'nullable|integer|exists:users,id',
            'recommendation'          => 'nullable|string|max:50',
            'closure_reason'          => 'nullable|string|max:50',
            'transfer_department'     => 'nullable|string|max:255',
            'transfer_circle'         => 'nullable|string|max:255',
            'merge_complaint_id'      => 'nullable|string|max:255',
            'cfr_summary'             => 'nullable|string',

            'activities'              => 'nullable|string',
            'legal_opinions'          => 'nullable|string',
            'approvals'               => 'nullable|string',
        ]);

        // Decode JSON string arrays from FormData
        foreach (['activities', 'legal_opinions', 'approvals'] as $field) {
            if (!empty($data[$field])) {
                $decoded = json_decode($data[$field], true);
                $data[$field] = is_array($decoded) ? $decoded : [];
            } else {
                $data[$field] = [];
            }
        }

        $complaint = null;
        if (!empty($data['tracking_no'])) {
            $complaint = Complaint::where('tracking_no', $data['tracking_no'])->first();
        } elseif (!empty($data['complaint_id'])) {
            $complaint = Complaint::find($data['complaint_id']);
        }

        $enquiry = DB::transaction(function () use ($data, $complaint, $gen, $request) {
            $enquiry = Enquiry::create([
                'complaint_id'    => $complaint?->id,
                'enquiry_number'  => $data['enquiry_number'] ?? $gen->generate(),
                'enquiry_officer_id' => $data['enquiry_officer_id'] ?? null,
                'status'          => $data['status'] ?? 'registered',
                'reg_date'        => $data['reg_date'] ?? now()->toDateString(),
                'assignment_date' => $data['assignment_date'] ?? null,
                'recommendation'  => $data['recommendation'] ?? null,
                'closure_reason'  => $data['closure_reason'] ?? null,
                'transfer_department' => $data['transfer_department'] ?? null,
                'transfer_circle' => $data['transfer_circle'] ?? null,
                'cfr_summary'     => $data['cfr_summary'] ?? null,
            ]);

            $actionLabels = [
                'dac_request'  => 'DAC Request',
                'bank_record'  => 'Bank Record Obtained',
                'search_seize' => 'Search & Seize',
                'notices'      => 'Notices Issued',
                'diaries'      => 'Diaries Maintained',
                'seizures'     => 'Seizures Made',
                'recoveries'   => 'Recoveries Effected',
                'cfr'          => 'CFR Submitted',
            ];

            if (!empty($data['activities'])) {
                foreach ($data['activities'] as $action) {
                    $type = is_array($action) ? ($action['type'] ?? null) : $action;
                    if (!$type) continue;
                    $label = $actionLabels[$type] ?? $type;
                    EnquiryActivity::create([
                        'enquiry_id'    => $enquiry->id,
                        'type'          => $type,
                        'description'   => $label,
                        'activity_date' => $data['assignment_date'] ?? now(),
                        'created_by'    => $request->user()->id,
                    ]);
                }
            }

            if (!empty($data['notice_type'])) {
                EnquiryActivity::create([
                    'enquiry_id'    => $enquiry->id,
                    'type'          => 'notice',
                    'description'   => $data['notice_type'] . ($data['notice_date'] ? ' on ' . $data['notice_date'] : ''),
                    'activity_date' => $data['notice_date'] ?? now(),
                    'created_by'    => $request->user()->id,
                ]);
            }

            if (!empty($data['ad_legal_opinion'])) {
                EnquiryLegalOpinion::create([
                    'enquiry_id'  => $enquiry->id,
                    'role'        => 'ad_legal',
                    'opinion_text'=> $data['ad_legal_opinion'],
                    'decision'    => $data['ad_legal_opinion'],
                    'created_by'  => $request->user()->id,
                ]);
            }

            if (!empty($data['add_director_decision'])) {
                EnquiryLegalOpinion::create([
                    'enquiry_id'  => $enquiry->id,
                    'role'        => 'additional_director',
                    'opinion_text'=> '',
                    'decision'    => $data['add_director_decision'],
                    'created_by'  => $request->user()->id,
                ]);
            }

            if (!empty($data['dd_legal_opinion'])) {
                EnquiryLegalOpinion::create([
                    'enquiry_id'  => $enquiry->id,
                    'role'        => 'dd_legal',
                    'opinion_text'=> '',
                    'decision'    => $data['dd_legal_opinion'],
                    'created_by'  => $request->user()->id,
                ]);
            }

            if (!empty($data['incharge_approval'])) {
                EnquiryApproval::create([
                    'enquiry_id'        => $enquiry->id,
                    'circle_incharge_id' => $request->user()->id,
                    'decision'          => $data['incharge_approval'],
                    'remarks'           => $data['incharge_remarks'] ?? null,
                ]);
            }

            return $enquiry;
        });

        if ($enquiry->enquiry_officer_id) {
            $enquiry->officer?->notify(new EnquiryAssignedNotification($enquiry));
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Enquiry registered', 'data' => $enquiry->load('complaint', 'officer')], 201);
        }

        return redirect()->route('enquiries.index')
            ->with('success', 'Enquiry registered — ' . $enquiry->enquiry_number);
    }

    public function index()
    {
        $query = Enquiry::visibleTo(request()->user())->with('complaint', 'officer');

        if ($search = request('search')) {
            $query->whereHas('complaint', function ($q) use ($search) {
                $q->where('complainant_name', 'like', "%{$search}%")
                  ->orWhere('tracking_no', 'like', "%{$search}%");
            })->orWhere('id', 'like', "%{$search}%");
        }

        if ($status = request('status')) {
            $statuses = explode(',', $status);
            $query->whereIn('status', $statuses);
        }

        $enquiries = $query->latest()->paginate(15);

        $stats = [
            'total'    => Enquiry::count(),
            'pending'  => Enquiry::where('status', 'registered')->count(),
            'progress' => Enquiry::whereIn('status', ['assigned', 'in_progress'])->count(),
            'approved' => Enquiry::where('status', 'approved')->count(),
        ];

        if (request()->expectsJson()) {
            return response()->json($enquiries);
        }

        return view('enquiries.index', compact('enquiries', 'stats'));
    }

    public function stats()
    {
        return response()->json([
            'total'    => Enquiry::count(),
            'pending'  => Enquiry::where('status', 'registered')->count(),
            'progress' => Enquiry::whereIn('status', ['assigned', 'in_progress'])->count(),
            'approved' => Enquiry::where('status', 'approved')->count(),
        ]);
    }

    public function show(Enquiry $enquiry)
    {
        abort_unless(
            Enquiry::visibleTo(request()->user())->whereKey($enquiry->id)->exists(),
            404
        );

        $enquiry->load('complaint', 'officer', 'activities.creator', 'legalOpinions.creator', 'approvals.circleIncharge');
        return response()->json($enquiry);
    }

    public function update(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'enquiry_number'       => 'nullable|string|max:255',
            'enquiry_officer_id'   => 'nullable|integer|exists:users,id',
            'status'               => 'nullable|in:registered,assigned,in_progress,cfr_submitted,approved,closed,transferred,converted_to_case',
            'recommendation'       => 'nullable|string|max:30',
            'closure_reason'       => 'nullable|string|max:30',
            'transfer_department'  => 'nullable|string|max:255',
            'transfer_circle'      => 'nullable|string|max:255',
            'merge_complaint_id'   => 'nullable|string|max:255',
            'reg_date'             => 'nullable|date',
            'cfr_summary'          => 'nullable|string',
        ]);

        $updateData = [
            'enquiry_officer_id' => $data['enquiry_officer_id'] ?? $enquiry->enquiry_officer_id,
            'status'             => $data['status'] ?? $enquiry->status,
            'recommendation'     => $data['recommendation'] ?? $enquiry->recommendation,
            'closure_reason'     => $data['closure_reason'] ?? $enquiry->closure_reason,
            'transfer_department'=> $data['transfer_department'] ?? $enquiry->transfer_department,
            'transfer_circle'    => $data['transfer_circle'] ?? $enquiry->transfer_circle,
            'enquiry_number'     => $data['enquiry_number'] ?? $enquiry->enquiry_number,
            'reg_date'           => $data['reg_date'] ?? $enquiry->reg_date,
            'cfr_summary'        => $data['cfr_summary'] ?? $enquiry->cfr_summary,
        ];

        if (!empty($data['merge_complaint_id'])) {
            $mergeComplaint = Complaint::where('tracking_no', $data['merge_complaint_id'])->first();
            $updateData['merge_complaint_id'] = $mergeComplaint?->id;
        }

        $officerChanged = !empty($data['enquiry_officer_id'])
            && (int) $data['enquiry_officer_id'] !== $enquiry->enquiry_officer_id;

        $enquiry->update($updateData);

        if ($officerChanged) {
            $enquiry->officer?->notify(new EnquiryAssignedNotification($enquiry));
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Enquiry updated successfully', 'data' => $enquiry->fresh()->load('complaint', 'officer')]);
        }

        return redirect()->route('enquiries.index')
            ->with('success', 'Enquiry updated successfully');
    }

    public function destroy(Enquiry $enquiry)
    {
        activity()->useLog('enquiries')
            ->performedOn($enquiry)
            ->causedBy(auth()->user())
            ->withProperties(['enquiry_number' => $enquiry->enquiry_number])
            ->log('Enquiry deleted: ' . $enquiry->enquiry_number);

        $enquiry->delete();

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Enquiry deleted successfully']);
        }

        return redirect()->route('enquiries.index')
            ->with('success', 'Enquiry deleted successfully');
    }

    public function assign(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'enquiry_officer_id' => 'required|integer|exists:users,id',
        ]);

        $enquiry->update([
            'enquiry_officer_id' => $data['enquiry_officer_id'],
            'status'             => 'assigned',
            'assignment_date'    => now(),
        ]);

        $enquiry->officer?->notify(new EnquiryAssignedNotification($enquiry));

        return response()->json([
            'message' => 'Enquiry officer assigned',
            'data'    => $enquiry->fresh()->load('officer'),
        ]);
    }

    public function changeOfficer(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'enquiry_officer_id' => 'required|integer|exists:users,id',
        ]);

        $enquiry->update([
            'enquiry_officer_id' => $data['enquiry_officer_id'],
            'status'             => 'assigned',
            'assignment_date'    => now(),
        ]);

        $enquiry->officer?->notify(new EnquiryAssignedNotification($enquiry));

        return response()->json([
            'message' => 'Enquiry officer reassigned',
            'data'    => $enquiry->fresh()->load('officer'),
        ]);
    }

    public function submitCfr(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'cfr_summary'   => 'required|string',
            'recommendation' => 'required|string|in:closure,transfer,convert_to_case',
        ]);

        $enquiry->update([
            'status'         => 'cfr_submitted',
            'recommendation' => $data['recommendation'],
            'cfr_summary'    => $data['cfr_summary'],
            'submitted_at'   => now(),
        ]);

        EnquiryActivity::create([
            'enquiry_id'    => $enquiry->id,
            'type'          => 'cfr',
            'description'   => $data['cfr_summary'],
            'activity_date' => now(),
            'created_by'    => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'CFR submitted successfully',
            'data'    => $enquiry->fresh()->load('activities'),
        ]);
    }

    public function approve(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'decision'           => 'required|string|in:agree,review',
            'remarks'            => 'nullable|string|max:2000',
            'recommendation'     => 'nullable|string|in:closure,transfer,merge,convert_to_case',
            'closure_reason'     => 'nullable|string|in:non_pursuance,irrelevant,invalid,lack_of_evidence,compromise',
            'merge_complaint_id' => 'nullable|integer|exists:complaints,id',
            'transfer_department'=> 'nullable|string|max:255',
            'transfer_circle'    => 'nullable|string|max:255',
        ]);

        $approval = EnquiryApproval::create([
            'enquiry_id'         => $enquiry->id,
            'circle_incharge_id' => $request->user()->id,
            'decision'           => $data['decision'],
            'remarks'            => $data['remarks'] ?? null,
        ]);

        $updateData = [
            'recommendation'     => $data['recommendation'] ?? $enquiry->recommendation,
            'closure_reason'     => $data['closure_reason'] ?? null,
            'transfer_department'=> $data['transfer_department'] ?? null,
            'transfer_circle'    => $data['transfer_circle'] ?? null,
            'merge_complaint_id' => $data['merge_complaint_id'] ?? null,
        ];

        $complaint = $enquiry->complaint;

        if ($data['decision'] === 'agree') {
            $updateData['status']      = 'approved';
            $updateData['approved_at'] = now();

            switch ($data['recommendation']) {
                case 'closure':
                    $complaint->update([
                        'status'         => 'closed',
                        'final_status'   => 'closed',
                        'closure_reason' => $data['closure_reason'] ?? null,
                    ]);
                    break;

                case 'merge':
                    $complaint->update([
                        'status'         => 'merged',
                        'final_status'   => 'merged',
                        'merged_with_id' => $data['merge_complaint_id'] ?? null,
                    ]);
                    break;

                case 'transfer':
                    $complaint->update([
                        'status'                => 'transferred',
                        'final_status'          => 'transferred',
                        'transfer_to_department'=> $data['transfer_department'] ?? null,
                        'transfer_to_circle_id' => null,
                    ]);
                    break;

                case 'convert_to_case':
                    $gen = app(FirNumberGenerator::class);
                    $caseFile = CaseFile::create([
                        'enquiry_id'   => $enquiry->id,
                        'fir_no'       => $gen->generate(),
                        'status'       => 'registered',
                        'complaint_id' => $complaint->id,
                    ]);
                    $updateData['case_file_id'] = $caseFile->id;
                    $complaint->update([
                        'status'       => 'case_registered',
                        'final_status' => 'case_registered',
                    ]);
                    break;
            }
        } else {
            $updateData['status'] = 'in_progress';
        }

        $enquiry->update($updateData);

        return response()->json([
            'message' => 'Enquiry ' . ($data['decision'] === 'agree' ? 'approved' : 'sent for review'),
            'data'    => [
                'enquiry'  => $enquiry->fresh()->load('approvals'),
                'approval' => $approval,
            ],
        ]);
    }
}
