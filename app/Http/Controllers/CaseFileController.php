<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\CaseActivity;
use App\Models\CaseLegalOpinion;
use App\Models\CaseApproval;
use App\Models\Enquiry;
use App\Notifications\CaseAssignedNotification;
use App\Services\FirNumberGenerator;
use App\Services\EnquiryRecordHydrator;
use App\Services\OfficerAssignmentService;
use App\Services\SmsService;
use App\Services\SmsTemplates;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CaseFileController extends Controller
{
    private function decodeArrayField(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value) && $value !== '') {
            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    /** Frontend sends `activities`; legacy/forms use `actions`. */
    private function normalizeActions(Request $request, array $data): array
    {
        $raw = $data['actions'] ?? $request->input('activities') ?? [];

        return $this->decodeArrayField($raw);
    }

    private function normalizeArrests(array $data): array
    {
        return $this->decodeArrayField($data['arrests'] ?? []);
    }

    private function syncLegalOpinions(CaseFile $caseFile, array $opinions, int $userId): void
    {
        $keep = [];

        foreach ($opinions as $opinion) {
            if (!is_array($opinion)) {
                continue;
            }

            $role = $opinion['role'] ?? null;
            if (!$role) {
                continue;
            }

            $attrs = [
                'role'         => $role,
                'opinion_text' => $opinion['opinion_text'] ?? '',
                'decision'     => $opinion['decision'] ?? '',
                'created_by'   => $opinion['created_by'] ?? $userId,
            ];

            if (!empty($opinion['id'])) {
                $existing = CaseLegalOpinion::where('case_id', $caseFile->id)->whereKey($opinion['id'])->first();
                if ($existing) {
                    $existing->update($attrs);
                    $keep[] = $existing->id;
                    continue;
                }
            }

            $model = $caseFile->legalOpinions()->create($attrs);
            $keep[] = $model->id;
        }

        if ($keep) {
            $caseFile->legalOpinions()->whereNotIn('id', $keep)->delete();
        }
    }

    private function syncApprovals(CaseFile $caseFile, array $approvals, int $userId): void
    {
        $keep = [];

        foreach ($approvals as $approval) {
            if (!is_array($approval)) {
                continue;
            }

            if (empty($approval['decision'])) {
                continue;
            }

            $inchargeId = $approval['circle_incharge_id'] ?? $userId;

            $attrs = [
                'circle_incharge_id' => $inchargeId,
                'decision'           => $approval['decision'],
                'remarks'            => $approval['remarks'] ?? null,
            ];

            if (!empty($approval['id'])) {
                $existing = CaseApproval::where('case_id', $caseFile->id)->whereKey($approval['id'])->first();
                if ($existing) {
                    $existing->update($attrs);
                    $keep[] = $existing->id;
                    continue;
                }
            }

            $model = $caseFile->approvals()->create($attrs);
            $keep[] = $model->id;
        }

        if ($keep) {
            $caseFile->approvals()->whereNotIn('id', $keep)->delete();
        }
    }

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
        $this->authorize('create', CaseFile::class);

        $data = $request->validate([
            'enquiry_id'              => 'nullable|integer|exists:enquiries,id',
            'direct_info'             => 'nullable|array',
            'direct_info.reference_no' => 'nullable|string|max:255',
            'direct_info.complainant_name' => 'nullable|string|max:255',
            'direct_info.circle_id'   => 'nullable',
            'direct_info.circle_code' => 'nullable|string|max:50',
            'direct_info.high_profile_type' => 'nullable|string|max:50',
            'direct_info.department_type' => 'nullable|string|max:50',
            'direct_info.received_via' => 'nullable|string|max:50',
            'fir_no'                  => 'nullable|string|unique:cases,fir_no',
            'investigation_officer_id' => 'nullable|integer|exists:users,id',
            'status'                  => 'nullable|string|max:50',
            'recommendation'          => 'nullable|string|max:30',
            'transfer_department'     => 'nullable|string|max:255',
            'transfer_circle'         => 'nullable|string|max:255',
            'merge_complaint_id'      => 'nullable|string|max:255',
            'actions'                 => 'nullable',
            'activities'              => 'nullable',
            'arrests'                 => 'nullable',
            'legal_opinions'          => 'nullable',
            'approvals'               => 'nullable',
            'ad_legal_opinion'       => 'nullable|string',
            'add_director_decision'  => 'nullable|string',
            'dd_legal_opinion'       => 'nullable|string',
            'incharge_approval'      => 'nullable|string|in:agree,review',
            'incharge_remarks'       => 'nullable|string',
        ]);

        if (empty($data['enquiry_id']) && empty($data['direct_info']['reference_no'] ?? null)) {
            return response()->json([
                'message' => 'Select an enquiry or provide direct FIR details (reference no).',
                'errors'  => ['direct_info' => ['Reference No is required for direct FIR.']],
            ], 422);
        }

        $actions = $this->normalizeActions($request, $data);
        $arrests = $this->normalizeArrests($data);
        $legalOpinions = $this->decodeArrayField($data['legal_opinions'] ?? []);
        $approvals = $this->decodeArrayField($data['approvals'] ?? []);

        $caseFile = DB::transaction(function () use ($data, $request, $gen, $actions, $arrests, $legalOpinions, $approvals) {
            $enquiry = !empty($data['enquiry_id']) ? Enquiry::find($data['enquiry_id']) : null;
            $directInfo = $enquiry
                ? ($enquiry->direct_info ?? ($data['direct_info'] ?? null))
                : ($data['direct_info'] ?? null);

            $circleCode = is_array($directInfo) ? ($directInfo['circle_code'] ?? null) : null;
            $firNo = $data['fir_no'] ?? $gen->generate($circleCode);

            $caseFile = CaseFile::create([
                'enquiry_id'              => $enquiry?->id,
                'direct_info'             => $enquiry ? ($enquiry->direct_info ?? $directInfo) : $directInfo,
                'fir_no'                  => $firNo,
                'investigation_officer_id' => $data['investigation_officer_id'] ?? null,
                'status'                  => 'registered',
            ]);

            if (!empty($caseFile->investigation_officer_id)) {
                app(OfficerAssignmentService::class)->recordInitial(
                    $caseFile,
                    OfficerAssignmentService::TYPE_CASE,
                    OfficerAssignmentService::ROLE_IO,
                    (int) $caseFile->investigation_officer_id,
                    $request->user()->id,
                );
            }

            // Create activities from checked actions
            if (!empty($actions)) {
                $actionTypes = [
                    'dac_request'   => 'DAC Request',
                    'mobile_record' => 'Mobile Record Obtained',
                    'bank_record'   => 'Bank Record Obtained',
                    'notice'        => 'Summon Issued',
                    'diary'         => 'Diary Maintained',
                    'seizure'       => 'Seizure Made',
                    'forensic_report' => 'Forensic Report',
                    'recovery'      => 'Recovery Effected',
                    'raid'          => 'Raid Conducted',
                ];

                foreach ($actions as $action) {
                    $type = is_array($action) ? ($action['type'] ?? null) : $action;
                    if (!$type) {
                        continue;
                    }
                    $description = $actionTypes[$type] ?? $type;
                    if (is_array($action) && !empty($action['description'])) {
                        $description = $action['description'];
                    }
                    CaseActivity::create([
                        'case_id'       => $caseFile->id,
                        'type'          => $type,
                        'description'   => $description,
                        'activity_date' => is_array($action) && !empty($action['activity_date'])
                            ? $action['activity_date']
                            : now(),
                        'created_by'    => $request->user()->id,
                    ]);
                }
            }

            // Create arrests
            if (!empty($arrests)) {
                foreach ($arrests as $a) {
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

            if (!empty($legalOpinions)) {
                $this->syncLegalOpinions($caseFile, $legalOpinions, $request->user()->id);
            }

            if (!empty($approvals)) {
                $this->syncApprovals($caseFile, $approvals, $request->user()->id);
            }

            return $caseFile;
        });

        if ($caseFile->investigation_officer_id) {
            try {
                $caseFile->investigationOfficer?->notify(new CaseAssignedNotification($caseFile));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('CaseAssignedNotification failed: ' . $e->getMessage());
            }

            try {
                if ($caseFile->investigationOfficer) {
                    app(SmsService::class)->sendToUser(
                        $caseFile->investigationOfficer,
                        SmsTemplates::caseAssigned($caseFile, $caseFile->investigationOfficer, 'en'),
                        SmsTemplates::caseAssigned($caseFile, $caseFile->investigationOfficer, 'ur'),
                        [
                            'subject_type' => 'case_file',
                            'subject_id'   => $caseFile->id,
                            'trigger'      => 'case_assigned',
                        ]
                    );
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Officer SMS failed: ' . $e->getMessage());
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Case/FIR registered — ' . $caseFile->fir_no,
                'data'    => $caseFile->load(
                    'enquiry.complaint',
                    'investigationOfficer',
                    'activities.creator',
                    'arrests',
                    'legalOpinions.creator',
                    'approvals.circleIncharge'
                ),
            ], 201);
        }

        return redirect()->route('dashboard')
            ->with('success', 'Case/FIR registered — ' . $caseFile->fir_no);
    }

    public function update(Request $request, CaseFile $caseFile)
    {
        abort_unless(
            CaseFile::visibleTo($request->user())->whereKey($caseFile->id)->exists(),
            404
        );
        $this->authorize('update', $caseFile);

        $data = $request->validate([
            'enquiry_id'               => 'nullable|integer|exists:enquiries,id',
            'direct_info'              => 'nullable|array',
            'direct_info.reference_no' => 'nullable|string|max:255',
            'direct_info.complainant_name' => 'nullable|string|max:255',
            'direct_info.circle_id'    => 'nullable',
            'direct_info.circle_code'  => 'nullable|string|max:50',
            'direct_info.high_profile_type' => 'nullable|string|max:50',
            'direct_info.department_type' => 'nullable|string|max:50',
            'direct_info.received_via' => 'nullable|string|max:50',
            'fir_no'                   => 'nullable|string|unique:cases,fir_no,' . $caseFile->id,
            'investigation_officer_id' => 'nullable|integer|exists:users,id',
            'status'                   => 'nullable|string|max:50',
            'priority'                 => 'nullable|string|in:normal,high,critical',
            'recommendation'           => 'nullable|string|max:30',
            'transfer_department'      => 'nullable|string|max:255',
            'transfer_circle'          => 'nullable|string|max:255',
            'merge_complaint_id'       => 'nullable|string|max:255',
            'actions'                  => 'nullable',
            'activities'               => 'nullable',
            'arrests'                  => 'nullable',
            'legal_opinions'           => 'nullable',
            'approvals'                => 'nullable',
            'ad_legal_opinion'         => 'nullable|string',
            'add_director_decision'    => 'nullable|string',
            'dd_legal_opinion'         => 'nullable|string',
            'incharge_approval'        => 'nullable|string|in:agree,review',
            'incharge_remarks'         => 'nullable|string',
        ]);

        $actions = $this->normalizeActions($request, $data);
        $arrests = $this->normalizeArrests($data);
        $legalOpinions = $this->decodeArrayField($data['legal_opinions'] ?? []);
        $approvals = $this->decodeArrayField($data['approvals'] ?? []);

        $officerChanged = array_key_exists('investigation_officer_id', $data)
            && (int) ($data['investigation_officer_id'] ?: 0) !== (int) ($caseFile->investigation_officer_id ?: 0)
            && !empty($data['investigation_officer_id']);

        if ($officerChanged) {
            $caseFile->load('investigationOfficer');
            app(OfficerAssignmentService::class)->reassign(
                $caseFile,
                OfficerAssignmentService::TYPE_CASE,
                OfficerAssignmentService::ROLE_IO,
                (int) $data['investigation_officer_id'],
                $request->user()->id,
                'Officer changed via update',
            );
        }

        DB::transaction(function () use ($caseFile, $data, $request, $actions, $arrests, $legalOpinions, $approvals) {
            $updates = array_filter([
                'enquiry_id'               => array_key_exists('enquiry_id', $data) ? $data['enquiry_id'] : null,
                'investigation_officer_id' => array_key_exists('investigation_officer_id', $data)
                    ? ($data['investigation_officer_id'] ?: null)
                    : null,
                'status'                   => $data['status'] ?? null,
                'recommendation'           => array_key_exists('recommendation', $data) ? ($data['recommendation'] ?: null) : null,
                'transfer_department'      => array_key_exists('transfer_department', $data) ? ($data['transfer_department'] ?: null) : null,
                'transfer_circle'          => array_key_exists('transfer_circle', $data) ? ($data['transfer_circle'] ?: null) : null,
                'merge_complaint_id'       => array_key_exists('merge_complaint_id', $data) ? ($data['merge_complaint_id'] ?: null) : null,
            ], fn ($v) => $v !== null);

            if (Schema::hasColumn('cases', 'priority') && !empty($data['priority'])) {
                $updates['priority'] = $data['priority'];
            }

            if (array_key_exists('direct_info', $data)) {
                $updates['direct_info'] = $data['direct_info'];
            }

            if ($updates) {
                $caseFile->update($updates);
            }

            if (!empty($actions)) {
                $actionTypes = [
                    'dac_request'     => 'DAC Request',
                    'mobile_record'   => 'Mobile Record Obtained',
                    'bank_record'     => 'Bank Record Obtained',
                    'notice'          => 'Summon Issued',
                    'diary'           => 'Diary Maintained',
                    'seizure'         => 'Seizure Made',
                    'forensic_report' => 'Forensic Report',
                    'recovery'        => 'Recovery Effected',
                    'raid'            => 'Raid Conducted',
                ];
                foreach ($actions as $action) {
                    $type = is_array($action) ? ($action['type'] ?? null) : $action;
                    if (!$type) {
                        continue;
                    }
                    $existing = $caseFile->activities()->where('type', $type)->first();
                    $description = is_array($action) && !empty($action['description'])
                        ? $action['description']
                        : ($actionTypes[$type] ?? $type);
                    $activityDate = is_array($action) && !empty($action['activity_date'])
                        ? $action['activity_date']
                        : now();

                    if ($existing) {
                        $existing->update([
                            'description'   => $description,
                            'activity_date' => $activityDate,
                        ]);
                        continue;
                    }

                    CaseActivity::create([
                        'case_id'       => $caseFile->id,
                        'type'          => $type,
                        'description'   => $description,
                        'activity_date' => $activityDate,
                        'created_by'    => $request->user()->id,
                    ]);
                }
            }

            if (!empty($arrests)) {
                foreach ($arrests as $a) {
                    if (empty($a['accused_name'])) {
                        continue;
                    }
                    $caseFile->arrests()->create([
                        'accused_name'   => $a['accused_name'],
                        'cnic'           => $a['cnic'] ?? null,
                        'arrest_date'    => $a['arrest_date'] ?? now()->toDateString(),
                        'remand_details' => $a['remand_details'] ?? null,
                    ]);
                }
            }

            if (!empty($legalOpinions)) {
                $this->syncLegalOpinions($caseFile, $legalOpinions, $request->user()->id);
            }

            if (!empty($approvals)) {
                $this->syncApprovals($caseFile, $approvals, $request->user()->id);
            }

            if (!empty($data['ad_legal_opinion'])) {
                CaseLegalOpinion::create([
                    'case_id'      => $caseFile->id,
                    'role'         => 'ad_legal',
                    'opinion_text' => $data['ad_legal_opinion'],
                    'decision'     => $data['ad_legal_opinion'],
                    'created_by'   => $request->user()->id,
                ]);
            }
            if (!empty($data['add_director_decision'])) {
                CaseLegalOpinion::create([
                    'case_id'      => $caseFile->id,
                    'role'         => 'additional_director',
                    'opinion_text' => '',
                    'decision'     => $data['add_director_decision'],
                    'created_by'   => $request->user()->id,
                ]);
            }
            if (!empty($data['dd_legal_opinion'])) {
                CaseLegalOpinion::create([
                    'case_id'      => $caseFile->id,
                    'role'         => 'dd_legal',
                    'opinion_text' => $data['dd_legal_opinion'],
                    'decision'     => $data['dd_legal_opinion'],
                    'created_by'   => $request->user()->id,
                ]);
            }
            if (!empty($data['incharge_approval'])) {
                CaseApproval::create([
                    'case_id'            => $caseFile->id,
                    'circle_incharge_id' => $request->user()->id,
                    'decision'           => $data['incharge_approval'],
                    'remarks'            => $data['incharge_remarks'] ?? null,
                ]);
            }
        });

        // SMS the new investigation officer when reassigned via update.
        try {
            if ($officerChanged && $caseFile->investigationOfficer) {
                app(SmsService::class)->sendToUser(
                    $caseFile->investigationOfficer,
                    SmsTemplates::caseAssigned($caseFile, $caseFile->investigationOfficer, 'en'),
                    SmsTemplates::caseAssigned($caseFile, $caseFile->investigationOfficer, 'ur'),
                    [
                        'subject_type' => 'case_file',
                        'subject_id'   => $caseFile->id,
                        'trigger'      => 'case_assigned',
                    ]
                );
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Officer SMS failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Case updated successfully',
            'data'    => $caseFile->fresh()->load(
                'enquiry.complaint',
                'investigationOfficer',
                'activities.creator',
                'arrests',
                'legalOpinions.creator',
                'approvals.circleIncharge'
            ),
        ]);
    }

    public function show(CaseFile $caseFile)
    {
        abort_unless(
            CaseFile::visibleTo(request()->user())->whereKey($caseFile->id)->exists(),
            404
        );

        $caseFile->load(
            'enquiry.complaint',
            'enquiry.accusedPersons',
            'enquiry.witnesses',
            'enquiry.activities',
            'enquiry.officer',
            'investigationOfficer',
            'activities.creator',
            'arrests',
            'legalOpinions.creator',
            'approvals.circleIncharge'
        );

        if ($caseFile->enquiry) {
            app(EnquiryRecordHydrator::class)->hydrate($caseFile->enquiry);
            $caseFile->enquiry->refresh()->load(['complaint', 'accusedPersons', 'witnesses', 'activities', 'officer']);
        }

        return response()->json($caseFile);
    }

    public function assignOfficer(Request $request, CaseFile $caseFile)
    {
        $data = $request->validate([
            'investigation_officer_id' => 'required|integer|exists:users,id',
            'change_reason'            => 'nullable|string|max:500',
        ]);

        $caseFile->load('investigationOfficer');
        app(OfficerAssignmentService::class)->reassign(
            $caseFile,
            OfficerAssignmentService::TYPE_CASE,
            OfficerAssignmentService::ROLE_IO,
            (int) $data['investigation_officer_id'],
            $request->user()->id,
            $data['change_reason'] ?? 'Officer reassigned',
        );

        $caseFile->update([
            'investigation_officer_id' => $data['investigation_officer_id'],
            'status'                   => 'assigned',
        ]);

        $caseFile->investigationOfficer?->notify(new CaseAssignedNotification($caseFile));

        if ($caseFile->investigationOfficer) {
            app(SmsService::class)->sendToUser(
                $caseFile->investigationOfficer,
                SmsTemplates::caseAssigned($caseFile, $caseFile->investigationOfficer, 'en'),
                SmsTemplates::caseAssigned($caseFile, $caseFile->investigationOfficer, 'ur'),
                [
                    'subject_type' => 'case_file',
                    'subject_id'   => $caseFile->id,
                    'trigger'      => 'case_assigned',
                ]
            );
        }

        return response()->json([
            'message' => 'Investigation officer assigned. Previous officer work saved in history.',
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
