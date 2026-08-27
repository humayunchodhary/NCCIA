<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\EnquiryActivity;
use App\Models\EnquiryNotice;
use App\Models\ForensicRequest;
use App\Services\QrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentVerifyController extends Controller
{
    private const LABELS = [
        'complaint'         => 'Complaint Receipt',
        'complaint_report'  => 'Complaint Report',
        'enquiry'           => 'Enquiry',
        'notice'            => 'Summon / Notice',
        'cfr'               => 'Confidential Final Report',
        'forensic'          => 'Forensic Request',
        'raid'              => 'Raid Permission',
        'warrant'           => 'Search Warrant',
        'diary'             => 'Case Diary',
        'account'           => 'Account Opening Request',
        'scope'             => 'Forensic Scope Letter',
    ];

    public function __construct(private readonly QrService $qr)
    {
    }

    /**
     * Public page opened when a document QR is scanned.
     */
    public function show(string $type, string $id, string $token)
    {
        abort_unless($this->qr->checkToken($type, $id, $token), 404);
        abort_unless(isset(self::LABELS[$type]), 404);

        [$title, $rows] = $this->details($type, $id);

        return view('verify.document', [
            'title' => $title,
            'rows'  => $rows,
        ]);
    }

    /**
     * Authenticated helper so frontend prints encode the same signed payload.
     */
    public function qr(Request $request, string $type, string $id): JsonResponse
    {
        abort_unless(isset(self::LABELS[$type]), 404);

        try {
            [$title, $rows] = $this->details($type, $id);
            $fields = ['Type' => $title];
            foreach ($rows as $row) {
                $fields[$row['k']] = $row['v'];
            }

            $url = $this->qr->verifyUrl($type, $id);

            return response()->json([
                'url'     => $url,
                'payload' => $url,
                'caption' => $fields['No'] ?? ($fields['Enquiry No'] ?? ($fields['Complaint No'] ?? $title)),
                'title'   => $title,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'url'     => $this->qr->verifyUrl($type, $id),
                'payload' => $this->qr->verifyUrl($type, $id),
                'caption' => self::LABELS[$type] ?? $type,
                'title'   => self::LABELS[$type] ?? $type,
            ]);
        }
    }

    /**
     * @return array{0:string,1:list<array{k:string,v:string}>}
     */
    private function details(string $type, string $id): array
    {
        $title = self::LABELS[$type];

        return match ($type) {
            'complaint', 'complaint_report' => [$title, $this->complaintRows((int) $id)],
            'enquiry', 'cfr', 'raid', 'warrant', 'account', 'scope' => [$title, $this->enquiryRows((int) $id)],
            'diary' => [$title, $this->diaryRows((int) $id)],
            'notice' => [$title, $this->noticeRows((int) $id)],
            'forensic' => [$title, $this->forensicRows((int) $id)],
            default => abort(404),
        };
    }

    private function complaintRows(int $id): array
    {
        $c = Complaint::with('circle')->findOrFail($id);

        return [
            ['k' => 'Complaint No', 'v' => $c->tracking_no ?: ($c->slip_number ?: ('#' . $c->id))],
            ['k' => 'Complainant', 'v' => $c->complainant_name ?: '—'],
            ['k' => 'CNIC', 'v' => $this->maskCnic($c->cnic)],
            ['k' => 'Circle', 'v' => $c->circle?->name ?: '—'],
            ['k' => 'Offence', 'v' => $c->offence_type ?: '—'],
            ['k' => 'Report Date', 'v' => $c->report_date ? \Carbon\Carbon::parse($c->report_date)->format('d/m/Y') : '—'],
            ['k' => 'Status', 'v' => $this->statusLabel($c->final_status ?: $c->status)],
        ];
    }

    private function enquiryRows(int $id): array
    {
        $e = Enquiry::with(['complaint.circle', 'officer'])->findOrFail($id);
        $direct = is_array($e->direct_info) ? $e->direct_info : [];

        return [
            ['k' => 'Enquiry No', 'v' => $e->enquiry_number ?: ('ENQ-' . $e->id)],
            ['k' => 'Complaint No', 'v' => $e->complaint?->tracking_no ?: ($direct['reference_no'] ?? '—')],
            ['k' => 'Complainant', 'v' => $e->complaint?->complainant_name ?: ($direct['complainant_name'] ?? '—')],
            ['k' => 'Circle', 'v' => $e->complaint?->circle?->name ?: ($direct['circle_name'] ?? '—')],
            ['k' => 'Officer', 'v' => $e->officer?->name ?: '—'],
            ['k' => 'Status', 'v' => $this->statusLabel($e->status)],
            ['k' => 'Registered', 'v' => $e->reg_date ? \Carbon\Carbon::parse($e->reg_date)->format('d/m/Y') : ($e->created_at?->format('d/m/Y') ?: '—')],
        ];
    }

    private function diaryRows(int $id): array
    {
        $activity = EnquiryActivity::with('enquiry.complaint.circle')->find($id);
        if ($activity?->enquiry) {
            $rows = $this->enquiryRows((int) $activity->enquiry_id);
            array_unshift($rows, ['k' => 'Diary No', 'v' => $activity->diary_no ?: ('D-' . $activity->id)]);
            $rows[] = ['k' => 'Diary Date', 'v' => $activity->activity_date ? $activity->activity_date->format('d/m/Y') : '—'];

            return $rows;
        }

        return $this->enquiryRows($id);
    }

    private function noticeRows(int $id): array
    {
        $n = EnquiryNotice::with('enquiry.complaint.circle')->findOrFail($id);

        return [
            ['k' => 'Summon No', 'v' => $n->notice_number ?: ('N-' . $n->id)],
            ['k' => 'Receiver', 'v' => $n->receiver_name ?: '—'],
            ['k' => 'Enquiry No', 'v' => $n->enquiry?->enquiry_number ?: ('#' . $n->enquiry_id)],
            ['k' => 'Complaint No', 'v' => $n->enquiry?->complaint?->tracking_no ?: '—'],
            ['k' => 'Circle', 'v' => $n->enquiry?->complaint?->circle?->name ?: '—'],
            ['k' => 'Status', 'v' => $this->statusLabel($n->status)],
        ];
    }

    private function forensicRows(int $id): array
    {
        $f = ForensicRequest::with(['enquiry.complaint.circle', 'enquiry.officer'])->findOrFail($id);
        $e = $f->enquiry;
        $direct = is_array($e?->direct_info) ? $e->direct_info : [];

        return [
            ['k' => 'Request No', 'v' => $f->request_no ?: ('FR-' . $f->id)],
            ['k' => 'Report Code', 'v' => $f->report_code ?: '—'],
            ['k' => 'Enquiry No', 'v' => $e?->enquiry_number ?: ($e ? ('ENQ-' . $e->id) : '—')],
            ['k' => 'Complainant', 'v' => $e?->complaint?->complainant_name ?: ($direct['complainant_name'] ?? ($f->external_person_name ?: '—'))],
            ['k' => 'Circle', 'v' => $e?->complaint?->circle?->name ?: '—'],
            ['k' => 'Status', 'v' => $this->statusLabel($f->status)],
            ['k' => 'Priority', 'v' => $this->statusLabel($f->priority)],
        ];
    }

    private function maskCnic(?string $cnic): string
    {
        if (!$cnic) {
            return '—';
        }
        $digits = preg_replace('/\D/', '', $cnic);
        if (strlen($digits) >= 10) {
            return substr($digits, 0, 5) . '-*******-' . substr($digits, -1);
        }

        return $cnic;
    }

    private function statusLabel(?string $status): string
    {
        if (!$status) {
            return '—';
        }

        return ucwords(str_replace('_', ' ', $status));
    }
}
