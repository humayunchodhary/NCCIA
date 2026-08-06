<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use App\Models\EnquiryActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EnquiryActivityController extends Controller
{
    public function index(Enquiry $enquiry)
    {
        return response()->json($enquiry->activities()->with('creator')->latest()->get());
    }

    public function store(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'type'          => 'required|string|max:30',
            'description'   => 'required|string',
            'activity_date' => 'required|date',
            'attachment'    => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('enquiry-attachments');
        }

        $activity = $enquiry->activities()->create([
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
