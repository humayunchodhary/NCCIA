<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\ComplaintPdfImport;
use App\Models\Enquiry;
use App\Models\User;
use App\Models\VerificationReport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ComplaintPdfImportService
{
    public function __construct(
        private ComplaintPdfExtractor $extractor,
    ) {}

    public function storeUploads(array $files, User $user, ?string $batchId = null): array
    {
        $batchId = $batchId ?: (string) Str::uuid();
        $imports = [];

        foreach ($files as $file) {
            $original = $file->getClientOriginalName();
            $path = $file->storeAs(
                'imports/complaint-pdfs/' . $batchId,
                Str::slug(pathinfo($original, PATHINFO_FILENAME)) . '-' . Str::random(6) . '.pdf',
                'public'
            );

            $imports[] = ComplaintPdfImport::create([
                'user_id'           => $user->id,
                'batch_id'          => $batchId,
                'original_filename' => $original,
                'stored_path'       => $path,
                'inquiry_ref'       => $this->extractor->inquiryRefFromFilename($original),
                'status'            => ComplaintPdfImport::STATUS_PENDING,
            ]);
        }

        return ['batch_id' => $batchId, 'imports' => $imports];
    }

    public function process(ComplaintPdfImport $import): ComplaintPdfImport
    {
        $import->update(['status' => ComplaintPdfImport::STATUS_PROCESSING]);

        $absolute = Storage::disk('public')->path($import->stored_path);
        if (!is_file($absolute)) {
            return $this->fail($import, 'Stored PDF file not found.');
        }

        $extract = $this->extractor->extract($absolute, $import->original_filename);
        if (!$extract['ok'] || empty($extract['data'])) {
            return $this->fail($import, $extract['error'] ?? 'No data could be extracted from PDF.');
        }

        $data = $this->normalizeExtractedData($extract['data']);

        $import->update([
            'extracted_data' => $data,
            'page_count'     => $extract['page_count'],
            'used_ocr'       => $extract['used_ocr'],
            'inquiry_ref'    => $data['inquiry_no'] ?? $import->inquiry_ref,
            'status'         => ComplaintPdfImport::STATUS_EXTRACTED,
            'processed_at'   => now(),
        ]);

        return $import->fresh();
    }

    public function applyToSystem(ComplaintPdfImport $import, User $user, bool $createIfMissing = true): ComplaintPdfImport
    {
        if (!$import->extracted_data) {
            $import = $this->process($import);
        }

        if ($import->status === ComplaintPdfImport::STATUS_FAILED) {
            return $import;
        }

        $data = $this->normalizeExtractedData($import->extracted_data ?? []);
        if (empty($data)) {
            return $this->fail($import, 'Nothing to import.');
        }

        try {
            $attachmentPath = null;

            $result = DB::transaction(function () use ($import, $data, $user, $createIfMissing, &$attachmentPath) {
                $complaint = $this->findOrCreateComplaint($data, $user, $createIfMissing, $import);
                if (!$complaint) {
                    throw new \RuntimeException('Complaint not found and create_if_missing is disabled.');
                }

                $attachmentPath = $this->attachPdfToComplaint($complaint, $import);

                $report = $this->upsertVerificationReport($complaint, $data, $user, $import, $attachmentPath);

                $this->linkEnquiryInquiryNo($data, $report);

                return [
                    'complaint_id'           => $complaint->id,
                    'verification_report_id' => $report?->id,
                    'tracking_no'            => $complaint->tracking_no,
                    'inquiry_no'             => $data['inquiry_no'] ?? null,
                    'cnic'                   => $complaint->cnic,
                    'complainant_name'       => $complaint->complainant_name,
                    'attachment'             => $attachmentPath,
                ];
            });

            $import->update([
                'status'                 => ComplaintPdfImport::STATUS_IMPORTED,
                'complaint_id'           => $result['complaint_id'],
                'verification_report_id' => $result['verification_report_id'],
                'import_result'          => $result,
                'processed_at'           => now(),
                'error_message'          => null,
            ]);
        } catch (\Throwable $e) {
            return $this->fail($import, $e->getMessage());
        }

        return $import->fresh(['complaint', 'verificationReport']);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeExtractedData(array $data): array
    {
        if (!empty($data['victim_cnic'])) {
            $data['victim_cnic'] = $this->extractor->normalizeCnic((string) $data['victim_cnic']);
        }

        if (!empty($data['victim_phone'])) {
            $data['victim_phone'] = $this->formatPhoneDisplay((string) $data['victim_phone']);
        }

        if (!empty($data['victim_name']) && !empty($data['victim_father_name'])) {
            $data['complainant_full_name'] = trim($data['victim_name'] . ' S/O ' . $data['victim_father_name']);
        } else {
            $data['complainant_full_name'] = $data['victim_name'] ?? null;
        }

        if (empty($data['recommendation']) && !empty($data['recommendation_short'])) {
            $lower = strtolower((string) $data['recommendation_short']);
            if (str_contains($lower, 'register enq')) {
                $data['recommendation'] = 'enquiry_registration';
            }
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function findOrCreateComplaint(array $data, User $user, bool $createIfMissing, ComplaintPdfImport $import): ?Complaint
    {
        $complaint = null;

        if (!empty($data['tracking_no'])) {
            $complaint = Complaint::where('tracking_no', $data['tracking_no'])->first();
        }

        if (!$complaint && !empty($data['inquiry_no'])) {
            $report = VerificationReport::where('inquiry_no', $data['inquiry_no'])->first();
            if ($report?->complaint_id) {
                $complaint = Complaint::find($report->complaint_id);
            }
        }

        if (!$complaint && !empty($data['victim_cnic'])) {
            $complaint = Complaint::where('cnic', $data['victim_cnic'])->latest('id')->first();
        }

        if ($complaint) {
            $complaint->update($this->buildComplaintPayload($data, $user, $import, $complaint));

            return $complaint->fresh();
        }

        if (!$createIfMissing) {
            return null;
        }

        return Complaint::create($this->buildComplaintPayload($data, $user, $import));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function buildComplaintPayload(array $data, User $user, ComplaintPdfImport $import, ?Complaint $existing = null): array
    {
        $fullName = $data['complainant_full_name']
            ?? $data['victim_name']
            ?? ($existing?->complainant_name)
            ?? ('Imported ' . ($data['inquiry_no'] ?? pathinfo($import->original_filename, PATHINFO_FILENAME)));

        $address = $data['victim_address'] ?? $existing?->address ?? 'Imported from PDF';
        $description = trim(implode("\n\n", array_filter([
            $data['crime_category'] ?? null,
            $data['crime_description'] ?? null,
            !empty($data['city']) ? 'City: ' . $data['city'] : null,
            !empty($data['recommendation_full']) ? $data['recommendation_full'] : null,
        ]))) ?: ($existing?->description ?? 'Imported verification report');

        $payload = [
            'complainant_name'     => $fullName,
            'cnic'                 => $data['victim_cnic'] ?? $existing?->cnic ?? '00000-0000000-0',
            'contact_no'           => $this->contactDigits($data['victim_phone'] ?? $existing?->contact_no ?? '3000000000'),
            'contact_country_code' => '+92',
            'nationality'          => 'Pakistani',
            'address'              => $address,
            'post_address'         => $address,
            'profession'           => $data['victim_occupation'] ?? $existing?->profession,
            'report_date'          => $data['verification_date'] ?? $data['assignment_date'] ?? $existing?->report_date ?? now()->toDateString(),
            'diary_no'             => $data['inquiry_no'] ?? $data['tracking_no'] ?? $existing?->diary_no ?? pathinfo($import->original_filename, PATHINFO_FILENAME),
            'received_via'         => $existing?->received_via ?? 'Postal Service',
            'received_from'        => $existing?->received_from ?? 'General Public',
            'cmu'                  => $existing?->cmu ?? 'CCRC',
            'priority_type'        => $existing?->priority_type ?? 'normal',
            'offence_type'         => $data['crime_category'] ?? $existing?->offence_type ?? 'Cyber Crime',
            'amount_involved'      => $data['amount_involved'] ?? $existing?->amount_involved,
            'occurrence_date'      => $data['assignment_date'] ?? $data['verification_date'] ?? $existing?->occurrence_date ?? now()->toDateString(),
            'description'          => $description,
            'operator_name'        => $existing?->operator_name ?? $user->name,
            'operator_designation' => $existing?->operator_designation ?? ($user->designation ?? ($user->roles->first()?->name ?? 'Operator')),
            'entry_time'           => $existing?->entry_time ?? now(),
            'operator_remarks'     => 'Auto-imported from PDF: ' . $import->original_filename,
            'scrutiny_result'      => 'complete',
            'status'               => 'complete',
            'source'               => 'pdf_import',
            'user_id'              => $existing?->user_id ?? $user->id,
            'operator_id'          => $existing?->operator_id ?? $user->id,
            'circle_id'            => $existing?->circle_id ?? $user->circle_id,
        ];

        if (!empty($data['tracking_no'])) {
            $payload['tracking_no'] = $data['tracking_no'];
        } elseif (empty($existing?->tracking_no) && !empty($data['inquiry_no'])) {
            $payload['tracking_no'] = null;
        }

        return array_filter($payload, fn ($v) => $v !== null);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function upsertVerificationReport(
        Complaint $complaint,
        array $data,
        User $user,
        ComplaintPdfImport $import,
        ?string $attachmentPath
    ): ?VerificationReport {
        $trackingNo = $data['tracking_no'] ?? $complaint->tracking_no;
        if (!$trackingNo && empty($data['victim_name']) && empty($complaint->complainant_name)) {
            return null;
        }

        $fullName = $data['complainant_full_name'] ?? $data['victim_name'] ?? $complaint->complainant_name;

        $reportData = [
            'complaint_id'         => $complaint->id,
            'tracking_no'          => $trackingNo ?? ('IMPORT-' . $complaint->id),
            'assignment_date'      => $data['assignment_date'] ?? null,
            'verification_date'    => $data['verification_date'] ?? null,
            'victim_name'          => $fullName,
            'victim_father_name'   => $data['victim_father_name'] ?? null,
            'victim_occupation'    => $data['victim_occupation'] ?? $complaint->profession,
            'victim_gender'        => $data['victim_gender'] ?? null,
            'victim_cnic'          => $data['victim_cnic'] ?? $complaint->cnic,
            'victim_country_code'  => '+92',
            'victim_phone'         => $data['victim_phone'] ?? $this->formatPhoneDisplay($complaint->contact_no),
            'crime_category'       => $data['crime_category'] ?? $complaint->offence_type,
            'crime_description'    => $data['crime_description'] ?? $complaint->description,
            'city'                 => $data['city'] ?? 'Unknown',
            'accused_known'        => false,
            'recommendation'       => $data['recommendation'] ?? 'enquiry_registration',
            'recommendation_short' => is_string($data['recommendation_short'] ?? null)
                ? Str::limit($data['recommendation_short'], 500)
                : null,
            'recommendation_full'  => $data['recommendation_full'] ?? null,
            'inquiry_no'           => $data['inquiry_no'] ?? null,
            'created_by'           => $user->id,
        ];

        $existing = VerificationReport::where(function ($q) use ($complaint, $data) {
            $q->where('complaint_id', $complaint->id);
            if (!empty($data['inquiry_no'])) {
                $q->orWhere('inquiry_no', $data['inquiry_no']);
            }
        })->latest('id')->first();

        if ($attachmentPath) {
            $evidence = $existing?->evidence ?? [];
            $already = collect($evidence)->contains(fn ($e) => ($e['original_name'] ?? '') === $import->original_filename);
            if (!$already) {
                $evidence[] = [
                    'file'          => $attachmentPath,
                    'original_name' => $import->original_filename,
                    'description'   => 'Verification report PDF (auto-import)',
                ];
            }
            $reportData['evidence'] = $evidence;
        }

        if ($existing) {
            $existing->update(array_filter($reportData, fn ($v) => $v !== null && $v !== ''));

            return $existing->fresh();
        }

        return VerificationReport::create(array_filter($reportData, fn ($v) => $v !== null && $v !== ''));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function linkEnquiryInquiryNo(array $data, ?VerificationReport $report): void
    {
        if (!$report || empty($data['inquiry_no'])) {
            return;
        }

        Enquiry::where('complaint_id', $report->complaint_id)
            ->where(function ($q) use ($data) {
                $q->whereNull('enquiry_number')->orWhere('enquiry_number', '');
            })
            ->limit(1)
            ->update(['enquiry_number' => $data['inquiry_no']]);
    }

    private function attachPdfToComplaint(Complaint $complaint, ComplaintPdfImport $import): string
    {
        $source = Storage::disk('public')->path($import->stored_path);
        $destDir = public_path('uploads/complaints');
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        if ($complaint->attachment && is_file(public_path($complaint->attachment))) {
            @unlink(public_path($complaint->attachment));
        }

        $safeBase = Str::slug(pathinfo($import->original_filename, PATHINFO_FILENAME)) ?: 'import';
        $destName = $safeBase . '-' . Str::random(8) . '.pdf';
        $destRel = 'uploads/complaints/' . $destName;
        copy($source, public_path($destRel));
        $complaint->update(['attachment' => $destRel]);

        return $destRel;
    }

    private function contactDigits(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?? '';
        if (str_starts_with($digits, '92') && strlen($digits) > 10) {
            $digits = substr($digits, 2);
        }
        if (str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        return substr($digits, 0, 10) ?: '3000000000';
    }

    private function formatPhoneDisplay(string $phone): string
    {
        $digits = $this->contactDigits($phone);
        if (strlen($digits) === 10) {
            return '0' . $digits;
        }

        return $phone;
    }

    private function fail(ComplaintPdfImport $import, string $message): ComplaintPdfImport
    {
        $import->update([
            'status'        => ComplaintPdfImport::STATUS_FAILED,
            'error_message' => $message,
            'processed_at'  => now(),
        ]);

        return $import->fresh();
    }
}
