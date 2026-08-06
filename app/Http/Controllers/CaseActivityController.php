<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\CaseActivity;
use Illuminate\Http\Request;

class CaseActivityController extends Controller
{
    public function index(CaseFile $caseFile)
    {
        return response()->json(
            $caseFile->activities()->with('creator')->latest()->get()
        );
    }

    public function store(Request $request, CaseFile $caseFile)
    {
        $data = $request->validate([
            'type'          => 'required|string|max:30',
            'description'   => 'required|string',
            'activity_date' => 'required|date',
            'attachment'    => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('case-attachments');
        }

        $activity = $caseFile->activities()->create([
            'type'           => $data['type'],
            'description'    => $data['description'],
            'activity_date'  => $data['activity_date'],
            'attachment_path' => $path,
            'created_by'     => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Activity added',
            'data'    => $activity->load('creator'),
        ], 201);
    }
}
