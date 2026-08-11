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
        $import->update([
            'status' => ComplaintPdfImport::STATUS_PROCESSING,
        ]);

        $absolute = Storage::disk('public')->path($import->stored_path);
        if (!is_file($absolute)) {
            return $this->fail($import, 'Stored PDF file not found.');
        }

        $extract = $this->extractor->extract($absolute, $import->original_filename);
        if (!$extract['ok'] || empty($extract['data'])) {
            return $this->fail($import, $extract['error'] ?? 'No data could be extracted from PDF.');
        }

        $data = $extract['data'];
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

        $data = $import->extracted_data ?? [];
        if (empty($data)) {
            return $this->fail($import, 'Nothing to import.');
        }

        try {
            $result = DB::transaction(function () use ($import, $data, $user, $createIfMissing) {
                $complaint = $this->findOrCreateComplaint($data, $user, $createIfMissing, $import);
                if (!$complaint) {
                    throw new \RuntimeException('Complaint not found and create_if_missing is disabled.');
                }

                $this->attachPdfToComplaint($complaint, $import);

                $report = $this->upsertVerificationReport($complaint, $data, $user, $import);

                $this->linkEnquiryInquiryNo($data, $report);

                return [
                    'complaint_id'           => $complaint->id,
                    'verification_report_id' => $report?->id,
                    'tracking_no'            => $complaint->tracking_no,
                    'inquiry_no'             => $data['inquiry_no'] ?? null,
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
     * @param array<string, mixed> $data
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
            $complaint = Complaint::where('cnic', $data['victim_cnic'])
                ->when(!empty($data['tracking_no']), fn ($q) => $q->orWhere('tracking_no', $data['tracking_no']))
                ->latest('id')
                ->first();
        }

        if ($complaint) {
            $this->updateComplaintFromExtract($complaint, $data);

            return $complaint;
        }

        if (!$createIfMissing) {
            return null;
        }

        return $this->createComplaintFromExtract($data, $user, $import);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createComplaintFromExtract(array $data, User $user, ComplaintPdfImport $import): Complaint
    {
        $payload = [
            'complainant_name'     => $data['victim_name'] ?? ('Imported ' . ($data['inquiry_no'] ?? $import->original_filename)),
            'cnic'                 => $data['victim_cnic'] ?? '00000-0000000-0',
            'contact_no'           => $this->contactDigits($data['victim_phone'] ?? '3000000000'),
            'contact_country_code' => '+92',
            'address'              => $data['victim_address'] ?? 'Imported from PDF',
            'profession'           => $data['victim_occupation'] ?? null,
            'report_date'          => $data['verification_date'] ?? now()->toDateString(),
            'diary_no'             => $data['inquiry_no'] ?? pathinfo($import->original_filename, PATHINFO_FILENAME),
            'received_via'         => 'Postal Service',
            'received_from'        => 'General Public',
            'cmu'                  => 'CCRC',
            'priority_type'        => 'normal',
            'offence_type'         => $data['crime_category'] ?? 'Cyber Crime',
            'amount_involved'      => $data['amount_involved'] ?? null,
            'occurrence_date'      => $data['verification_date'] ?? now()->toDateString(),
            'description'          => $data['crime_description'] ?? ($data['crime_category'] ?? 'Imported verification report'),
            'operator_name'        => $user->name,
            'operator_designation' => $user->designation ?? ($user->roles->first()?->name ?? 'Operator'),
            'entry_time'           => now(),
            'operator_remarks'     => 'Auto-imported from PDF: ' . $import->original_filename,
            'scrutiny_result'      => 'complete',
            'status'               => 'complete',
            'source'               => 'pdf_import',
            'user_id'              => $user->id,
            'operator_id'          => $user->id,
            'circle_id'            => $user->circle_id,
        ];

        if (!empty($data['tracking_no'])) {
            $payload['tracking_no'] = $data['tracking_no'];
        }

        return Complaint::create($payload);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateComplaintFromExtract(Complaint $complaint, array $data): void
    {
        $updates = array_filter([
            'complainant_name' => $data['victim_name'] ?? null,
            'cnic'             => $data['victim_cnic'] ?? null,
            'contact_no'       => isset($data['victim_phone']) ? $this->contactDigits($data['victim_phone']) : null,
            'address'          => $data['victim_address'] ?? null,
            'profession'       => $data['victim_occupation'] ?? null,
            'offence_type'     => $data['crime_category'] ?? null,
            'amount_involved'  => $data['amount_involved'] ?? null,
            'description'      => $data['crime_description'] ?? null,
        ], fn ($v) => $v !== null && $v !== '');

        if (!empty($data['tracking_no']) && empty($complaint->tracking_no)) {
            $updates['tracking_no'] = $data['tracking_no'];
            $updates['status'] = 'complete';
            $updates['scrutiny_result'] = 'complete';
        }

        if ($updates) {
            $complaint->update($updates);
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function upsertVerificationReport(Complaint $complaint, array $data, User $user, ComplaintPdfImport $import): ?VerificationReport
    {
        $trackingNo = $data['tracking_no'] ?? $complaint->tracking_no;
        if (!$trackingNo && empty($data['victim_name'])) {
            return null;
        }

        $reportData = array_filter([
            'complaint_id'         => $complaint->id,
            'tracking_no'          => $trackingNo ?? ('IMPORT-' . $complaint->id),
            'assignment_date'      => $data['assignment_date'] ?? null,
            'verification_date'    => $data['verification_date'] ?? null,
            'victim_name'          => $data['victim_name'] ?? $complaint->complainant_name,
            'victim_father_name'   => $data['victim_father_name'] ?? null,
            'victim_occupation'    => $data['victim_occupation'] ?? $complaint->profession,
            'victim_gender'        => $data['victim_gender'] ?? null,
            'victim_cnic'          => $data['victim_cnic'] ?? $complaint->cnic,
            'victim_country_code'  => '+92',
            'victim_phone'         => $data['victim_phone'] ?? $complaint->contact_no,
            'crime_category'       => $data['crime_category'] ?? $complaint->offence_type,
            'crime_description'    => $data['crime_description'] ?? $complaint->description,
            'city'                 => $data['city'] ?? 'Unknown',
            'accused_known'        => false,
            'recommendation'       => $data['recommendation'] ?? 'enquiry_registration',
            'recommendation_short' => $data['recommendation_short'] ?? null,
            'recommendation_full'  => $data['recommendation_full'] ?? null,
            'inquiry_no'           => $data['inquiry_no'] ?? null,
            'created_by'           => $user->id,
        ], fn ($v) => $v !== null && $v !== '');

        $existing = VerificationReport::where('complaint_id', $complaint->id)
            ->when(!empty($data['inquiry_no']), fn ($q) => $q->orWhere('inquiry_no', $data['inquiry_no']))
            ->latest('id')
            ->first();

        if ($existing) {
            $existing->update($reportData);

            return $existing->fresh();
        }

        return VerificationReport::create($reportData);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function linkEnquiryInquiryNo(array $data, ?VerificationReport $report): void
    {
        if (!$report || empty($data['inquiry_no'])) {
            return;
        }

        Enquiry::whereNull('enquiry_number')
            ->where('complaint_id', $report->complaint_id)
            ->limit(1)
            ->update(['enquiry_number' => $data['inquiry_no']]);
    }

    private function attachPdfToComplaint(Complaint $complaint, ComplaintPdfImport $import): void
    {
        if ($complaint->attachment) {
            return;
        }

        $source = Storage::disk('public')->path($import->stored_path);
        $destDir = public_path('uploads/complaints');
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        $destName = Str::random(24) . '.pdf';
        $destRel = 'uploads/complaints/' . $destName;
        copy($source, public_path($destRel));
        $complaint->update(['attachment' => $destRel]);
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
