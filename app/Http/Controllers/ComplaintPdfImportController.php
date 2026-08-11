<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessComplaintPdfImport;
use App\Models\ComplaintPdfImport;
use App\Services\ComplaintPdfImportService;
use Illuminate\Http\Request;

class ComplaintPdfImportController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplaintPdfImport::query()->with(['complaint', 'verificationReport', 'user'])
            ->latest('id');

        if ($batch = $request->query('batch_id')) {
            $query->where('batch_id', $batch);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(min(50, max(10, (int) $request->query('per_page', 20)))));
    }

    public function stats()
    {
        return response()->json([
            'total'      => ComplaintPdfImport::count(),
            'pending'    => ComplaintPdfImport::where('status', ComplaintPdfImport::STATUS_PENDING)->count(),
            'processing' => ComplaintPdfImport::where('status', ComplaintPdfImport::STATUS_PROCESSING)->count(),
            'extracted'  => ComplaintPdfImport::where('status', ComplaintPdfImport::STATUS_EXTRACTED)->count(),
            'imported'   => ComplaintPdfImport::where('status', ComplaintPdfImport::STATUS_IMPORTED)->count(),
            'failed'     => ComplaintPdfImport::where('status', ComplaintPdfImport::STATUS_FAILED)->count(),
        ]);
    }

    public function store(Request $request, ComplaintPdfImportService $service)
    {
        $request->validate([
            'files'      => 'required|array|min:1|max:100',
            'files.*'    => 'file|mimes:pdf|max:51200',
            'batch_id'   => 'nullable|string|max:64',
            'auto_apply' => 'nullable|boolean',
        ]);

        $autoApply = $request->boolean('auto_apply', true);
        $result = $service->storeUploads($request->file('files'), $request->user(), $request->input('batch_id'));

        foreach ($result['imports'] as $import) {
            ProcessComplaintPdfImport::dispatch($import->id, $request->user()->id, $autoApply);
        }

        return response()->json([
            'message'  => count($result['imports']) . ' PDF(s) queued for import.',
            'batch_id' => $result['batch_id'],
            'imports'  => $result['imports'],
        ], 202);
    }

    public function show(ComplaintPdfImport $complaintPdfImport)
    {
        return response()->json($complaintPdfImport->load(['complaint', 'verificationReport', 'user']));
    }

    public function extract(Request $request, ComplaintPdfImport $complaintPdfImport, ComplaintPdfImportService $service)
    {
        $complaintPdfImport = $service->process($complaintPdfImport);

        return response()->json([
            'message' => $complaintPdfImport->status === ComplaintPdfImport::STATUS_FAILED ? 'Extraction failed' : 'PDF extracted',
            'import'  => $complaintPdfImport,
        ], $complaintPdfImport->status === ComplaintPdfImport::STATUS_FAILED ? 422 : 200);
    }

    public function apply(Request $request, ComplaintPdfImport $complaintPdfImport, ComplaintPdfImportService $service)
    {
        $request->validate([
            'create_if_missing' => 'nullable|boolean',
        ]);

        $complaintPdfImport = $service->applyToSystem(
            $complaintPdfImport,
            $request->user(),
            $request->boolean('create_if_missing', true)
        );

        $ok = $complaintPdfImport->status === ComplaintPdfImport::STATUS_IMPORTED;

        return response()->json([
            'message' => $ok ? 'Imported into system successfully' : ($complaintPdfImport->error_message ?? 'Import failed'),
            'import'  => $complaintPdfImport->load(['complaint', 'verificationReport']),
        ], $ok ? 200 : 422);
    }

    public function preview(Request $request, ComplaintPdfImportService $service)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:51200',
        ]);

        $file = $request->file('file');
        $tmp = $file->store('imports/tmp', 'public');
        $absolute = storage_path('app/public/' . $tmp);

        $extract = app(\App\Services\ComplaintPdfExtractor::class)
            ->extract($absolute, $file->getClientOriginalName());

        @unlink($absolute);

        return response()->json([
            'extracted' => $extract['data'],
            'used_ocr'  => $extract['used_ocr'],
            'error'     => $extract['error'],
        ], $extract['ok'] ? 200 : 422);
    }
}
