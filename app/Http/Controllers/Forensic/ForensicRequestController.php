<?php

namespace App\Http\Controllers\Forensic;

use App\Http\Controllers\Controller;
use App\Models\ForensicRequest;
use App\Models\User;
use App\Notifications\ForensicReportHandedOverNotification;
use App\Notifications\ForensicReportReadyNotification;
use App\Notifications\ForensicRequestAssignedNotification;
use App\Services\ForensicReportCodeGenerator;
use App\Services\SmsService;
use App\Services\SmsTemplates;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForensicRequestController extends Controller
{
    private function withRelations()
    {
        return [
            'items',
            'submitter:id,name,email,designation,circle_id',
            'submitter.circle:id,name,code',
            'assignee:id,name,email,designation',
            'adReviewer:id,name,email,designation',
            'deskOfficer:id,name,email,designation',
            'handedTo:id,name,email,designation',
            'enquiry' => function ($q) {
                $q->with([
                    'officer:id,name,email,designation',
                    'complaint:id,tracking_no,complainant_name,complainant_phone,complainant_cnic,circle_id,zone_id',
                    'complaint.circle:id,name,code',
                    'complaint.zone:id,name,code',
                    'accusedPersons:id,enquiry_id,name,father_name,cnic,mobile,address',
                ]);
            },
            'caseFile' => function ($q) {
                $q->with([
                    'officer:id,name,email,designation',
                    'circle:id,name,code',
                    'zone:id,name,code',
                ]);
            },
        ];
    }

    /** EO / IO / CI submit seizure to Forensic or Technical */
    public function store(Request $request, ForensicReportCodeGenerator $gen)
    {
        $user = $request->user();
        abort_unless(
            $user->hasAnyRole([
                'admin', 'circle_incharge', 'enquiry_officer', 'investigation_officer',
                'moharrar', 'director_general', 'operator',
            ]),
            403
        );

        if (is_string($request->input('items'))) {
            $decoded = json_decode($request->input('items'), true);
            if (is_array($decoded)) {
                $request->merge(['items' => $decoded]);
            }
        }

        $data = $request->validate([
            'enquiry_id'          => 'nullable|integer|exists:enquiries,id',
            'case_id'             => 'nullable|integer|exists:cases,id',
            'destination'         => 'required|in:forensic,technical',
            'priority'            => 'nullable|in:normal,high,urgent',
            'note'                => 'required|string|max:5000',
            'items'               => 'nullable|array',
            'items.*.item_type'        => 'required_with:items|string|max:50',
            'items.*.make_model'       => 'nullable|string|max:255',
            'items.*.imei'             => 'nullable|string|max:64',
            'items.*.imei2'            => 'nullable|string|max:64',
            'items.*.serial_no'        => 'nullable|string|max:128',
            'items.*.storage_capacity' => 'nullable|string|max:64',
            'items.*.condition'        => 'nullable|string|max:100',
            'items.*.seized_from'      => 'nullable|string|max:255',
            'items.*.quantity'         => 'nullable|integer|min:1|max:999',
            'items.*.description'      => 'nullable|string|max:1000',
            'attachment'          => 'nullable|file|max:20480',
        ]);

        if (empty($data['enquiry_id']) && empty($data['case_id'])) {
            return response()->json(['message' => 'Link enquiry or case is required.'], 422);
        }

        $items = $data['items'] ?? [];
        if ($items === []) {
            $items = [[
                'item_type'   => 'phone',
                'description' => 'Seized evidence item for forensic analysis',
                'quantity'    => 1,
            ]];
        }

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('forensic-requests', 'public');
        }

        $fr = DB::transaction(function () use ($data, $user, $gen, $path, $items) {
            $fr = ForensicRequest::create([
                'request_no'      => $gen->generateRequestNo(),
                'enquiry_id'      => $data['enquiry_id'] ?? null,
                'case_id'         => $data['case_id'] ?? null,
                'submitted_by'    => $user->id,
                'destination'     => $data['destination'],
                'priority'        => $data['priority'] ?? 'normal',
                'note'            => $data['note'],
                'status'          => 'submitted',
                'attachment_path' => $path,
            ]);

            foreach ($items as $item) {
                $fr->items()->create([
                    'item_type'        => $item['item_type'],
                    'make_model'       => $item['make_model'] ?? null,
                    'imei'             => $item['imei'] ?? null,
                    'imei2'            => $item['imei2'] ?? null,
                    'serial_no'        => $item['serial_no'] ?? null,
                    'storage_capacity' => $item['storage_capacity'] ?? null,
                    'condition'        => $item['condition'] ?? null,
                    'seized_from'      => $item['seized_from'] ?? null,
                    'quantity'         => $item['quantity'] ?? 1,
                    'description'      => $item['description'] ?? null,
                ]);
            }

            return $fr;
        });

        // Notify AD Forensic when destination is forensic
        if ($fr->destination === 'forensic') {
            User::role('ad_forensic')->get()->each(function (User $ad) use ($fr) {
                $ad->notify(new ForensicRequestAssignedNotification($fr));
            });
            User::role('admin_forensic')->get()->each(function (User $ad) use ($fr) {
                $ad->notify(new ForensicRequestAssignedNotification($fr));
            });
        }

        return response()->json([
            'message' => ($fr->destination === 'forensic'
                ? 'Seized evidence and memo submitted to AD Forensic for review.'
                : 'Submitted to Technical department.'),
            'data'    => $fr->load($this->withRelations()),
        ], 201);
    }

    /** EO / main app: list seize requests for enquiry or case */
    public function linkedIndex(Request $request)
    {
        $user = $request->user();
        abort_unless(
            $user->hasAnyRole([
                'admin', 'circle_incharge', 'enquiry_officer', 'investigation_officer',
                'moharrar', 'director_general', 'operator',
            ]),
            403
        );

        $data = $request->validate([
            'enquiry_id' => 'nullable|integer|exists:enquiries,id',
            'case_id'    => 'nullable|integer|exists:cases,id',
        ]);

        if (empty($data['enquiry_id']) && empty($data['case_id'])) {
            return response()->json(['message' => 'enquiry_id or case_id required.'], 422);
        }

        $q = ForensicRequest::with($this->withRelations())->latest();
        if (!empty($data['enquiry_id'])) {
            $q->where('enquiry_id', $data['enquiry_id']);
        }
        if (!empty($data['case_id'])) {
            $q->where('case_id', $data['case_id']);
        }

        return response()->json(['data' => $q->limit(50)->get()]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isForensic() || $user->hasRole('admin'), 403);

        $q = ForensicRequest::with($this->withRelations())->latest();

        if ($user->hasRole('forensic_team') && !$user->hasAnyRole(['admin_forensic', 'ad_forensic', 'desk_forensic'])) {
            $q->where('assigned_to', $user->id);
        } elseif ($user->hasRole('desk_forensic') && !$user->hasAnyRole(['admin_forensic', 'ad_forensic'])) {
            $q->whereIn('status', ['report_ready', 'handed_over']);
        } elseif ($user->hasAnyRole(['ad_forensic', 'admin_forensic'])) {
            $q->where('destination', 'forensic');
        }

        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $q->where('priority', $priority);
        }

        if ($assignedTo = $request->query('assigned_to')) {
            $q->where('assigned_to', $assignedTo);
        }

        if ($circleId = $request->query('circle_id')) {
            $q->whereHas('submitter', function ($sq) use ($circleId) {
                $sq->where('circle_id', $circleId);
            });
        }

        if ($itemType = $request->query('item_type')) {
            $q->whereHas('items', function ($iq) use ($itemType) {
                $iq->where('item_type', $itemType);
            });
        }

        // Global Search across request_no, report_code, note, items (make_model, imei, serial_no), submitter name, enquiry number
        if ($search = trim((string) $request->query('search', ''))) {
            $q->where(function ($sq) use ($search) {
                $sq->where('request_no', 'like', "%{$search}%")
                    ->orWhere('report_code', 'like', "%{$search}%")
                    ->orWhere('note', 'like', "%{$search}%")
                    ->orWhere('findings', 'like', "%{$search}%")
                    ->orWhereHas('submitter', function ($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('enquiry', function ($enqQ) use ($search) {
                        $enqQ->where('enquiry_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('caseFile', function ($caseQ) use ($search) {
                        $caseQ->where('fir_no', 'like', "%{$search}%");
                    })
                    ->orWhereHas('items', function ($itemQ) use ($search) {
                        $itemQ->where('make_model', 'like', "%{$search}%")
                            ->orWhere('imei', 'like', "%{$search}%")
                            ->orWhere('imei2', 'like', "%{$search}%")
                            ->orWhere('serial_no', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = (int) $request->query('per_page', 30);
        if ($perPage <= 0 || $perPage > 100) {
            $perPage = 30;
        }

        return response()->json(['data' => $q->paginate($perPage)]);
    }

    public function show(Request $request, ForensicRequest $forensicRequest, ForensicReportCodeGenerator $gen)
    {
        $user = $request->user();
        abort_unless($user->isForensic() || $user->hasRole('admin'), 403);

        // FO first open → generate report code + in_progress
        if (
            $user->hasRole('forensic_team')
            && (int) $forensicRequest->assigned_to === (int) $user->id
            && in_array($forensicRequest->status, ['assigned', 'in_progress'], true)
            && empty($forensicRequest->report_code)
        ) {
            $forensicRequest->update([
                'report_code' => $gen->generateReportCode(),
                'status'      => 'in_progress',
                'opened_at'   => now(),
            ]);
        }

        return response()->json(['data' => $forensicRequest->fresh()->load($this->withRelations())]);
    }

    /** AD Forensic assigns FO */
    public function assign(Request $request, ForensicRequest $forensicRequest)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['ad_forensic', 'admin_forensic']), 403);
        abort_unless($forensicRequest->destination === 'forensic', 422);

        $data = $request->validate([
            'assigned_to' => 'required|integer|exists:users,id',
            'remarks'     => 'nullable|string|max:1000',
            'priority'    => 'nullable|in:normal,high,urgent',
        ]);

        $fo = User::findOrFail($data['assigned_to']);
        abort_unless($fo->hasRole('forensic_team'), 422, 'Assignee must be a Forensic Officer.');

        $updates = [
            'assigned_to'    => $fo->id,
            'assigned_at'    => now(),
            'ad_reviewed_by' => $user->id,
            'ad_reviewed_at' => now(),
            'status'         => 'assigned',
            'note'           => $forensicRequest->note . ($data['remarks'] ? "\n\n[AD Review] " . $data['remarks'] : ''),
        ];
        if (!empty($data['priority'])) {
            $updates['priority'] = $data['priority'];
        }

        $forensicRequest->update($updates);

        $fo->notify(new ForensicRequestAssignedNotification($forensicRequest->fresh()));

        return response()->json([
            'message' => "Evidence assigned to Forensic Officer {$fo->name}. Notification dispatched.",
            'data'    => $forensicRequest->fresh()->load($this->withRelations()),
        ]);
    }

    /** FO updates findings / laboratory examination notes / uploads report */
    public function updateFindings(Request $request, ForensicRequest $forensicRequest)
    {
        $user = $request->user();
        abort_unless(
            $user->hasAnyRole(['forensic_team', 'admin_forensic', 'ad_forensic'])
            && ((int) $forensicRequest->assigned_to === (int) $user->id || $user->hasAnyRole(['admin_forensic', 'ad_forensic'])),
            403
        );

        $data = $request->validate([
            'findings'     => 'nullable|string|max:10000',
            'lab_notes'    => 'nullable|string|max:10000',
            'report_file'  => 'nullable|file|max:30720', // up to 30MB
        ]);

        $updates = [];
        if (array_key_exists('findings', $data)) {
            $updates['findings'] = $data['findings'];
        }
        if (array_key_exists('lab_notes', $data)) {
            $updates['lab_notes'] = $data['lab_notes'];
        }
        if ($request->hasFile('report_file')) {
            $updates['report_attachment_path'] = $request->file('report_file')->store('forensic-reports', 'public');
        }

        if ($updates) {
            $forensicRequest->update($updates);
        }

        return response()->json([
            'message' => 'Forensic examination findings updated successfully.',
            'data'    => $forensicRequest->fresh()->load($this->withRelations()),
        ]);
    }

    /** FO submits finalized report to AD Forensic for approval */
    public function submitToAd(Request $request, ForensicRequest $forensicRequest)
    {
        $user = $request->user();
        abort_unless(
            $user->hasAnyRole(['forensic_team', 'admin_forensic', 'ad_forensic'])
            && ((int) $forensicRequest->assigned_to === (int) $user->id || $user->hasAnyRole(['admin_forensic', 'ad_forensic'])),
            403
        );
        abort_unless(in_array($forensicRequest->status, ['in_progress', 'assigned', 'submitted_to_ad'], true), 422);

        $data = $request->validate([
            'findings'    => 'nullable|string|max:10000',
            'lab_notes'   => 'nullable|string|max:10000',
            'report_file' => 'nullable|file|max:30720',
        ]);

        if (!$forensicRequest->report_code) {
            $forensicRequest->report_code = app(ForensicReportCodeGenerator::class)->generateReportCode();
            $forensicRequest->opened_at = $forensicRequest->opened_at ?: now();
        }

        $updates = [
            'status'      => 'submitted_to_ad',
            'report_code' => $forensicRequest->report_code,
            'opened_at'   => $forensicRequest->opened_at,
        ];

        if (array_key_exists('findings', $data) && $data['findings'] !== null) {
            $updates['findings'] = $data['findings'];
        }
        if (array_key_exists('lab_notes', $data) && $data['lab_notes'] !== null) {
            $updates['lab_notes'] = $data['lab_notes'];
        }
        if ($request->hasFile('report_file')) {
            $updates['report_attachment_path'] = $request->file('report_file')->store('forensic-reports', 'public');
        }

        $forensicRequest->update($updates);

        // Notify AD Forensic
        User::role(['ad_forensic', 'admin_forensic'])->get()->each(function (User $ad) use ($forensicRequest) {
            $ad->notify(new \App\Notifications\GeneralNotification(
                'forensic_report_submitted_to_ad',
                "Forensic Officer {$forensicRequest->assignee?->name} completed report for {$forensicRequest->request_no}. Ready for AD review & approval.",
                "/forensic/requests/{$forensicRequest->id}"
            ));
        });

        return response()->json([
            'message' => "Forensic report submitted to AD Forensic for approval. Report Code: {$forensicRequest->report_code}",
            'data'    => $forensicRequest->fresh()->load($this->withRelations()),
        ]);
    }

    /** AD Forensic approves report & notifies Enquiry Officer (EO) to collect by hand */
    public function markReady(Request $request, ForensicRequest $forensicRequest)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['ad_forensic', 'admin_forensic', 'forensic_team']), 403);
        abort_unless(in_array($forensicRequest->status, ['submitted_to_ad', 'in_progress', 'assigned'], true), 422);

        $data = $request->validate([
            'findings'    => 'nullable|string|max:10000',
            'lab_notes'   => 'nullable|string|max:10000',
            'report_file' => 'nullable|file|max:30720',
        ]);

        if (!$forensicRequest->report_code) {
            $forensicRequest->report_code = app(ForensicReportCodeGenerator::class)->generateReportCode();
            $forensicRequest->opened_at = $forensicRequest->opened_at ?: now();
        }

        $updates = [
            'status'           => 'report_ready',
            'report_ready_at'  => now(),
            'desk_notified_at' => now(),
            'ad_reviewed_by'   => $user->id,
            'ad_reviewed_at'   => now(),
            'report_code'      => $forensicRequest->report_code,
            'opened_at'        => $forensicRequest->opened_at,
        ];

        if (array_key_exists('findings', $data) && $data['findings'] !== null) {
            $updates['findings'] = $data['findings'];
        }
        if (array_key_exists('lab_notes', $data) && $data['lab_notes'] !== null) {
            $updates['lab_notes'] = $data['lab_notes'];
        }
        if ($request->hasFile('report_file')) {
            $updates['report_attachment_path'] = $request->file('report_file')->store('forensic-reports', 'public');
        }

        $forensicRequest->update($updates);

        // Notify Desk Officers
        User::role('desk_forensic')->get()->each(function (User $desk) use ($forensicRequest) {
            $desk->notify(new ForensicReportReadyNotification($forensicRequest->fresh()));
        });

        // Notify Enquiry Officer (EO) that report is ready for by-hand collection
        $forensicRequest->loadMissing('enquiry', 'submitter');
        $eoId = $forensicRequest->enquiry?->enquiry_officer_id ?? $forensicRequest->submitted_by;
        $eo = $eoId ? User::find($eoId) : null;

        if ($eo) {
            $caseRef = $forensicRequest->enquiry?->enquiry_number ? "Enquiry #{$forensicRequest->enquiry->enquiry_number}" : "Case";
            $eo->notify(new \App\Notifications\GeneralNotification(
                'forensic_report_ready_for_eo',
                "Forensic Report for {$caseRef} is ready (Code: {$forensicRequest->report_code}). Please collect by-hand from NCCIA Digital Forensic Lab.",
                "/enquiries" . ($forensicRequest->enquiry_id ? "/{$forensicRequest->enquiry_id}/edit" : "")
            ));

            app(SmsService::class)->sendToUser(
                $eo,
                SmsTemplates::forensicReportReadyToCollect($forensicRequest, 'en'),
                SmsTemplates::forensicReportReadyToCollect($forensicRequest, 'ur'),
                [
                    'subject_type' => 'forensic_request',
                    'subject_id'   => $forensicRequest->id,
                    'trigger'      => 'forensic_report_ready_for_eo',
                ]
            );
        }

        return response()->json([
            'message' => "Forensic report approved. Enquiry Officer ({$eo?->name}) notified to collect by-hand with Code: {$forensicRequest->report_code}.",
            'data'    => $forensicRequest->fresh()->load($this->withRelations()),
        ]);
    }

    /** Desk hands physical report to EO */
    public function handOver(Request $request, ForensicRequest $forensicRequest)
    {
        $user = $request->user();
        abort_unless($user->hasAnyRole(['desk_forensic', 'admin_forensic', 'ad_forensic']), 403);
        abort_unless($forensicRequest->status === 'report_ready', 422);

        $data = $request->validate([
            'handed_to_user_id' => 'nullable|integer|exists:users,id',
            'handover_remarks'  => 'nullable|string|max:1000',
        ]);

        $forensicRequest->loadMissing('enquiry');

        $eoId = $data['handed_to_user_id']
            ?? $forensicRequest->enquiry?->enquiry_officer_id
            ?? $forensicRequest->submitted_by;

        $forensicRequest->update([
            'status'            => 'handed_over',
            'desk_officer_id'   => $user->id,
            'handed_over_at'    => now(),
            'handed_to_user_id' => $eoId,
            'handover_remarks'  => $data['handover_remarks'] ?? null,
        ]);

        if ($eoId) {
            User::find($eoId)?->notify(new ForensicReportHandedOverNotification($forensicRequest->fresh()));

            $eo = User::find($eoId);
            if ($eo) {
                app(SmsService::class)->sendToUser(
                    $eo,
                    SmsTemplates::forensicHandedOver($forensicRequest, 'en'),
                    SmsTemplates::forensicHandedOver($forensicRequest, 'ur'),
                    [
                        'subject_type' => 'forensic_request',
                        'subject_id'   => $forensicRequest->id,
                        'trigger'      => 'forensic_handed_over',
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Physical report and evidence custody handed over to Enquiry Officer. Acknowledgment recorded.',
            'data'    => $forensicRequest->fresh()->load($this->withRelations()),
        ]);
    }

    /** EO / main app: lookup by report code */
    public function lookupByCode(Request $request)
    {
        $data = $request->validate([
            'report_code' => 'required|string|max:64',
        ]);

        $fr = ForensicRequest::with($this->withRelations())
            ->where('report_code', trim($data['report_code']))
            ->first();

        if (!$fr) {
            return response()->json(['message' => 'No forensic report found for this code.'], 404);
        }

        return response()->json(['data' => $fr]);
    }

    public function teamOfficers()
    {
        $officers = User::role('forensic_team')->orderBy('name')->get(['id', 'name', 'email', 'designation', 'phone']);

        return response()->json(['data' => $officers]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isForensic() || $user->hasRole('admin'), 403);

        $base = ForensicRequest::query()->where('destination', 'forensic');

        // Pipeline stage counts
        $submitted   = (clone $base)->where('status', 'submitted')->count();
        $assigned    = (clone $base)->where('status', 'assigned')->count();
        $inProgress  = (clone $base)->where('status', 'in_progress')->count();
        $reportReady = (clone $base)->where('status', 'report_ready')->count();
        $handedOver  = (clone $base)->where('status', 'handed_over')->count();
        $total       = $submitted + $assigned + $inProgress + $reportReady + $handedOver;

        // Priority breakdown
        $urgentCount = (clone $base)->whereIn('priority', ['urgent', 'high'])->whereNotIn('status', ['handed_over'])->count();

        // My assigned queue (for FO)
        $myAssigned = $user->hasRole('forensic_team')
            ? ForensicRequest::where('assigned_to', $user->id)->whereIn('status', ['assigned', 'in_progress'])->count()
            : 0;

        // Seized Devices breakdown
        $itemCounts = DB::table('forensic_request_items')
            ->join('forensic_requests', 'forensic_request_items.forensic_request_id', '=', 'forensic_requests.id')
            ->where('forensic_requests.destination', 'forensic')
            ->select('forensic_request_items.item_type', DB::raw('SUM(forensic_request_items.quantity) as total_qty'))
            ->groupBy('forensic_request_items.item_type')
            ->pluck('total_qty', 'item_type')
            ->all();

        $totalDevices = array_sum($itemCounts);

        // Circle distribution
        $circleCounts = DB::table('forensic_requests')
            ->join('users', 'forensic_requests.submitted_by', '=', 'users.id')
            ->leftJoin('circles', 'users.circle_id', '=', 'circles.id')
            ->where('forensic_requests.destination', 'forensic')
            ->select(DB::raw('COALESCE(circles.name, "Headquarters") as circle_name'), DB::raw('COUNT(forensic_requests.id) as count'))
            ->groupBy('circle_name')
            ->orderByDesc('count')
            ->limit(8)
            ->pluck('count', 'circle_name')
            ->all();

        return response()->json([
            'submitted'     => $submitted,
            'assigned'      => $assigned,
            'in_progress'   => $inProgress,
            'report_ready'  => $reportReady,
            'handed_over'   => $handedOver,
            'total'         => $total,
            'urgent_count'  => $urgentCount,
            'my_assigned'   => $myAssigned,
            'total_devices' => $totalDevices,
            'devices_by_type' => [
                'phone'     => (int) ($itemCounts['phone'] ?? $itemCounts['mobile'] ?? 0),
                'laptop'    => (int) ($itemCounts['laptop'] ?? $itemCounts['computer'] ?? $itemCounts['pc'] ?? 0),
                'storage'   => (int) ($itemCounts['hdd'] ?? $itemCounts['ssd'] ?? $itemCounts['storage'] ?? 0),
                'sim'       => (int) ($itemCounts['sim'] ?? $itemCounts['usb'] ?? $itemCounts['flash_drive'] ?? 0),
                'documents' => (int) ($itemCounts['documents'] ?? $itemCounts['report'] ?? 0),
                'other'     => (int) ($itemCounts['other'] ?? 0),
            ],
            'by_circle'     => $circleCounts,
        ]);
    }
}
