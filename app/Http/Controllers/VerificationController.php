<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\OffenceType;
use App\Models\User;
use App\Models\Verification;
use App\Models\VerificationReport;
use App\Notifications\VerificationAssignedNotification;
use App\Notifications\ComplainantMessageNotification;
use App\Services\EnquiryNumberGenerator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VerificationController extends Controller
{
    public function index()
    {
        $query = Verification::visibleTo(request()->user())->with(['complaint', 'officer', 'assignedBy']);

        if ($search = request('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('complaint', function ($cq) use ($search) {
                    $cq->where('tracking_no', 'like', "%{$search}%")
                       ->orWhere('complainant_name', 'like', "%{$search}%");
                })->orWhere('id', $search);
            });
        }

        if ($status = request('status')) {
            $query->where('status', $status);
        }

        $verifications = $query->latest()->paginate(15)->withQueryString();

        $statsQuery = Verification::visibleTo(request()->user());

        $stats = [
            'total'    => (clone $statsQuery)->count(),
            'pending'  => (clone $statsQuery)->where('status', 'pending_assignment')->count(),
            'progress' => (clone $statsQuery)->whereIn('status', ['assigned', 'in_progress', 'sent_back'])->count(),
            'approved' => (clone $statsQuery)->whereIn('status', ['submitted', 'approved'])->count(),
        ];

        if (request()->expectsJson()) {
            return response()->json($verifications);
        }

        return view('verifications.index', compact('verifications', 'stats'));
    }

    public function stats()
    {
        $query = Verification::visibleTo(request()->user());

        return response()->json([
            'total'    => (clone $query)->count(),
            'pending'  => (clone $query)->where('status', 'pending_assignment')->count(),
            'progress' => (clone $query)->whereIn('status', ['assigned', 'in_progress', 'sent_back'])->count(),
            'approved' => (clone $query)->whereIn('status', ['submitted', 'approved'])->count(),
        ]);
    }

    public function listReports()
    {
        $query = VerificationReport::visibleTo(request()->user())->with(['creator', 'complaint']);

        $reports = $query->latest()->paginate(15);

        if (request()->expectsJson()) {
            return response()->json($reports);
        }

        return view('verifications.reports-list', compact('reports'));
    }

    public function downloadPdf(VerificationReport $report)
    {
        abort_unless(
            VerificationReport::visibleTo(request()->user())->whereKey($report->id)->exists(),
            404
        );

        $report->load('creator', 'complaint');

        $pdf = Pdf::loadView('verifications.reports-pdf', compact('report'));

        $filename = 'verification-report-' . str_replace('/', '-', $report->tracking_no) . '.pdf';

        return $pdf->download($filename);
    }

    public function reports()
    {
        $complaints = Complaint::visibleTo(request()->user())->whereNotNull('tracking_no')
            ->orderBy('tracking_no')
            ->get(['id', 'tracking_no', 'complainant_name', 'cnic', 'contact_no']);

        $crimeCategories = OffenceType::orderBy('name')->get(['name', 'value']);

        return view('verifications.reports', compact('complaints', 'crimeCategories'));
    }

    public function storeReport(Request $request)
    {
        $data = $request->validate([
            'complaint_id'        => 'nullable|exists:complaints,id',
            'tracking_no'         => 'required|string|max:255',
            'registration_at'     => 'nullable|date',
            'assignment_date'     => 'nullable|date',
            'verification_date'   => 'nullable|date',

            'victim_name'         => 'required|string|max:255',
            'victim_father_name'  => 'nullable|string|max:255',
            'victim_occupation'   => 'nullable|string|max:255',
            'victim_gender'       => 'nullable|in:male,female,other',
            'victim_cnic'         => ['required', 'string', 'regex:/^\d{5}-\d{7}-\d{1}$/'],
            'victim_country_code' => 'nullable|string|max:8',
            'victim_phone'        => 'required|string|max:20',

            'crime_category'      => 'required|string|max:255',
            'crime_description'   => 'nullable|string|max:5000',
            'city'                => 'required|string|max:255',

            'accused_known'       => 'required|boolean',
            'accused'             => 'nullable|array',
            'accused.*.name'      => 'nullable|string|max:255',
            'accused.*.father_name' => 'nullable|string|max:255',
            'accused.*.phone'     => 'nullable|string|max:20',
            'accused.*.cnic'      => ['nullable', 'string', 'regex:/^\d{5}-\d{7}-\d{1}$/'],
            'accused.*.address'   => 'nullable|string|max:1000',
            'accused.*.post_address' => 'nullable|string|max:1000',
            'accused.*.nationality' => 'nullable|string|max:50',
            'accused.*.passport_no' => 'nullable|string|max:50|required_if:accused.*.nationality,Dual Nationality Holder|required_if:accused.*.nationality,Foreigner',
            'accused.*.photo'     => 'nullable|string',

            'recommendation_short' => 'nullable|string|max:2000',
            'recommendation_full'  => 'nullable|string|max:10000',
            'comments'             => 'nullable|string|max:5000',
            'recommendation'       => 'nullable|string|in:enquiry_registration,closure,merge,transfer',
            'closure_reason'       => 'nullable|string|in:non_pursuance,irrelevant,invalid,lack_of_evidence',

            'inquiry_no'          => 'nullable|string|max:255',
            'case_no'             => 'nullable|string|max:255',
            'evidence_file'       => 'nullable|array',
            'evidence_file.*'     => 'file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Handle evidence uploads: files + per-file description
        $evidence = [];
        $evidenceFiles = $request->file('evidence_file', []);
        $evidenceDesc  = $request->input('evidence_desc', []);
        foreach ($evidenceFiles as $index => $file) {
            $path = $file->store('verification-reports/evidence', 'public');
            $evidence[] = [
                'file'        => $path,
                'original_name' => $file->getClientOriginalName(),
                'description' => $evidenceDesc[$index] ?? null,
            ];
        }
        $data['evidence'] = $evidence ?: null;

        // Handle accused photo uploads
        $accusedPhotos = $request->file('accused_photo', []);
        $accusedData = $data['accused'] ?? [];
        foreach ($accusedPhotos as $index => $photo) {
            if (isset($accusedData[$index])) {
                $path = $photo->store('verification-reports/accused-photos', 'public');
                $accusedData[$index]['photo'] = $path;
            }
        }
        $data['accused'] = !empty($accusedData) ? $accusedData : null;

        // Auto-use user's profile signature if no file uploaded
        $user = auth()->user();
        if ($user && $user->signature) {
            $data['signature'] = $user->signature;
        }

        $data['created_by'] = auth()->id();

        $report = VerificationReport::create($data);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Verification report saved successfully',
                'data' => $report->fresh(),
            ], 201);
        }

        return redirect()->route('verifications.reports')
            ->with('success', 'Verification report saved successfully');
    }

    public function showReport(VerificationReport $report)
    {
        abort_unless(
            VerificationReport::visibleTo(request()->user())->whereKey($report->id)->exists(),
            404
        );

        return response()->json($report->load('creator', 'complaint'));
    }

    public function destroyReport(VerificationReport $report)
    {
        abort_unless(
            VerificationReport::visibleTo(request()->user())->whereKey($report->id)->exists(),
            404
        );

        $user = request()->user();
        abort_unless(
            $user->hasAnyRole(['admin', 'circle_incharge'])
                || (int) $report->created_by === (int) $user->id,
            403
        );

        $report->delete();

        return response()->json(['message' => 'Verification report deleted successfully']);
    }

    public function bulkDestroyReports(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:verification_reports,id',
        ]);

        $query = VerificationReport::visibleTo($user)->whereIn('id', $data['ids']);

        // Non-supervisors may only delete their own reports.
        if (!$user->hasAnyRole(['admin', 'circle_incharge']) && !$user->seesAllData()) {
            $query->where('created_by', $user->id);
        }

        $count = $query->delete();

        return response()->json([
            'message' => $count . ' verification report(s) deleted',
            'deleted' => $count,
        ]);
    }

    public function updateReport(Request $request, VerificationReport $report)
    {
        abort_unless(
            VerificationReport::visibleTo(request()->user())->whereKey($report->id)->exists(),
            404
        );

        $data = $request->validate([
            'complaint_id'        => 'nullable|exists:complaints,id',
            'tracking_no'         => 'required|string|max:255',
            'registration_at'     => 'nullable|date',
            'assignment_date'     => 'nullable|date',
            'verification_date'   => 'nullable|date',

            'victim_name'         => 'required|string|max:255',
            'victim_father_name'  => 'nullable|string|max:255',
            'victim_occupation'   => 'nullable|string|max:255',
            'victim_gender'       => 'nullable|in:male,female,other',
            'victim_cnic'         => ['required', 'string', 'regex:/^\d{5}-\d{7}-\d{1}$/'],
            'victim_country_code' => 'nullable|string|max:8',
            'victim_phone'        => 'required|string|max:20',

            'crime_category'      => 'required|string|max:255',
            'crime_description'   => 'nullable|string|max:5000',
            'city'                => 'required|string|max:255',

            'accused_known'       => 'required|boolean',
            'accused'             => 'nullable|array',
            'accused.*.name'      => 'nullable|string|max:255',
            'accused.*.father_name' => 'nullable|string|max:255',
            'accused.*.phone'     => 'nullable|string|max:20',
            'accused.*.cnic'      => ['nullable', 'string', 'regex:/^\d{5}-\d{7}-\d{1}$/'],
            'accused.*.address'   => 'nullable|string|max:1000',
            'accused.*.post_address' => 'nullable|string|max:1000',
            'accused.*.nationality' => 'nullable|string|max:50',
            'accused.*.passport_no' => 'nullable|string|max:50|required_if:accused.*.nationality,Dual Nationality Holder|required_if:accused.*.nationality,Foreigner',
            'accused.*.photo'     => 'nullable|string',

            'recommendation_short' => 'nullable|string|max:2000',
            'recommendation_full'  => 'nullable|string|max:10000',
            'comments'             => 'nullable|string|max:5000',
            'recommendation'       => 'nullable|string|in:enquiry_registration,closure,merge,transfer',
            'closure_reason'       => 'nullable|string|in:non_pursuance,irrelevant,invalid,lack_of_evidence',

            'inquiry_no'          => 'nullable|string|max:255',
            'case_no'             => 'nullable|string|max:255',
            'evidence_file'       => 'nullable|array',
            'evidence_file.*'     => 'file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Existing evidence (kept from previous state), then newly uploaded files
        $evidence = [];
        foreach ($request->input('existing_evidence', []) as $ev) {
            if (is_array($ev) && !empty($ev['file_path'])) {
                $evidence[] = [
                    'file'          => $ev['file_path'],
                    'original_name' => $ev['original_name'] ?? null,
                    'description'   => $ev['description'] ?? null,
                ];
            }
        }

        $evidenceFiles = $request->file('evidence_file', []);
        $evidenceDesc  = $request->input('evidence_desc', []);
        foreach ($evidenceFiles as $index => $file) {
            $path = $file->store('verification-reports/evidence', 'public');
            $evidence[] = [
                'file'          => $path,
                'original_name' => $file->getClientOriginalName(),
                'description'   => $evidenceDesc[$index] ?? null,
            ];
        }
        $data['evidence'] = $evidence ?: null;

        // Accused photo uploads (new photos replace the value sent in accused[*][photo])
        $accusedPhotos = $request->file('accused_photo', []);
        $accusedData = $data['accused'] ?? [];
        foreach ($accusedPhotos as $index => $photo) {
            if (isset($accusedData[$index])) {
                $path = $photo->store('verification-reports/accused-photos', 'public');
                $accusedData[$index]['photo'] = $path;
            }
        }
        $data['accused'] = !empty($accusedData) ? $accusedData : null;

        $report->update($data);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Verification report updated successfully',
                'data' => $report->fresh(),
            ]);
        }

        return redirect()->route('verifications.reports')
            ->with('success', 'Verification report updated successfully');
    }

    public function show(Verification $verification)
    {
        abort_unless(
            Verification::visibleTo(request()->user())->whereKey($verification->id)->exists(),
            404
        );

        if (request()->expectsJson()) {
            return response()->json($verification->load('complaint', 'officer', 'sentByUser'));
        }
        return redirect()->route('verifications.edit', $verification);
    }

    public function create()
    {
        $complaints = Complaint::where('status', 'complete')
            ->whereDoesntHave('verification')
            ->get();

        $officers = User::role('verification_officer')->get();
        $circles = Circle::all();

        return view('verifications.create', compact('complaints', 'officers', 'circles'));
    }

    public function store(Request $request)
    {
        $this->authorize('create', Verification::class);

        $data = $request->validate([
            'complaint_id'           => 'required|exists:complaints,id',
            'verification_officer_id'=> 'required|exists:users,id',
            'priority_type'          => 'required|in:normal,high,critical',
            'report_text'            => 'nullable|string|max:5000',
        ]);

        $data['status']      = 'assigned';
        $data['assigned_by'] = auth()->id();
        $data['assigned_at'] = now();

        $verification = Verification::create($data);

        $verification->officer?->notify(new VerificationAssignedNotification($verification));

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Verification assigned successfully', 'data' => $verification->load('officer', 'complaint')], 201);
        }

        return redirect()->route('verifications.index')
            ->with('success', 'Verification assigned successfully');
    }

    public function edit(Verification $verification)
    {
        $officers = User::role('verification_officer')->get();
        $circles = Circle::all();
        $complaints = Complaint::where('status', 'complete')->get();

        return view('verifications.edit', compact('verification', 'officers', 'circles', 'complaints'));
    }

    public function update(Request $request, Verification $verification)
    {
        $this->authorize('update', $verification);

        $rules = [
            'verification_officer_id' => 'required|exists:users,id',
            'priority_type'           => 'required|in:normal,high,critical',
            'status'                  => 'nullable|in:assigned,in_progress,submitted,sent_back',
            'recommendation'          => 'nullable|string|max:5000',
            'closure_reason'          => 'nullable|in:non_pursuance,irrelevant,invalid,lack_of_evidence',
            'merge_complaint_id'      => 'nullable|integer|exists:complaints,id',
            'transfer_department'     => 'nullable|string|max:255',
            'transfer_circle_id'      => 'nullable|exists:circles,id',
            'report_text'             => 'nullable|string|max:10000',
            'complainant_message'     => 'nullable|string|max:2000',
            'appeared_at'             => 'nullable|date',
            'message_via'             => 'nullable|string|in:whatsapp,sms,phone,in_app,email',
            'whatsapp_sent_at'        => 'nullable|date',
        ];

        $data = $request->validate($rules);

        $user = $request->user();

        // Only supervisors may reassign the verification officer.
        if (!$user->hasAnyRole(['admin', 'circle_incharge'])) {
            $data['verification_officer_id'] = $verification->verification_officer_id;
        }

        if (!empty($data['recommendation'])) {
            $data['submitted_at'] = now();
        }

        // Recording a complainant message / appear-date means the verification
        // officer has contacted the complainant. Stamp who recorded it and ring
        // the circle officer so they stay in the loop.
        $justNotified = (empty($verification->complainant_message) && !empty($data['complainant_message']))
                     || (empty($verification->appeared_at) && !empty($data['appeared_at']));
        if ($justNotified) {
            $data['sent_by'] = auth()->id();
        }

        if (!empty($data['message_via']) && $data['message_via'] === 'whatsapp' && empty($verification->whatsapp_sent_at)) {
            $data['whatsapp_sent_at'] = $data['whatsapp_sent_at'] ?? now();
        }

        $officerChanged = !empty($data['verification_officer_id'])
            && (int) $data['verification_officer_id'] !== $verification->verification_officer_id;

        $verification->update($data);

        if ($officerChanged) {
            $verification->officer?->notify(new VerificationAssignedNotification($verification));
        }

        if ($justNotified) {
            $this->notifyCircleInchargeAboutComplainantMessage($verification);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Verification updated successfully', 'data' => $verification->fresh()]);
        }

        return redirect()->route('verifications.index')
            ->with('success', 'Verification updated successfully');
    }

    public function destroy(Verification $verification)
    {
        $this->authorize('delete', $verification);

        activity()->useLog('verifications')
            ->performedOn($verification)
            ->causedBy(auth()->user())
            ->withProperties(['id' => $verification->id])
            ->log('Verification deleted: #' . $verification->id);

        $verification->delete();

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Verification deleted successfully']);
        }

        return redirect()->route('verifications.index')
            ->with('success', 'Verification deleted successfully');
    }

    /**
     * Bulk-close selected verifications (circle officers / admins only).
     * A closed verification is finalized and removed from active workflow.
     */
    public function bulkClose(Request $request)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['admin', 'circle_incharge']), 403);

        $data = $request->validate([
            'ids'            => 'required|array|min:1',
            'ids.*'          => 'integer|exists:verifications,id',
            'closure_reason' => 'nullable|in:non_pursuance,irrelevant,invalid,lack_of_evidence',
        ]);

        // Only IDs the caller is allowed to see can be closed (prevents IDOR).
        $count = Verification::visibleTo($user)
            ->whereIn('id', $data['ids'])
            ->whereNotIn('status', ['approved', 'closed'])
            ->update([
                'status'         => 'closed',
                'closure_reason' => $data['closure_reason'] ?? null,
                'completed_at'   => now(),
            ]);

        activity()->useLog('verifications')
            ->causedBy($user)
            ->withProperties(['ids' => $data['ids'], 'closure_reason' => $data['closure_reason'] ?? null])
            ->log("Bulk closed {$count} verification(s)");

        if ($request->expectsJson()) {
            return response()->json([
                'message' => "Closed {$count} verification(s)",
                'count'   => $count,
            ]);
        }

        return back()->with('success', "Closed {$count} verification(s)");
    }

    // ── Existing API methods ──

    /**
     * Notify the circle officer(s) that a verification officer recorded a
     * complainant message (i.e. the complainant was contacted / appeared).
     */
    protected function notifyCircleInchargeAboutComplainantMessage(Verification $verification): void
    {
        $circle = $verification->complaint?->circle;

        if (!$circle) {
            return;
        }

        \App\Models\User::role('circle_incharge')
            ->where('circle_id', $circle->id)
            ->each
            ->notify(new ComplainantMessageNotification($verification));
    }

    public function assign(Request $request, Complaint $complaint)
    {
        $data = $request->validate([
            'verification_officer_id' => 'required|integer|exists:users,id',
            'priority_type'           => 'nullable|string|in:normal,high,critical',
            'assigned_at'             => 'nullable|date',
        ]);

        $data['complaint_id'] = $complaint->id;
        $data['status']       = 'assigned';
        $data['assigned_at']  ??= now();

        $verification = Verification::create($data);

        $verification->officer?->notify(new VerificationAssignedNotification($verification));

        return response()->json([
            'message' => 'Verification assigned successfully',
            'data'    => $verification->load('officer'),
        ], 201);
    }

    public function submitReport(Request $request, Verification $verification)
    {
        $this->authorize('submit', $verification);

        $data = $request->validate([
            'report_text'        => 'required|string',
            'recommendation'     => 'required|string|in:enquiry_registration,closure,merge,transfer',
            'closure_reason'     => 'nullable|string|in:non_pursuance,irrelevant,invalid,lack_of_evidence',
            'merge_complaint_id' => 'nullable|integer|exists:complaints,id',
            'transfer_department'=> 'nullable|string|max:255',
            'transfer_circle_id' => 'nullable|integer|exists:circles,id',
            'completed_at'       => 'nullable|date',
        ]);

        $data['status']       = 'submitted';
        $data['submitted_at'] = now();
        $data['completed_at'] ??= now();

        $verification->update($data);

        return response()->json([
            'message' => 'Verification report submitted',
            'data'    => $verification->fresh()->load('complaint', 'officer', 'approvals'),
        ]);
    }

    public function approve(Request $request, Verification $verification)
    {
        $this->authorize('approve', $verification);

        $data = $request->validate([
            'decision'           => 'required|string|in:agree,review',
            'recommendation'     => 'required|string|in:enquiry_registration,closure,merge,transfer',
            'closure_reason'     => 'nullable|string|in:non_pursuance,irrelevant,invalid,lack_of_evidence',
            'merge_complaint_id' => 'nullable|integer|exists:complaints,id',
            'transfer_department'=> 'nullable|string|max:255',
            'transfer_circle_id' => 'nullable|integer|exists:circles,id',
            'remarks'            => 'nullable|string|max:2000',
        ]);

        $approval = $verification->approvals()->create([
            'circle_incharge_id' => $request->user()->id,
            'decision'           => $data['decision'],
            'recommendation'     => $data['recommendation'],
            'closure_reason'     => $data['closure_reason'] ?? null,
            'merge_complaint_id' => $data['merge_complaint_id'] ?? null,
            'transfer_department'=> $data['transfer_department'] ?? null,
            'transfer_circle_id' => $data['transfer_circle_id'] ?? null,
            'remarks'            => $data['remarks'] ?? null,
        ]);

        $updateData = [
            'recommendation'     => $data['recommendation'],
            'closure_reason'     => $data['closure_reason'] ?? null,
            'merge_complaint_id' => $data['merge_complaint_id'] ?? null,
            'transfer_department'=> $data['transfer_department'] ?? null,
            'transfer_circle_id' => $data['transfer_circle_id'] ?? null,
        ];

        // ── DOWNSTREAM ACTIONS on the Complaint ──
        $complaint = $verification->complaint;

        if ($data['decision'] === 'agree') {
            $updateData['status']      = 'approved';
            $updateData['approved_at'] = now();

            switch ($data['recommendation']) {
                case 'closure':
                    DB::transaction(function () use ($complaint, $data) {
                        $complaint->update([
                            'status'         => 'closed',
                            'final_status'   => 'closed',
                            'closure_reason' => $data['closure_reason'] ?? null,
                        ]);
                    });
                    break;

                case 'merge':
                    DB::transaction(function () use ($complaint, $data) {
                        $complaint->update([
                            'status'         => 'merged',
                            'final_status'   => 'merged',
                            'merged_with_id' => $data['merge_complaint_id'] ?? null,
                        ]);
                    });
                    break;

                case 'transfer':
                    DB::transaction(function () use ($complaint, $data) {
                        $complaint->update([
                            'status'                => 'transferred',
                            'final_status'          => 'transferred',
                            'transfer_to_department' => $data['transfer_department'] ?? null,
                            'transfer_to_circle_id'  => $data['transfer_circle_id'] ?? null,
                        ]);
                    });
                    break;

                case 'enquiry_registration':
                    DB::transaction(function () use ($complaint, $verification) {
                        $circle = $complaint->circle;
                        $gen = app(EnquiryNumberGenerator::class);
                        $enquiry = Enquiry::create([
                            'complaint_id'   => $complaint->id,
                            'enquiry_number' => $gen->generate($circle?->code),
                            'status'         => 'registered',
                        ]);
                        $complaint->update([
                            'status'       => 'enquiry_registered',
                            'final_status' => 'enquiry_registered',
                            'enquiry_id'   => $enquiry->id,
                        ]);
                    });
                    break;
            }
        } else {
            $updateData['status'] = 'sent_back';
        }

        $verification->update($updateData);

        return response()->json([
            'message' => 'Verification ' . ($data['decision'] === 'agree' ? 'approved' : 'sent back for review'),
            'data'    => [
                'verification' => $verification->fresh()->load('complaint', 'officer', 'approvals'),
                'approval'     => $approval,
            ],
        ]);
    }

    public function changeOfficer(Request $request, Verification $verification)
    {
        $data = $request->validate([
            'verification_officer_id' => 'required|integer|exists:users,id',
        ]);

        $verification->update([
            'verification_officer_id' => $data['verification_officer_id'],
            'status'                  => 'assigned',
            'assigned_at'             => now(),
            'report_text'             => null,
            'recommendation'          => null,
            'closure_reason'          => null,
            'merge_complaint_id'      => null,
            'transfer_department'     => null,
            'transfer_circle_id'      => null,
            'submitted_at'            => null,
            'completed_at'            => null,
        ]);

        $verification->officer?->notify(new VerificationAssignedNotification($verification));

        return response()->json([
            'message' => 'Verification officer reassigned',
            'data'    => $verification->fresh()->load('officer'),
        ]);
    }
}
