<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\OffenceType;
use App\Models\User;
use App\Models\Verification;
use App\Http\Requests\StoreComplaintRequest;
use App\Http\Requests\UpdateComplaintRequest;
use App\Http\Resources\ComplaintResource;
use App\Notifications\VerificationAssignedNotification;
use App\Services\ComplainantNotifyService;
use App\Services\PrintService;
use App\Services\SmsService;
use App\Services\SmsTemplates;
use App\Services\TrackingNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ComplaintController extends Controller
{
    /**
     * Move an uploaded complaint file into public/uploads/complaints.
     */
    protected function uploadComplaintFile(Request $request, string $field, ?string $existing = null): ?string
    {
        if (!$request->hasFile($field)) {
            return $existing;
        }

        $file = $request->file($field);
        $dir = public_path('uploads/complaints');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $name = Str::random(24) . '.' . ($file->getClientOriginalExtension() ?: 'bin');
        $file->move($dir, $name);

        if ($existing && is_file(public_path($existing))) {
            @unlink(public_path($existing));
        }

        return 'uploads/complaints/' . $name;
    }

    /** @deprecated use uploadComplaintFile */
    protected function uploadAttachment(Request $request, ?Complaint $complaint = null): ?string
    {
        return $this->uploadComplaintFile($request, 'attachment', $complaint?->attachment);
    }

    public function index()
    {
        $this->authorize('viewAny', Complaint::class);

        $perPage = min(50, max(10, (int) request('per_page', 15)));

        $complaints = Complaint::visibleTo(request()->user())
            ->with(['enquiry', 'verification.officer', 'caseFiles', 'circle'])
            ->latest('id')
            ->paginate($perPage);

        if (request()->expectsJson()) {
            return ComplaintResource::collection($complaints);
        }

        return view('pages.all-complaints', compact('complaints'));
    }

    /**
     * Lightweight typeahead for forms (never load full complaint tables).
     */
    public function search(Request $request)
    {
        $this->authorize('viewAny', Complaint::class);

        $q = trim((string) $request->get('q', ''));
        $query = Complaint::visibleTo($request->user())
            ->with('verification:id,complaint_id,verification_officer_id,status,assigned_at')
            ->whereNotNull('tracking_no');

        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('tracking_no', 'like', $q . '%')
                    ->orWhere('diary_no', 'like', $q . '%')
                    ->orWhere('cnic', 'like', $q . '%')
                    ->orWhere('complainant_name', 'like', $q . '%');
            });
        }

        $rows = $query->latest('id')->limit(20)->get(['id', 'tracking_no', 'diary_no', 'complainant_name', 'cnic', 'contact_no', 'contact_country_code', 'profession', 'offence_type', 'cmu', 'description', 'entry_time', 'created_at', 'status']);

        return response()->json(['data' => $rows]);
    }

    public function create()
    {
        $offenceTypes = OffenceType::orderBy('group')->orderBy('name')->get();
        return view('pages.newcomplaint', compact('offenceTypes'));
    }

    public function store(StoreComplaintRequest $request)
    {
        try {
            return $this->storeComplaint($request);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), 'Unknown column') || str_contains($e->getMessage(), 'no such column')) {
                return response()->json([
                    'message' => 'Database columns missing. Server pe chalao: php artisan migrate --force',
                ], 500);
            }
            throw $e;
        }
    }

    private function storeComplaint(StoreComplaintRequest $request)
    {
        $data = $request->validated();
        $officerId = $data['verification_officer_id'] ?? null;
        $assignPriority = $data['assign_priority_type'] ?? ($data['priority_type'] ?? 'normal');
        unset($data['verification_officer_id'], $data['assign_priority_type']);

        $data['laws'] = $request->has('laws') ? $request->laws : null;
        $data['evidence'] = $request->has('evidence') ? $request->evidence : null;
        $data['platforms'] = $request->has('platforms') ? $request->platforms : null;
        $data['crime_mediums'] = $request->has('crime_mediums') ? $request->crime_mediums : null;
        if ($request->has('initial_accused')) {
            $accused = $request->input('initial_accused');
            $data['initial_accused'] = is_string($accused) ? (json_decode($accused, true) ?: []) : $accused;
        }
        $data['user_id'] = Auth::id();
        $data['operator_id'] = $data['operator_id'] ?? Auth::id();
        // Bind complaint to operator's circle so same-circle CI (e.g. Lahore) receives work
        if (empty($data['circle_id']) && Auth::user()?->circle_id) {
            $data['circle_id'] = Auth::user()->circle_id;
        }
        $data['attachment'] = $this->uploadComplaintFile($request, 'attachment');
        $data['cnic_front'] = $this->uploadComplaintFile($request, 'cnic_front');
        $data['cnic_back'] = $this->uploadComplaintFile($request, 'cnic_back');
        $data['passport_attachment'] = $this->uploadComplaintFile($request, 'passport_attachment');
        $data['picture'] = $this->uploadComplaintFile($request, 'picture');

        $scrutinyResult = $data['scrutiny_result'] ?? null;
        if ($scrutinyResult === 'complete') {
            $data['status'] = 'complete';

            $circle = isset($data['circle_id']) ? \App\Models\Circle::find($data['circle_id']) : null;
            $generator = app(\App\Services\TrackingNumberGenerator::class);

            $maxAttempts = 10;
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                $data['tracking_no'] = $generator->generate($circle);
                try {
                    $complaint = DB::transaction(function () use ($data) {
                        return Complaint::create($data);
                    });
                    break;
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($attempt >= $maxAttempts - 1 || !str_contains($e->getMessage(), 'complaints_tracking_no_unique')) {
                        throw $e;
                    }
                }
            }
        } else {
            $data['status'] = 'incomplete';
            $complaint = Complaint::create($data);
        }

        if ($scrutinyResult === 'complete' && $officerId) {
            $this->assignVerificationOfficer($complaint, (int) $officerId, $assignPriority);
        }

        // When complaint gets a tracking number, notify complainant immediately (WhatsApp deep-link).
        $notify = null;
        if ($complaint->tracking_no) {
            $notify = app(ComplainantNotifyService::class)->notifyRegistration($complaint);
            $complaint->refresh();
            $this->sendComplainantSms(
                $complaint,
                SmsTemplates::complaintRegistered($complaint, 'en'),
                SmsTemplates::complaintRegistered($complaint, 'ur'),
                'complaint_registered'
            );
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Complaint registered successfully' . ($complaint->tracking_no ? ' — ' . $complaint->tracking_no : ''),
                'data' => new ComplaintResource($complaint->load('verification')),
                'complainant_notify' => $notify,
            ], 201);
        }

        return redirect()->route('dashboard')
            ->with('success', 'Complaint registered successfully — ' . ($complaint->tracking_no ?? 'N/A'))
            ->with('complainant_whatsapp_url', $notify['whatsapp_url'] ?? null);
    }

    public function show(Complaint $complaint)
    {
        $this->authorize('view', $complaint);

        return new ComplaintResource($complaint->load(['enquiry', 'verification', 'caseFiles', 'circle']));
    }

    public function edit(Complaint $complaint)
    {
        $offenceTypes = OffenceType::orderBy('group')->orderBy('name')->get();
        return view('pages.edit-complaint', compact('complaint', 'offenceTypes'));
    }

    public function update(UpdateComplaintRequest $request, Complaint $complaint)
    {
        abort_unless(
            Complaint::visibleTo($request->user())->whereKey($complaint->id)->exists(),
            404
        );

        $data = $request->validated();
        $officerId = $data['verification_officer_id'] ?? null;
        $assignPriority = $data['assign_priority_type'] ?? ($data['priority_type'] ?? 'normal');
        unset($data['verification_officer_id'], $data['assign_priority_type']);

        $data['laws']     = $request->has('laws') ? $request->laws : $complaint->laws;
        $data['evidence'] = $request->has('evidence') ? $request->evidence : $complaint->evidence;
        $data['platforms'] = $request->has('platforms') ? $request->platforms : $complaint->platforms;
        $data['crime_mediums'] = $request->has('crime_mediums') ? $request->crime_mediums : $complaint->crime_mediums;
        if ($request->has('initial_accused')) {
            $accused = $request->input('initial_accused');
            $data['initial_accused'] = is_string($accused) ? (json_decode($accused, true) ?: []) : $accused;
        }
        foreach (['attachment', 'cnic_front', 'cnic_back', 'passport_attachment', 'picture'] as $fileField) {
            if ($request->hasFile($fileField)) {
                $data[$fileField] = $this->uploadComplaintFile($request, $fileField, $complaint->{$fileField});
            } else {
                unset($data[$fileField]);
            }
        }

        $scrutinyResult = $data['scrutiny_result'] ?? $complaint->scrutiny_result;

        $hadTracking = (bool) $complaint->tracking_no;

        if ($scrutinyResult === 'complete' && !$complaint->tracking_no) {
            $circle = $complaint->circle;
            $generator = app(\App\Services\TrackingNumberGenerator::class);
            $maxAttempts = 10;
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                $data['tracking_no'] = $generator->generate($circle);
                $data['status'] = 'complete';
                try {
                    $complaint->update($data);
                    break;
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($attempt >= $maxAttempts - 1 || !str_contains($e->getMessage(), 'complaints_tracking_no_unique')) {
                        throw $e;
                    }
                }
            }
        } else {
            $data['status'] = $scrutinyResult === 'complete' ? 'complete' : 'incomplete';
            $complaint->update($data);
        }

        $complaint->refresh();
        if ($scrutinyResult === 'complete' && $officerId && !$complaint->verification) {
            $this->assignVerificationOfficer($complaint, (int) $officerId, $assignPriority);
        }

        $notify = null;
        $complaint->refresh();
        if ($complaint->tracking_no && (!$hadTracking || !$complaint->registration_notified_at)) {
            $notify = app(ComplainantNotifyService::class)->notifyRegistration($complaint);
            $complaint->refresh();
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Complaint updated successfully',
                'data'    => new ComplaintResource($complaint->load('verification')),
                'complainant_notify' => $notify,
            ]);
        }

        return redirect()->route('dashboard')
            ->with('success', 'Complaint #' . $complaint->tracking_no . ' updated successfully');
    }

    /**
     * Generate & return the printable 80mm complaint slip HTML.
     */
    public function slip(Complaint $complaint, PrintService $print)
    {
        abort_unless(
            Complaint::visibleTo(request()->user())->whereKey($complaint->id)->exists(),
            404
        );

        if (!$complaint->slip_generated) {
            $complaint->update([
                'slip_generated'    => true,
                'slip_generated_at' => now(),
                'slip_number'       => $complaint->slip_number ?: ($complaint->tracking_no ?: ('SLP-' . $complaint->id)),
            ]);
        }

        return response()->json([
            'html' => $print->slipPrintDocument($complaint),
        ]);
    }

    /**
     * Public complaint receipt verification (scanned via QR on slip).
     */
    public function verifySlip(int $id, string $token)
    {
        $complaint = Complaint::with('circle')->findOrFail($id);
        $expected = substr(hash_hmac('sha256', 'complaint:' . $complaint->id, (string) config('app.key')), 0, 32);

        abort_unless(hash_equals($expected, $token), 404);

        return view('complaints.slip-verify', compact('complaint'));
    }

    public function destroy(Complaint $complaint)
    {
        $this->authorize('delete', $complaint);

        activity()->useLog('complaints')
            ->performedOn($complaint)
            ->causedBy(auth()->user())
            ->withProperties(['tracking_no' => $complaint->tracking_no])
            ->log('Complaint deleted: ' . ($complaint->tracking_no ?? $complaint->id));

        $complaint->delete();

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Complaint deleted successfully']);
        }

        return redirect()->back()
            ->with('success', 'Complaint deleted successfully');
    }

    public function scrutiny(Request $request, Complaint $complaint, TrackingNumberGenerator $trackingGen)
    {
        $request->validate([
            'status' => 'required|string|in:complete,incomplete,invalid,irrelevant',
            'remarks' => 'nullable|string|max:2000',
        ]);

        $complaint->status = $request->status;
        $complaint->scrutiny_result = $request->status;

        if ($request->status === 'complete' && !$complaint->tracking_no) {
            $circle = $complaint->circle;
            $complaint->tracking_no = $trackingGen->generate($circle);
        }

        if ($request->has('remarks')) {
            $complaint->operator_remarks = $request->remarks;
        }

        $complaint->save();

        $notify = null;
        if ($complaint->tracking_no && !$complaint->registration_notified_at) {
            $notify = app(ComplainantNotifyService::class)->notifyRegistration($complaint);
            $complaint->refresh();
        }

        // Send status-update SMS to complainant once a tracking number exists.
        if ($complaint->tracking_no) {
            $this->sendComplainantSms(
                $complaint,
                SmsTemplates::complaintStatusUpdate($complaint, $request->status, 'en'),
                SmsTemplates::complaintStatusUpdate($complaint, $request->status, 'ur'),
                'complaint_status_update'
            );
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Complaint status updated to ' . $request->status,
                'data' => new ComplaintResource($complaint->fresh()),
                'complainant_notify' => $notify,
            ]);
        }

        return redirect()->route('all.complaints')
            ->with('success', 'Complaint status updated to ' . $request->status);
    }

    /**
     * Resend / open registration WhatsApp message for a tracked complaint.
     */
    public function notifyComplainant(Complaint $complaint, ComplainantNotifyService $notify)
    {
        $this->authorize('view', $complaint);
        abort_unless($complaint->tracking_no, 422, 'Tracking number not generated yet.');

        $payload = $notify->notifyRegistration($complaint);

        // Resend the registration SMS as well.
        $this->sendComplainantSms(
            $complaint,
            SmsTemplates::complaintRegistered($complaint, 'en'),
            SmsTemplates::complaintRegistered($complaint, 'ur'),
            'complaint_registered'
        );

        return response()->json([
            'message' => 'Registration message ready for complainant',
            'complainant_notify' => $payload,
            'data' => new ComplaintResource($complaint->fresh()),
        ]);
    }

    /**
     * Operator / circle-incharge one-click "direct assign":
     * create a verification and assign a verification officer to this complaint.
     */
    public function directAssign(Request $request, Complaint $complaint)
    {
        $data = $request->validate([
            'verification_officer_id' => 'required|integer|exists:users,id',
            'priority_type'           => 'required|in:normal,high,critical',
        ]);

        $verification = $this->assignVerificationOfficer(
            $complaint,
            (int) $data['verification_officer_id'],
            $data['priority_type']
        );

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Verification assigned to ' . ($verification->officer?->name ?? 'officer'),
                'data'    => $verification->load('officer', 'complaint'),
            ], 201);
        }

        return back()->with('success', 'Verification assigned to ' . ($verification->officer?->name ?? 'officer'));
    }

    /**
     * Send the complainant an SMS (bilingual) and log it against the complaint.
     */
    protected function sendComplainantSms(Complaint $complaint, string $en, string $ur, string $trigger): void
    {
        $phone = preg_replace('/\D+/', '', ($complaint->contact_country_code ?: '+92') . ($complaint->contact_no ?: ''));
        if (!$phone) {
            return;
        }

        $options = [
            'country_code'   => $complaint->contact_country_code ?: '+92',
            'recipient_type' => 'complainant',
            'subject_type'   => 'complaint',
            'subject_id'     => $complaint->id,
            'trigger'        => $trigger,
        ];

        app(SmsService::class)->sendBilingual($phone, $en, $ur, $options);
    }

    protected function assignVerificationOfficer(Complaint $complaint, int $officerId, string $priority = 'normal'): Verification
    {
        $priority = in_array($priority, ['normal', 'high', 'critical'], true) ? $priority : 'normal';
        $officer = User::find($officerId);

        // Keep complaint in VO's circle so Circle Incharge of that circle gets the queue
        if ($officer?->circle_id && (int) $complaint->circle_id !== (int) $officer->circle_id) {
            if (!$complaint->circle_id) {
                $complaint->update(['circle_id' => $officer->circle_id]);
            }
        } elseif (!$complaint->circle_id && Auth::user()?->circle_id) {
            $complaint->update(['circle_id' => Auth::user()->circle_id]);
        }

        $verification = DB::transaction(function () use ($complaint, $officerId, $priority) {
            if ($complaint->verification) {
                return $complaint->verification;
            }

            return Verification::create([
                'complaint_id'            => $complaint->id,
                'verification_officer_id' => $officerId,
                'priority_type'           => $priority,
                'status'                  => 'assigned',
                'assigned_by'             => Auth::id(),
                'assigned_at'             => now(),
            ]);
        });

        $verification->loadMissing('officer');
        $verification->officer?->notify(new VerificationAssignedNotification($verification));

        // SMS the assigned Verification Officer.
        if ($verification->officer) {
            app(SmsService::class)->sendToUser(
                $verification->officer,
                SmsTemplates::verificationAssigned($verification, $verification->officer, 'en'),
                SmsTemplates::verificationAssigned($verification, $verification->officer, 'ur'),
                [
                    'subject_type' => 'verification',
                    'subject_id'   => $verification->id,
                    'trigger'      => 'verification_assigned',
                ]
            );
        }

        return $verification;
    }
}
