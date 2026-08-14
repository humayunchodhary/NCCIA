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
            'items', 'submitter:id,name', 'assignee:id,name', 'adReviewer:id,name',
            'deskOfficer:id,name', 'handedTo:id,name',
            'enquiry:id,enquiry_number', 'caseFile:id,fir_no',
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
            'enquiry_id'  => 'nullable|integer|exists:enquiries,id',
            'case_id'     => 'nullable|integer|exists:cases,id',
            'destination' => 'required|in:forensic,technical',
            'note'        => 'required|string|max:5000',
            'items'       => 'nullable|array',
            'items.*.item_type'  => 'required_with:items|string|max:50',
            'items.*.make_model' => 'nullable|string|max:255',
            'items.*.imei'       => 'nullable|string|max:64',
            'items.*.serial_no'  => 'nullable|string|max:128',
            'items.*.quantity'   => 'nullable|integer|min:1|max:999',
            'items.*.description'=> 'nullable|string|max:1000',
            'attachment'  => 'nullable|file|max:20480',
        ]);

        if (empty($data['enquiry_id']) && empty($data['case_id'])) {
            return response()->json(['message' => 'Link enquiry or case is required.'], 422);
        }

        $items = $data['items'] ?? [];
        if ($items === []) {
            $items = [[
                'item_type'   => 'report',
                'description' => 'Forensic / technical report submission',
                'quantity'    => 1,
            ]];
        }

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('forensic-requests', 'public');
        }

        $fr = DB::transaction(function () use ($data, $user, $gen, $path, $items) {
            $fr = ForensicRequest::create([
                'request_no'    => $gen->generateRequestNo(),
                'enquiry_id'    => $data['enquiry_id'] ?? null,
                'case_id'       => $data['case_id'] ?? null,
                'submitted_by'  => $user->id,
                'destination'   => $data['destination'],
                'note'          => $data['note'],
                'status'        => 'submitted',
                'attachment_path' => $path,
            ]);

            foreach ($items as $item) {
                $fr->items()->create([
                    'item_type'   => $item['item_type'],
                    'make_model'  => $item['make_model'] ?? null,
                    'imei'        => $item['imei'] ?? null,
                    'serial_no'   => $item['serial_no'] ?? null,
                    'quantity'    => $item['quantity'] ?? 1,
                    'description' => $item['description'] ?? null,
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
                ? 'Forensic report submitted to AD Forensic for review.'
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

        return response()->json(['data' => $q->paginate(30)]);
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
        ]);

        $fo = User::findOrFail($data['assigned_to']);
        abort_unless($fo->hasRole('forensic_team'), 422, 'Assignee must be a Forensic Officer.');

        $forensicRequest->update([
            'assigned_to'    => $fo->id,
            'assigned_at'    => now(),
            'ad_reviewed_by' => $user->id,
            'ad_reviewed_at' => now(),
            'status'         => 'assigned',
            'note'           => $forensicRequest->note . ($data['remarks'] ? "\n\n[AD] " . $data['remarks'] : ''),
        ]);

        $fo->notify(new ForensicRequestAssignedNotification($forensicRequest->fresh()));

        return response()->json([
            'message' => 'Assigned to Forensic Officer. Notification sent.',
            'data'    => $forensicRequest->fresh()->load($this->withRelations()),
        ]);
    }

    /** FO marks report ready → Desk notified */
    public function markReady(Request $request, ForensicRequest $forensicRequest)
    {
        $user = $request->user();
        abort_unless(
            $user->hasAnyRole(['forensic_team', 'admin_forensic'])
            && ((int) $forensicRequest->assigned_to === (int) $user->id || $user->hasRole('admin_forensic')),
            403
        );
        abort_unless(in_array($forensicRequest->status, ['in_progress', 'assigned'], true), 422);

        if (!$forensicRequest->report_code) {
            $forensicRequest->report_code = app(ForensicReportCodeGenerator::class)->generateReportCode();
            $forensicRequest->opened_at = $forensicRequest->opened_at ?: now();
        }

        $forensicRequest->update([
            'status'          => 'report_ready',
            'report_ready_at' => now(),
            'desk_notified_at'=> now(),
            'report_code'     => $forensicRequest->report_code,
            'opened_at'       => $forensicRequest->opened_at,
        ]);

        User::role('desk_forensic')->get()->each(function (User $desk) use ($forensicRequest) {
            $desk->notify(new ForensicReportReadyNotification($forensicRequest->fresh()));
        });

        return response()->json([
            'message' => 'Report marked ready. Desk officer notified. Code: ' . $forensicRequest->report_code,
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
            'message' => 'Report handed over to EO (by hand). EO notified with report code.',
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
        $officers = User::role('forensic_team')->orderBy('name')->get(['id', 'name', 'email', 'designation']);

        return response()->json(['data' => $officers]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isForensic() || $user->hasRole('admin'), 403);

        $base = ForensicRequest::query()->where('destination', 'forensic');

        return response()->json([
            'submitted'     => (clone $base)->where('status', 'submitted')->count(),
            'assigned'      => (clone $base)->where('status', 'assigned')->count(),
            'in_progress'   => (clone $base)->where('status', 'in_progress')->count(),
            'report_ready'  => (clone $base)->where('status', 'report_ready')->count(),
            'handed_over'   => (clone $base)->where('status', 'handed_over')->count(),
            'my_assigned'   => $user->hasRole('forensic_team')
                ? ForensicRequest::where('assigned_to', $user->id)->whereIn('status', ['assigned', 'in_progress'])->count()
                : 0,
        ]);
    }
}
