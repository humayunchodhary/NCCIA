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
        @set_time_limit(300);

        $request->validate([
            'files'      => 'required|array|min:1|max:100',
            'files.*'    => 'file|mimes:pdf|max:51200',
            'batch_id'   => 'nullable|string|max:64',
            'auto_apply' => 'nullable|boolean',
            'sync'       => 'nullable|boolean',
            'ocr_texts'  => 'nullable|array',
            'ocr_texts.*'=> 'nullable|string|max:500000',
        ]);

        $result = $service->storeUploads($request->file('files'), $request->user(), $request->input('batch_id'));
        $ocrTexts = $request->input('ocr_texts', []);
        $autoApply = $request->boolean('auto_apply', false);
        $runServerExtract = $request->boolean('sync', false) && $this->shouldProcessSync();

        $processed = [];
        foreach ($result['imports'] as $import) {
            $ocrText = $ocrTexts[$import->original_filename] ?? null;

            if ($ocrText && trim($ocrText) !== '') {
                $import = $service->process($import, $ocrText);
                if ($autoApply && $import->status === ComplaintPdfImport::STATUS_EXTRACTED) {
                    $import = $service->applyToSystem($import, $request->user(), true);
                }
                $processed[] = $import->load(['complaint', 'verificationReport']);
            } elseif ($runServerExtract) {
                $processed[] = $this->runImportJob($import->id, $request->user()->id, $autoApply, true);
            } else {
                $processed[] = $import->load(['complaint', 'verificationReport']);
            }
        }

        $allDone = collect($processed)->every(fn ($i) => in_array($i->status, [
            ComplaintPdfImport::STATUS_IMPORTED,
            ComplaintPdfImport::STATUS_EXTRACTED,
            ComplaintPdfImport::STATUS_FAILED,
        ], true));

        return response()->json([
            'message'  => $allDone
                ? count($processed) . ' PDF(s) processed.'
                : count($processed) . ' PDF(s) uploaded — call /process with browser OCR text.',
            'batch_id' => $result['batch_id'],
            'imports'  => $processed,
        ], 200);
    }

    public function process(Request $request, ComplaintPdfImport $complaintPdfImport, ComplaintPdfImportService $service)
    {
        @set_time_limit(300);

        $request->validate([
            'auto_apply' => 'nullable|boolean',
            'ocr_text'   => 'required|string|min:20|max:500000',
        ]);

        $import = $service->process($complaintPdfImport, $request->input('ocr_text'));

        if ($request->boolean('auto_apply', true) && $import->status === ComplaintPdfImport::STATUS_EXTRACTED) {
            $import = $service->applyToSystem($import, $request->user(), true);
        }

        $ok = in_array($import->status, [
            ComplaintPdfImport::STATUS_IMPORTED,
            ComplaintPdfImport::STATUS_EXTRACTED,
        ], true);

        return response()->json([
            'message' => $ok
                ? ($import->status === ComplaintPdfImport::STATUS_IMPORTED ? 'Imported successfully' : 'Extracted — review and apply')
                : ($import->error_message ?? 'Processing failed'),
            'import'  => $import->load(['complaint', 'verificationReport']),
        ], $ok ? 200 : 422);
    }

    private function shouldProcessSync(): bool
    {
        if (env('PDF_IMPORT_SYNC') !== null) {
            return filter_var(env('PDF_IMPORT_SYNC'), FILTER_VALIDATE_BOOL);
        }

        // Default: sync on web uploads (shared hosting usually has no queue worker)
        return true;
    }

    private function runImportJob(int $importId, int $userId, bool $autoApply, bool $sync): ComplaintPdfImport
    {
        if ($sync) {
            $job = new ProcessComplaintPdfImport($importId, $userId, $autoApply);
            app()->call([$job, 'handle']);

            return ComplaintPdfImport::with(['complaint', 'verificationReport'])->findOrFail($importId);
        }

        ProcessComplaintPdfImport::dispatch($importId, $userId, $autoApply);

        return ComplaintPdfImport::findOrFail($importId);
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

    public function preview(Request $request)
    {
        $request->validate([
            'file'      => 'nullable|file|mimes:pdf|max:51200',
            'ocr_text'  => 'nullable|string|max:500000',
            'filename'  => 'nullable|string|max:255',
        ]);

        $extractor = app(\App\Services\ComplaintPdfExtractor::class);

        if ($request->has('ocr_text')) {
            $ocrText = trim((string) $request->input('ocr_text', ''));
            $filename = $request->input('filename', 'preview.pdf');

            if ($ocrText === '') {
                return response()->json([
                    'extracted'  => [],
                    'fields_ok'  => false,
                    'used_ocr'   => true,
                    'error'      => 'OCR returned empty text — try Re-run OCR',
                ]);
            }

            $data = $extractor->parseVerificationReportText($ocrText, $filename);
            $data['used_ocr'] = true;
            $fieldsOk = $extractor->hasMinimumFields($data);

            return response()->json([
                'extracted'  => $data,
                'fields_ok'  => $fieldsOk,
                'used_ocr'   => true,
                'error'      => $fieldsOk ? null : 'CNIC/name not detected — try Re-run OCR or check PDF scan quality',
            ]);
        }

        $request->validate(['file' => 'required|file|mimes:pdf|max:51200']);

        $file = $request->file('file');
        $tmp = $file->store('imports/tmp', 'public');
        $absolute = storage_path('app/public/' . $tmp);

        $extract = $extractor->extract($absolute, $file->getClientOriginalName());

        @unlink($absolute);

        return response()->json([
            'extracted' => $extract['data'],
            'used_ocr'  => $extract['used_ocr'],
            'error'     => $extract['error'],
        ], $extract['ok'] ? 200 : 422);
    }
}
