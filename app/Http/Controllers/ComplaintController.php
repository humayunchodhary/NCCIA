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
use App\Services\PrintService;
use App\Services\TrackingNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ComplaintController extends Controller
{
    /**
     * Move an uploaded complaint attachment into public/uploads.
     */
    protected function uploadAttachment(Request $request, ?Complaint $complaint = null): ?string
    {
        if (!$request->hasFile('attachment')) {
            return $complaint?->attachment;
        }

        $file = $request->file('attachment');
        $name = 'complaints/' . Str::random(24) . '.' . $file->getClientOriginalExtension() ?: 'file';
        $file->move(public_path('uploads'), $name);

        if ($complaint && $complaint->attachment && is_file(public_path($complaint->attachment))) {
            @unlink(public_path($complaint->attachment));
        }

        return 'uploads/' . $name;
    }

    public function index()
    {
        $complaints = Complaint::visibleTo(request()->user())
            ->with(['enquiry', 'verification', 'caseFiles', 'circle'])
            ->latest()
            ->paginate(15);

        if (request()->expectsJson()) {
            return ComplaintResource::collection($complaints);
        }

        return view('pages.all-complaints', compact('complaints'));
    }

    public function create()
    {
        $offenceTypes = OffenceType::orderBy('group')->orderBy('name')->get();
        return view('pages.newcomplaint', compact('offenceTypes'));
    }

    public function store(StoreComplaintRequest $request)
    {
        $data = $request->validated();
        $data['laws'] = $request->has('laws') ? $request->laws : null;
        $data['evidence'] = $request->has('evidence') ? $request->evidence : null;
        $data['user_id'] = Auth::id();
        $data['attachment'] = $this->uploadAttachment($request);

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

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Complaint registered successfully' . ($complaint->tracking_no ? ' — ' . $complaint->tracking_no : ''),
                'data' => new ComplaintResource($complaint),
            ], 201);
        }

        return redirect()->route('dashboard')
            ->with('success', 'Complaint registered successfully — ' . ($complaint->tracking_no ?? 'N/A'));
    }

    public function show(Complaint $complaint)
    {
        abort_unless(
            Complaint::visibleTo(request()->user())->whereKey($complaint->id)->exists(),
            404
        );

        return new ComplaintResource($complaint->load(['enquiry', 'verification', 'caseFiles', 'circle']));
    }

    public function edit(Complaint $complaint)
    {
        $offenceTypes = OffenceType::orderBy('group')->orderBy('name')->get();
        return view('pages.edit-complaint', compact('complaint', 'offenceTypes'));
    }

    public function update(UpdateComplaintRequest $request, Complaint $complaint)
    {
        $data = $request->validated();
        $data['laws']     = $request->has('laws') ? $request->laws : $complaint->laws;
        $data['evidence'] = $request->has('evidence') ? $request->evidence : $complaint->evidence;
        $data['attachment'] = $request->hasFile('attachment') ? $this->uploadAttachment($request, $complaint) : ($request->has('attachment') ? $request->input('attachment') : $complaint->attachment);

        $scrutinyResult = $data['scrutiny_result'] ?? $complaint->scrutiny_result;

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

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Complaint updated successfully',
                'data'    => new ComplaintResource($complaint),
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

    public function destroy(Complaint $complaint)
    {
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

        if ($request->status === 'complete') {
            $circle = $complaint->circle;
            $complaint->tracking_no = $trackingGen->generate($circle);
        }

        if ($request->has('remarks')) {
            $complaint->operator_remarks = $request->remarks;
        }

        $complaint->save();

        return redirect()->route('all.complaints')
            ->with('success', 'Complaint status updated to ' . $request->status);
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

        $verification = DB::transaction(function () use ($complaint, $data) {
            return Verification::create([
                'complaint_id'            => $complaint->id,
                'verification_officer_id' => $data['verification_officer_id'],
                'priority_type'           => $data['priority_type'],
                'status'                  => 'assigned',
                'assigned_by'             => Auth::id(),
                'assigned_at'             => now(),
            ]);
        });

        $verification->officer?->notify(new VerificationAssignedNotification($verification));

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Verification assigned to ' . ($verification->officer?->name ?? 'officer'),
                'data'    => $verification->load('officer', 'complaint'),
            ], 201);
        }

        return back()->with('success', 'Verification assigned to ' . ($verification->officer?->name ?? 'officer'));
    }
}
