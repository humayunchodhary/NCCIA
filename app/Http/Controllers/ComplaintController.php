<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\OffenceType;
use App\Http\Requests\StoreComplaintRequest;
use App\Http\Requests\UpdateComplaintRequest;
use App\Http\Resources\ComplaintResource;
use App\Services\TrackingNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    public function index()
    {
        $complaints = Complaint::visibleTo(request()->user())
            ->with(['enquiry', 'verification', 'caseFiles'])
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

        return new ComplaintResource($complaint->load(['enquiry', 'verification', 'caseFiles']));
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
}
