<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\EnquiryActivity;
use App\Models\EnquiryLegalOpinion;
use App\Models\EnquiryApproval;
use App\Models\User;
use App\Models\EnquiryWitness;
use App\Models\EnquiryNotice;
use App\Notifications\EnquiryAssignedNotification;
use App\Notifications\NoticeNonAppearanceNotification;
use App\Services\EnquiryNumberGenerator;
use App\Services\FirNumberGenerator;
use App\Services\PrintService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnquiryController extends Controller
{
    private const ALLOWED_STATUSES = 'registered,assigned,in_progress,cfr_submitted,approved,closed,transferred,converted_to_case,referred_court';

    /**
     * Move an uploaded file to public/uploads/<dir>.
     */
    private function moveFile(?UploadedFile $file, string $dir): ?string
    {
        if (!$file) {
            return null;
        }
        $ext  = $file->getClientOriginalExtension() ?: 'bin';
        $name = $dir . '/' . Str::random(24) . '.' . $ext;
        $file->move(public_path('uploads'), $name);
        return 'uploads/' . $name;
    }

    private function decodeArrays(array &$data): void
    {
        foreach (['activities', 'legal_opinions', 'approvals', 'witnesses', 'notices'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decoded = json_decode($data[$field], true);
                $data[$field] = is_array($decoded) ? $decoded : [];
            } elseif (!isset($data[$field])) {
                $data[$field] = [];
            }
        }
    }

    private function syncActivities(Enquiry $enquiry, array $activities, int $userId, Request $request): void
    {
        $keep = [];
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

        $files = $request->file('activity_attachments', []);
        foreach ($activities as $i => $action) {
            $type = is_array($action) ? ($action['type'] ?? null) : $action;
            if (!$type) {
                continue;
            }
            $label = $actionLabels[$type] ?? $type;

            $attrs = [
                'type'          => $type,
                'description'   => (is_array($action) && !empty($action['description'])) ? $action['description'] : $label,
                'activity_date' => (is_array($action) && !empty($action['activity_date'])) ? $action['activity_date'] : now(),
            ];

            $existing = null;
            if (is_array($action) && !empty($action['id'])) {
                $existing = EnquiryActivity::find($action['id']);
            }

            $file = $files[$i] ?? null;
            if ($file instanceof UploadedFile) {
                $attrs['attachment_path'] = $this->moveFile($file, 'activities');
            } elseif (is_array($action) && !empty($action['attachment_path']) && is_string($action['attachment_path'])) {
                $attrs['attachment_path'] = $action['attachment_path'];
            }

            if ($existing && $existing->enquiry_id === $enquiry->id) {
                $existing->update($attrs);
                $keep[] = $existing->id;
            } else {
                $model = $enquiry->activities()->create(array_merge($attrs, ['created_by' => $userId]));
                $keep[] = $model->id;
            }
        }

        $enquiry->activities()
            ->whereNotIn('id', $keep ?: [0])
            ->delete();
    }

    private function syncLegalOpinions(Enquiry $enquiry, array $opinions, int $userId): void
    {
        $keep = [];
        foreach ($opinions as $lo) {
            if (empty($lo['role']) && empty($lo['opinion_text'])) {
                continue;
            }
            $attrs = [
                'role'         => $lo['role'] ?? 'dd_legal',
                'opinion_text' => $lo['opinion_text'] ?? '',
                'decision'     => $lo['decision'] ?? null,
            ];
            $existing = !empty($lo['id']) ? EnquiryLegalOpinion::find($lo['id']) : null;
            if ($existing && $existing->enquiry_id === $enquiry->id) {
                $existing->update($attrs);
                $keep[] = $existing->id;
            } else {
                $model = $enquiry->legalOpinions()->create(array_merge($attrs, ['created_by' => $userId]));
                $keep[] = $model->id;
            }
        }
        $enquiry->legalOpinions()->whereNotIn('id', $keep ?: [0])->delete();
    }

    private function syncApprovals(Enquiry $enquiry, array $approvals): void
    {
        $keep = [];
        foreach ($approvals as $ap) {
            if (empty($ap['circle_incharge_id']) && empty($ap['decision'])) {
                continue;
            }
            $attrs = [
                'circle_incharge_id' => $ap['circle_incharge_id'] ?? null,
                'decision'           => $ap['decision'] ?? 'agree',
                'remarks'            => $ap['remarks'] ?? null,
            ];
            $existing = !empty($ap['id']) ? EnquiryApproval::find($ap['id']) : null;
            if ($existing && $existing->enquiry_id === $enquiry->id) {
                $existing->update($attrs);
                $keep[] = $existing->id;
            } else {
                $model = $enquiry->approvals()->create($attrs);
                $keep[] = $model->id;
            }
        }
        $enquiry->approvals()->whereNotIn('id', $keep ?: [0])->delete();
    }

    private function syncWitnesses(Enquiry $enquiry, array $witnesses, Request $request): void
    {
        $files = $request->file('witness_attachments', []);
        $keep  = [];

        foreach ($witnesses as $i => $w) {
            if (empty($w['name']) && empty($w['cnic']) && empty($w['address'])) {
                continue;
            }
            $attrs = [
                'name'        => $w['name'] ?? null,
                'cnic'        => $w['cnic'] ?? null,
                'nationality' => $w['nationality'] ?? null,
                'passport'    => $w['passport'] ?? null,
                'address'     => $w['address'] ?? null,
            ];

            $file = $files[$i] ?? null;
            if ($file instanceof UploadedFile) {
                $attrs['attachment'] = $this->moveFile($file, 'witnesses');
            } elseif (!empty($w['attachment']) && is_string($w['attachment'])) {
                $attrs['attachment'] = $w['attachment'];
            }

            $existing = !empty($w['id']) ? EnquiryWitness::find($w['id']) : null;
            if ($existing && $existing->enquiry_id === $enquiry->id) {
                $existing->update($attrs);
                $keep[] = $existing->id;
            } else {
                $model = $enquiry->witnesses()->create($attrs);
                $keep[] = $model->id;
            }
        }

        $enquiry->witnesses()->whereNotIn('id', $keep ?: [0])->delete();
    }

    private function syncNotices(Enquiry $enquiry, array $notices, Request $request): void
    {
        $keep = [];

        foreach ($notices as $n) {
            if (empty($n['receiver_name']) && empty($n['notice_type']) && empty($n['notice_number']) && empty($n['description'])) {
                continue;
            }

            $attrs = [
                'notice_number'   => $n['notice_number'] ?? null,
                'notice_type'     => $n['notice_type'] ?? null,
                'receiver_name'   => $n['receiver_name'] ?? null,
                'person_type'     => $n['person_type'] ?? null,
                'notice_via'      => $n['notice_via'] ?? null,
                'address'         => $n['address'] ?? null,
                'phone'           => $n['phone'] ?? null,
                'notice_date'     => $n['notice_date'] ?? null,
                'description'     => $n['description'] ?? null,
                'status'          => $n['status'] ?? 'issued',
            ];

            if ($attrs['status'] === 'served' && empty($n['served_at'])) {
                $attrs['served_at'] = now();
            }

            $existing = !empty($n['id']) ? EnquiryNotice::find($n['id']) : null;
            if ($existing && $existing->enquiry_id === $enquiry->id) {
                $existing->update($attrs);
                if (!$existing->verification_token) {
                    $existing->verification_token = Str::random(32);
                    $existing->save();
                }
                $keep[] = $existing->id;
            } else {
                $attrs['verification_token'] = Str::random(32);
                $model = $enquiry->notices()->create($attrs);
                $keep[] = $model->id;
            }
        }

        $enquiry->notices()->whereNotIn('id', $keep ?: [0])->delete();
        $this->recomputeNoticeFlags($enquiry, $request);
    }

    private function recomputeNoticeFlags(Enquiry $enquiry, Request $request): void
    {
        $unserved       = $enquiry->notices()->whereIn('status', ['issued', 'unserved'])->count();
        $nonAppearance  = $enquiry->notices()->where('status', 'non_appearance')->count();

        $enquiry->update([
            'has_unserved_notice' => ($unserved + $nonAppearance) > 0,
            'notice_count'        => $enquiry->notices()->count(),
        ]);

        if ($nonAppearance >= 3 && !in_array($enquiry->status, ['referred_court', 'closed', 'approved', 'converted_to_case'])) {
            $enquiry->update([
                'status'         => 'referred_court',
                'recommendation' => $enquiry->recommendation ?: 'convert_to_case',
            ]);

            $this->notifyReferral($enquiry);
        }

        if ($nonAppearance > 0) {
            $this->notifyNonAppearance($enquiry, $request);
        }
    }

    private function notifyReferral(Enquiry $enquiry): void
    {
        $recipients = collect();

        if ($enquiry->enquiry_officer_id) {
            $recipients->push($enquiry->officer);
        }

        $recipients = $recipients->merge(
            \App\Models\User::role(['admin', 'circle_incharge', 'additional_director', 'reader_branch'])->get()
        );

        $recipients->unique('id')->each(fn ($u) => $u?->notify(new NoticeNonAppearanceNotification($enquiry, null, true)));
    }

    private function notifyNonAppearance(Enquiry $enquiry, Request $request): void
    {
        $recipients = collect();

        if ($enquiry->enquiry_officer_id) {
            $recipients->push($enquiry->officer);
        }

        $recipients = $recipients->merge(
            \App\Models\User::role(['admin', 'circle_incharge'])->get()
        );

        $recipients->unique('id')->each(fn ($u) => $u?->notify(new NoticeNonAppearanceNotification($enquiry, null, false)));
    }

    public function verifyNotice(string $token)
    {
        $notice = EnquiryNotice::with('enquiry.complaint.circle')->where('verification_token', $token)->firstOrFail();

        return view('enquiry.notice-verify', compact('notice'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tracking_no'             => 'nullable|string|max:255',
            'complaint_id'            => 'nullable|integer|exists:complaints,id',
            'enquiry_number'          => 'nullable|string|max:255',
            'reg_date'                => 'nullable|date',
            'assignment_date'         => 'nullable|date',
            'status'                  => 'required|string|in:' . self::ALLOWED_STATUSES,

            'enquiry_officer_id'      => 'nullable|integer|exists:users,id',
            'recommendation'          => 'nullable|string|max:50',
            'closure_reason'          => 'nullable|string|max:50',
            'transfer_department'     => 'nullable|string|max:255',
            'transfer_circle'         => 'nullable|string|max:255',
            'merge_complaint_id'      => 'nullable|string|max:255',
            'cfr_summary'             => 'nullable|string',

            // Witnesses
            'witnesses'               => 'nullable|string',
            // Notices
            'notices'                 => 'nullable|string',
            // Technical & Forensic reports
            'technical_report'        => 'nullable|string',
            'forensic_report'         => 'nullable|string',

            'activities'              => 'nullable|string',
            'legal_opinions'          => 'nullable|string',
            'approvals'               => 'nullable|string',

            // File uploads
            'technical_report_attachment' => 'nullable|file|max:20480',
            'forensic_report_attachment'  => 'nullable|file|max:20480',
        ]);

        $this->decodeArrays($data);

        $privileged = $request->user()->hasAnyRole(['admin', 'circle_incharge']);
        $officerId = $privileged ? ($data['enquiry_officer_id'] ?? null) : null;

        $complaint = null;
        if (!empty($data['tracking_no'])) {
            $complaint = Complaint::where('tracking_no', $data['tracking_no'])->first();
        } elseif (!empty($data['complaint_id'])) {
            $complaint = Complaint::find($data['complaint_id']);
        }

        $enquiry = DB::transaction(function () use ($data, $complaint, $request) {
            $enquiry = Enquiry::create([
                'complaint_id'    => $complaint?->id,
                'enquiry_number'  => $data['enquiry_number'] ?? null,
                'enquiry_officer_id' => $officerId,
                'status'          => $data['status'] ?? 'registered',
                'reg_date'        => $data['reg_date'] ?? now()->toDateString(),
                'assignment_date' => $data['assignment_date'] ?? null,
                'recommendation'  => $data['recommendation'] ?? null,
                'closure_reason'  => $data['closure_reason'] ?? null,
                'transfer_department' => $data['transfer_department'] ?? null,
                'transfer_circle' => $data['transfer_circle'] ?? null,
                'cfr_summary'     => $data['cfr_summary'] ?? null,
                'technical_report'   => $data['technical_report'] ?? null,
                'forensic_report'    => $data['forensic_report'] ?? null,
            ]);

            $technicalAttachment = $this->moveFile($request->file('technical_report_attachment'), 'reports');
            $forensicAttachment  = $this->moveFile($request->file('forensic_report_attachment'), 'reports');
            if ($technicalAttachment) {
                $enquiry->technical_report_attachment = $technicalAttachment;
            }
            if ($forensicAttachment) {
                $enquiry->forensic_report_attachment = $forensicAttachment;
            }
            $enquiry->save();

            $this->syncActivities($enquiry, $data['activities'] ?? [], $request->user()->id, $request);
            if ($privileged) {
                $this->syncLegalOpinions($enquiry, $data['legal_opinions'] ?? [], $request->user()->id);
                $this->syncApprovals($enquiry, $data['approvals'] ?? []);
            }
            $this->syncWitnesses($enquiry, $data['witnesses'] ?? [], $request);
            $this->syncNotices($enquiry, $data['notices'] ?? [], $request);

            return $enquiry;
        });

        if ($enquiry->enquiry_officer_id) {
            $enquiry->officer?->notify(new EnquiryAssignedNotification($enquiry));
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Enquiry registered', 'data' => $enquiry->load('complaint', 'officer')], 201);
        }

        return redirect()->route('enquiries.index')
            ->with('success', 'Enquiry registered — ' . ($enquiry->enquiry_number ?? ('#' . $enquiry->id)));
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

        $enquiry->load('complaint', 'officer', 'activities.creator', 'legalOpinions.creator', 'approvals.circleIncharge', 'witnesses', 'notices');
        return response()->json($enquiry);
    }

    public function update(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'tracking_no'             => 'nullable|string|max:255',
            'complaint_id'            => 'nullable|integer|exists:complaints,id',
            'enquiry_number'          => 'nullable|string|max:255',
            'enquiry_officer_id'      => 'nullable|integer|exists:users,id',
            'status'                  => 'nullable|in:' . self::ALLOWED_STATUSES,
            'recommendation'          => 'nullable|string|max:30',
            'closure_reason'          => 'nullable|string|max:30',
            'transfer_department'     => 'nullable|string|max:255',
            'transfer_circle'         => 'nullable|string|max:255',
            'merge_complaint_id'      => 'nullable|string|max:255',
            'reg_date'                => 'nullable|date',
            'cfr_summary'             => 'nullable|string',
            'technical_report'        => 'nullable|string',
            'forensic_report'         => 'nullable|string',

            'activities'              => 'nullable|string',
            'legal_opinions'          => 'nullable|string',
            'approvals'               => 'nullable|string',
            'witnesses'               => 'nullable|string',
            'notices'                 => 'nullable|string',

            'technical_report_attachment' => 'nullable|file|max:20480',
            'forensic_report_attachment'  => 'nullable|file|max:20480',
        ]);

        $this->decodeArrays($data);

        $privileged = $request->user()->hasAnyRole(['admin', 'circle_incharge']);

        $updateData = [
            'status'             => $data['status'] ?? $enquiry->status,
            'recommendation'     => $data['recommendation'] ?? $enquiry->recommendation,
            'closure_reason'     => $data['closure_reason'] ?? $enquiry->closure_reason,
            'transfer_department'=> $data['transfer_department'] ?? $enquiry->transfer_department,
            'transfer_circle'    => $data['transfer_circle'] ?? $enquiry->transfer_circle,
            'enquiry_number'     => $data['enquiry_number'] ?? $enquiry->enquiry_number,
            'reg_date'           => $data['reg_date'] ?? $enquiry->reg_date,
            'cfr_summary'        => $data['cfr_summary'] ?? $enquiry->cfr_summary,
            'technical_report'   => $data['technical_report'] ?? $enquiry->technical_report,
            'forensic_report'    => $data['forensic_report'] ?? $enquiry->forensic_report,
        ];

        if ($privileged) {
            $updateData['enquiry_officer_id'] = $data['enquiry_officer_id'] ?? $enquiry->enquiry_officer_id;
        }

        if (!empty($data['complaint_id'])) {
            $updateData['complaint_id'] = $data['complaint_id'];
        }

        if (!empty($data['merge_complaint_id'])) {
            $mergeComplaint = Complaint::where('tracking_no', $data['merge_complaint_id'])->first();
            $updateData['merge_complaint_id'] = $mergeComplaint?->id ?: $data['merge_complaint_id'];
        } elseif (array_key_exists('merge_complaint_id', $data) && $data['merge_complaint_id'] === '') {
            $updateData['merge_complaint_id'] = null;
        }

        $officerChanged = $privileged && !empty($data['enquiry_officer_id'])
            && (int) $data['enquiry_officer_id'] !== $enquiry->enquiry_officer_id;

        DB::transaction(function () use ($enquiry, $updateData, $data, $request) {
            $enquiry->update($updateData);

            $technicalAttachment = $this->moveFile($request->file('technical_report_attachment'), 'reports');
            if ($technicalAttachment) {
                $enquiry->technical_report_attachment = $technicalAttachment;
            }
            $forensicAttachment = $this->moveFile($request->file('forensic_report_attachment'), 'reports');
            if ($forensicAttachment) {
                $enquiry->forensic_report_attachment = $forensicAttachment;
            }
            $enquiry->save();

            $this->syncActivities($enquiry, $data['activities'] ?? [], $request->user()->id, $request);
            if ($privileged) {
                $this->syncLegalOpinions($enquiry, $data['legal_opinions'] ?? [], $request->user()->id);
                $this->syncApprovals($enquiry, $data['approvals'] ?? []);
            }
            $this->syncWitnesses($enquiry, $data['witnesses'] ?? [], $request);
            $this->syncNotices($enquiry, $data['notices'] ?? [], $request);
        });

        if ($officerChanged) {
            $enquiry->officer?->notify(new EnquiryAssignedNotification($enquiry));
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Enquiry updated successfully', 'data' => $enquiry->fresh()->load('complaint', 'officer', 'activities.creator', 'legalOpinions.creator', 'approvals.circleIncharge', 'witnesses', 'notices')]);
        }

        return redirect()->route('enquiries.index')
            ->with('success', 'Enquiry updated successfully');
    }

    /**
     * Printable notice HTML (with QR verification code).
     */
    public function noticePrint(Request $request, Enquiry $enquiry, PrintService $print)
    {
        abort_unless(
            Enquiry::visibleTo(request()->user())->whereKey($enquiry->id)->exists(),
            404
        );

        $noticeId = $request->integer('notice_id');
        $notice = $noticeId
            ? EnquiryNotice::where('enquiry_id', $enquiry->id)->findOrFail($noticeId)
            : $enquiry->notices()->latest('id')->first();

        abort_if(!$notice, 404, 'No notice found to print.');

        return response()->json([
            'html' => $print->noticePrintDocument($notice),
        ]);
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
