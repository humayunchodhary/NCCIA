<?php

namespace App\Http\Controllers;

use App\Http\Resources\ComplaintResource;
use App\Models\Complaint;
use App\Models\VerificationReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AdpApplyController extends Controller
{
    public function extract(Request $request)
    {
        $this->authorize('create', Complaint::class);

        $request->validate([
            'file' => 'required|file|mimes:pdf|max:51200',
        ]);

        $base = config('services.adp.url');
        if (!$base) {
            return response()->json(['message' => 'ADP backend URL not configured (ADP_API_URL).'], 503);
        }

        $file = $request->file('file');
        $timeout = config('services.adp.timeout', 120);

        try {
            $response = Http::timeout($timeout)
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post("{$base}/api/v1/extract");
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'ADP backend unreachable. Start it on port 8001 or set ADP_API_URL.',
                'detail'  => $e->getMessage(),
            ], 502);
        }

        if (!$response->successful()) {
            $body = $response->json();
            return response()->json([
                'message' => $body['detail'] ?? $body['message'] ?? 'ADP extract failed',
            ], $response->status());
        }

        return response()->json($response->json());
    }

    public function apply(Request $request)
    {
        $this->authorize('create', Complaint::class);

        $request->validate([
            'data'         => 'required',
            'complaint_id' => 'nullable|integer|exists:complaints,id',
            'attachment'   => 'nullable|file|mimes:pdf|max:51200',
        ]);

        $data = $request->input('data');
        if (is_string($data)) {
            $data = json_decode($data, true);
        }
        if (!is_array($data)) {
            return response()->json(['message' => 'Invalid ADP data payload'], 422);
        }

        $user = $request->user()->load('roles');
        try {
            $payload = $this->mapAdpToComplaint($data, $user);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $complaintId = $request->input('complaint_id');
        if ($complaintId) {
            $complaint = Complaint::visibleTo($user)->findOrFail($complaintId);
            $this->authorize('update', $complaint);
            $complaint->update($payload);
        } else {
            $tracking = $data['complaint_reference']['tracking_no'] ?? null;
            $complaint = null;
            if ($tracking) {
                $complaint = Complaint::where('tracking_no', $tracking)->latest('id')->first();
            }
            if (!$complaint && !empty($payload['diary_no'])) {
                $complaint = Complaint::where('diary_no', $payload['diary_no'])->latest('id')->first();
            }
            if ($complaint) {
                $this->authorize('update', $complaint);
                $complaint->update($payload);
            } else {
                $payload['status'] = 'complete';
                $payload['scrutiny_result'] = 'complete';
                $payload['source'] = 'adp_import';
                $complaint = Complaint::create($payload);
            }
        }

        $this->upsertVerificationReport($complaint, $data, $user);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $dir = public_path('uploads/complaints');
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . Str::random(8) . '.pdf';
            $file->move($dir, $name);
            $complaint->update(['attachment' => 'uploads/complaints/' . $name]);
        }

        return response()->json([
            'message' => 'Complaint saved from ADP extract',
            'data'    => new ComplaintResource($complaint->fresh(['verification'])),
        ], $complaintId ? 200 : 201);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function mapAdpToComplaint(array $data, $user): array
    {
        $ref = $data['complaint_reference'] ?? [];
        $victim = $data['complainant_victim_info'] ?? [];
        $crime = $data['crime_details'] ?? [];
        $enquiry = $data['enquiry_and_case'] ?? [];

        $fullName = trim($victim['name'] ?? '');
        $fatherName = trim((string) ($victim['father_name'] ?? ''));

        $phone = preg_replace('/\D/', '', $victim['phone'] ?? '') ?? '';
        if (str_starts_with($phone, '92') && strlen($phone) > 10) {
            $phone = substr($phone, 2);
        }
        if (str_starts_with($phone, '0')) {
            $phone = substr($phone, 1);
        }
        $phone = substr($phone, 0, 10) ?: '3000000000';

        $whatsapp = preg_replace('/\D/', '', $victim['whatsapp'] ?? $victim['whatsapp_no'] ?? '') ?? '';
        if (str_starts_with($whatsapp, '92') && strlen($whatsapp) > 10) {
            $whatsapp = substr($whatsapp, 2);
        }
        if (str_starts_with($whatsapp, '0')) {
            $whatsapp = substr($whatsapp, 1);
        }
        $whatsapp = substr($whatsapp, 0, 10) ?: null;

        $cnic = $this->normalizeCnic($victim['cnic'] ?? '');
        if (!$cnic) {
            throw new \InvalidArgumentException('CNIC not found in ADP extract.');
        }
        $address = $victim['address'] ?? $victim['postal_address'] ?? 'Imported via ADP';
        $gender = strtolower(trim((string) ($victim['gender'] ?? '')));
        if ($gender && !in_array($gender, ['male', 'female', 'other'], true)) {
            $gender = null;
        }

        $platforms = $crime['platforms'] ?? $crime['platform'] ?? null;
        if (is_string($platforms) && $platforms !== '') {
            $platforms = array_values(array_filter(array_map('trim', preg_split('/[,;|]/', $platforms) ?: [])));
        }
        if (!is_array($platforms)) {
            $platforms = null;
        }

        $crimeMediums = $crime['crime_mediums'] ?? $crime['medium'] ?? null;
        if (is_string($crimeMediums) && $crimeMediums !== '') {
            $crimeMediums = array_values(array_filter(array_map('trim', preg_split('/[,;|]/', $crimeMediums) ?: [])));
        }
        if (!is_array($crimeMediums)) {
            $crimeMediums = null;
        }

        return array_filter([
            'complainant_name'     => $fullName ?: 'Unknown',
            'father_name'          => $fatherName ?: null,
            'cnic'                 => $cnic,
            'contact_no'           => $phone,
            'whatsapp_no'          => $whatsapp,
            'gender'               => $gender,
            'email'                => $victim['email'] ?? null,
            'contact_country_code' => '+92',
            'nationality'          => $victim['nationality'] ?? 'Pakistani',
            'passport_no'          => $victim['passport_no'] ?? null,
            'address'              => $address,
            'post_address'         => $victim['postal_address'] ?? $address,
            'district'             => $victim['district'] ?? $crime['city'] ?? null,
            'profession'           => $victim['occupation'] ?? null,
            'report_date'          => $this->parseDate($ref['registration_date'] ?? $ref['verification_date'] ?? null) ?? now()->toDateString(),
            'reporting_time'       => $ref['reporting_time'] ?? now()->format('H:i'),
            'diary_no'             => $enquiry['enquiry_no'] ?? $ref['tracking_no'] ?? 'ADP-' . now()->format('His'),
            'received_via'         => 'Postal Service',
            'received_from'        => 'General Public',
            'cmu'                  => 'CCRC',
            'priority_type'        => 'normal',
            'offence_type'         => $crime['category'] ?? 'Cyber Crime',
            'crime_mediums'        => $crimeMediums,
            'platforms'            => $platforms,
            'platform_profile_page'=> $crime['profile_page'] ?? $crime['platform_profile_page'] ?? null,
            'platform_username'    => $crime['username'] ?? $crime['platform_username'] ?? null,
            'platform_email_involved' => $crime['email_involved'] ?? $crime['platform_email_involved'] ?? null,
            'platform_mobile_involved'=> $crime['mobile_involved'] ?? $crime['platform_mobile_involved'] ?? null,
            'amount_involved'      => $this->parseAmount($crime['amount_involved'] ?? null),
            'bank_name_sender'     => $crime['bank_name_sender'] ?? $crime['sender_bank'] ?? null,
            'bank_name_receiver'   => $crime['bank_name_receiver'] ?? $crime['receiver_bank'] ?? null,
            'account_no_sender'    => $crime['account_no_sender'] ?? $crime['sender_account'] ?? null,
            'account_no_receiver'  => $crime['account_no_receiver'] ?? $crime['receiver_account'] ?? null,
            'transaction_date'     => $this->parseDate($crime['transaction_date'] ?? null),
            'occurrence_date'      => $this->parseDate($crime['occurrence_date'] ?? $ref['assignment_date'] ?? null) ?? now()->toDateString(),
            'description'          => $crime['description'] ?? $enquiry['cfr_summary'] ?? 'Imported via ADP',
            'operator_name'        => $user->name,
            'operator_designation' => $user->designation ?? ($user->roles->first()?->name ?? 'Operator'),
            'entry_time'           => now(),
            'operator_remarks'     => $ref['vo_remarks'] ?? 'ADP auto-import',
            'tracking_no'          => $ref['tracking_no'] ?? null,
            'user_id'              => $user->id,
            'operator_id'          => $user->id,
            'circle_id'            => $user->circle_id,
        ], fn ($v) => $v !== null && $v !== '');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function upsertVerificationReport(Complaint $complaint, array $data, $user): void
    {
        $ref = $data['complaint_reference'] ?? [];
        $victim = $data['complainant_victim_info'] ?? [];
        $crime = $data['crime_details'] ?? [];
        $enquiry = $data['enquiry_and_case'] ?? [];

        $reportData = [
            'complaint_id'       => $complaint->id,
            'tracking_no'        => $ref['tracking_no'] ?? $complaint->tracking_no ?? ('ADP-' . $complaint->id),
            'assignment_date'    => $this->parseDate($ref['assignment_date'] ?? null),
            'verification_date'  => $this->parseDate($ref['verification_date'] ?? null),
            'victim_name'        => $victim['name'] ?? $complaint->complainant_name,
            'victim_father_name' => $victim['father_name'] ?? null,
            'victim_occupation'  => $victim['occupation'] ?? $complaint->profession,
            'victim_gender'        => strtolower($victim['gender'] ?? 'male'),
            'victim_cnic'          => $this->normalizeCnic($victim['cnic'] ?? $complaint->cnic),
            'victim_country_code'  => '+92',
            'victim_phone'         => $victim['phone'] ?? null,
            'crime_category'       => $crime['category'] ?? $complaint->offence_type,
            'crime_description'    => $crime['description'] ?? $complaint->description,
            'city'                 => $crime['city'] ?? 'Unknown',
            'recommendation'       => 'enquiry_registration',
            'recommendation_short' => $enquiry['recommendation'] ?? null,
            'inquiry_no'           => $enquiry['enquiry_no'] ?? $complaint->diary_no,
            'created_by'           => $user->id,
        ];

        VerificationReport::updateOrCreate(
            ['complaint_id' => $complaint->id],
            array_filter($reportData, fn ($v) => $v !== null && $v !== '')
        );
    }

    private function normalizeCnic(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }
        $digits = preg_replace('/\D/', '', $raw);
        if (strlen($digits) !== 13) {
            return trim($raw) ?: null;
        }

        return substr($digits, 0, 5) . '-' . substr($digits, 5, 7) . '-' . substr($digits, 12, 1);
    }

    private function parseDate(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }
        $raw = trim($raw);
        foreach (['d-m-Y', 'd/m/Y', 'Y-m-d', 'd-m-y'] as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $raw);
            if ($dt) {
                return $dt->format('Y-m-d');
            }
        }

        return null;
    }

    private function parseAmount(?string $raw): ?float
    {
        if (!$raw) {
            return null;
        }
        $n = (float) preg_replace('/[^\d.]/', '', $raw);

        return $n > 0 ? $n : null;
    }
}
