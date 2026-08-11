<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\EnquiryActivity;
use App\Models\EnquiryNotice;
use Illuminate\Support\Facades\URL;

class PrintService
{
    public function __construct(private readonly QrService $qr)
    {
    }

    /**
     * 80mm thermal complaint slip with QR verification.
     */
    public function complaintSlip(Complaint $complaint): string
    {
        $complaint->loadMissing('circle');

        $number   = $complaint->tracking_no ?: ($complaint->slip_number ?: ('#' . $complaint->id));
        $token    = hash_hmac('sha256', 'complaint:' . $complaint->id, (string) config('app.key'));
        $verifyUrl = URL::to('/verify/complaint/' . $complaint->id . '/' . substr($token, 0, 32));
        $qr       = $this->qr->svgDataUri($verifyUrl);

        $circle   = e($complaint->circle?->name ?? '—');
        $name     = e($complaint->complainant_name ?: '—');
        $cnic     = e($complaint->cnic ?: '—');
        $phone    = trim(($complaint->contact_country_code ? '+' . ltrim((string) $complaint->contact_country_code, '+') . ' ' : '') . ($complaint->contact_no ?? ''));
        $phone    = e($phone !== '' ? $phone : '—');
        $date     = $complaint->report_date ? \Illuminate\Support\Carbon::parse($complaint->report_date)->format('d/m/Y') : '—';
        $time     = $complaint->entry_time ? \Illuminate\Support\Carbon::parse($complaint->entry_time)->format('h:i A') : '—';
        $address  = e($complaint->address ?: '—');
        $offence  = e($complaint->offence_type ?? '—');
        $source   = e($complaint->source ? ucfirst(str_replace('_', ' ', $complaint->source)) : '—');
        $operator = e($complaint->operator_name ?: '—');
        $issuedAt = now()->format('d/m/Y h:i A');
        $logo     = url('images/NCCIA.webp');
        $numberE  = e($number);

        return <<<HTML
        <div class="slip">
          <div class="head">
            <img src="{$logo}" alt="NCCIA" class="logo" />
            <div class="org">NATIONAL COMPLIANCE &amp;<br/>INTEGRITY AUTHORITY</div>
            <div class="org-ur">قومی تعمیل و دیانت داری اتھارٹی</div>
            <div class="tag">COMPLAINT RECEIPT</div>
          </div>

          <div class="num-box">
            <div class="num-label">Complaint No.</div>
            <div class="num-val">{$numberE}</div>
          </div>

          <table class="kv">
            <tr><td class="k">Complainant</td><td class="v">{$name}</td></tr>
            <tr><td class="k">CNIC</td><td class="v">{$cnic}</td></tr>
            <tr><td class="k">Contact</td><td class="v">{$phone}</td></tr>
            <tr><td class="k">Circle</td><td class="v">{$circle}</td></tr>
            <tr><td class="k">Report Date</td><td class="v">{$date}</td></tr>
            <tr><td class="k">Report Time</td><td class="v">{$time}</td></tr>
            <tr><td class="k">Source</td><td class="v">{$source}</td></tr>
            <tr><td class="k">Offence</td><td class="v">{$offence}</td></tr>
            <tr><td class="k">Address</td><td class="v">{$address}</td></tr>
          </table>

          <div class="note">
            Please keep this slip for future reference.
            Quote the Complaint No. for all follow-ups.
          </div>

          <table class="sign-row">
            <tr>
              <td class="sign">
                <div class="sign-line"></div>
                <div class="small">Operator / Desk</div>
                <div class="tiny">{$operator}</div>
              </td>
              <td class="sign">
                <div class="sign-line"></div>
                <div class="small">Complainant</div>
              </td>
            </tr>
          </table>

          <div class="qr-block">
            <img src="{$qr}" alt="Verify QR" class="qr" />
            <div class="small">Scan to verify this receipt</div>
            <div class="tiny muted">{$verifyUrl}</div>
          </div>

          <div class="foot">
            <div class="tiny">Issued: {$issuedAt}</div>
            <div class="tiny">NCCIA — Serving the Nation</div>
          </div>
        </div>
        HTML;
    }

    public function slipPrintDocument(Complaint $complaint): string
    {
        return $this->document(
            $this->complaintSlip($complaint),
            '@page { size: 80mm auto; margin: 2mm; }
             body { margin:0; background:#fff; }
             .slip { width: 76mm; font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 11px; color:#111; }
             .head { text-align:center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
             .logo { width:52px; height:52px; object-fit:contain; }
             .org { font-weight:800; font-size:11px; line-height:1.25; margin-top:3px; letter-spacing:0.2px; }
             .org-ur { font-size:11px; font-weight:700; margin-top:2px; }
             .tag { display:inline-block; margin-top:5px; padding:2px 8px; border:1.5px solid #000; font-weight:800; font-size:10px; letter-spacing:1.2px; }
             .num-box { text-align:center; border:1.5px dashed #000; padding:6px 4px; margin:8px 0; }
             .num-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; }
             .num-val { font-size:16px; font-weight:800; letter-spacing:0.5px; margin-top:2px; }
             .kv { width:100%; border-collapse:collapse; margin:2px 0 6px; }
             .kv td { padding:3px 0; vertical-align:top; border-bottom:1px dotted #bbb; }
             .kv tr:last-child td { border-bottom:none; }
             .k { width:78px; font-weight:700; color:#222; }
             .v { word-break:break-word; }
             .note { font-size:9.5px; line-height:1.35; text-align:center; border:1px solid #000; padding:5px 4px; margin:6px 0; }
             .sign-row { width:100%; border-collapse:collapse; margin:10px 0 6px; }
             .sign { width:50%; text-align:center; vertical-align:top; padding:0 3px; }
             .sign-line { border-top:1px solid #000; margin:18px 0 3px; }
             .qr-block { text-align:center; border-top:1px dashed #000; padding-top:6px; margin-top:4px; }
             .qr { width:92px; height:92px; }
             .foot { text-align:center; margin-top:4px; border-top:1px solid #000; padding-top:4px; }
             .small { font-size:9.5px; font-weight:700; }
             .tiny { font-size:8.5px; margin-top:1px; }
             .muted { color:#444; word-break:break-all; line-height:1.2; }'
        );
    }

    /**
     * Printable notice document with QR verification code at the bottom.
     */
    public function noticeDocument(EnquiryNotice $notice): string
    {
        $notice->loadMissing('enquiry.complaint.circle');

        if (!$notice->verification_token) {
            $notice->verification_token = \Illuminate\Support\Str::random(32);
            $notice->save();
        }

        $verifyUrl = URL::to('/verify/notice/' . $notice->verification_token);
        $qr        = $this->qr->svgDataUri($verifyUrl);

        $enquiry   = $notice->enquiry;
        $complaint = $enquiry?->complaint;
        $circle    = $complaint?->circle?->name ?? '—';
        $logo      = url('images/NCCIA.webp');

        $via       = $notice->notice_via ? ucfirst(str_replace('_', ' ', $notice->notice_via)) : '—';
        $person    = $notice->person_type ? ucfirst($notice->person_type) : '—';
        $type      = $notice->notice_type ?: 'Notice';

        $enquiryNo = $enquiry?->enquiry_number ?: ('#' . $enquiry?->id);
        $tracking  = $complaint?->tracking_no ?? '—';
        $receiver  = e($notice->receiver_name);
        $addr      = e($notice->address ?? '—');
        $phone     = e($notice->phone ?? '—');
        $desc      = e($notice->description ?? '');
        $date      = $notice->notice_date ? $notice->notice_date->format('d/m/Y') : '—';
        $number    = e($notice->notice_number ?: ('N-' . $notice->id));

        return <<<HTML
        <div class="notice">
          <div class="head">
            <div class="center">
              <img src="{$logo}" alt="NCCIA" class="logo" />
              <div class="org">National Compliance &amp; Integrity Authority (NCCIA)</div>
              <div class="addr">Islamabad — Pakistan &nbsp;|&nbsp; Circle: {$circle}</div>
            </div>
            <hr/>
            <div class="center title">{$type}</div>
          </div>

          <div class="meta">
            <div class="mrow"><span class="k">Notice No:</span><span>{$number}</span></div>
            <div class="mrow"><span class="k">Date:</span><span>{$date}</span></div>
            <div class="mrow"><span class="k">Mode:</span><span>{$via}</span></div>
            <div class="mrow"><span class="k">Person Type:</span><span>{$person}</span></div>
            <div class="mrow"><span class="k">Enquiry:</span><span>{$enquiryNo}</span></div>
            <div class="mrow"><span class="k">Complaint:</span><span>{$tracking}</span></div>
          </div>

          <div class="to">
            <div class="mrow"><span class="k">To:</span><span><strong>{$receiver}</strong></span></div>
            <div class="mrow"><span class="k">Address:</span><span>{$addr}</span></div>
            <div class="mrow"><span class="k">Phone:</span><span>{$phone}</span></div>
          </div>

          <div class="body">
            <p>You are hereby directed to appear before the undersigned on the date specified
            in connection with the enquiry being conducted by NCCIA. Please bring all relevant
            documents with you. Failure to appear may result in further action as per law.</p>
            <p class="desc">{$desc}</p>
          </div>

          <div class="sign">
            <div class="center small">Signature &amp; Stamp</div>
          </div>

          <hr/>
          <div class="foot">
            <div class="qrbox">
              <img src="{$qr}" alt="Verify QR" class="qr" />
              <div class="small center">Scan to verify this notice</div>
            </div>
            <div class="small center verify">{$verifyUrl}</div>
          </div>
        </div>
        HTML;
    }

    public function noticePrintDocument(EnquiryNotice $notice): string
    {
        return $this->document(
            $this->noticeDocument($notice),
            '@page { size: A4; margin: 12mm; }
             body { margin:0; font-family: Arial, Helvetica, sans-serif; color:#000; }
             .notice { max-width: 170mm; margin: 0 auto; font-size: 13px; line-height:1.5; }
             .center { text-align:center; }
             .head .logo { width:70px; height:70px; object-fit:contain; }
             .head .org { font-size:16px; font-weight:700; margin-top:2px; }
             .head .addr { font-size:11px; color:#333; margin-top:2px; }
             .head .title { font-size:17px; font-weight:800; letter-spacing:1px; margin-top:4px; }
             .meta { margin-top:8px; }
             .mrow { margin:2px 0; }
             .mrow .k { display:inline-block; width:110px; font-weight:600; }
             .to { margin-top:8px; border:1px solid #000; padding:8px; }
             .body { margin-top:8px; text-align:justify; }
             .body .desc { white-space:pre-wrap; }
             .sign { margin-top:26px; border-top:1px solid #000; width:140px; text-align:center; padding-top:4px; }
             .foot { margin-top:14px; text-align:center; }
             .qr { width:110px; height:110px; }
             .verify { font-size:10px; color:#333; word-break:break-all; }
             hr { border:none; border-top:1px solid #000; margin:8px 0; }'
        );
    }

    public function diaryPrintDocument(Enquiry $enquiry, EnquiryActivity $activity): string
    {
        $enquiry->loadMissing('complaint.circle');
        $logo = url('images/NCCIA.webp');
        $enquiryNo = e($enquiry->enquiry_number ?: ('#' . $enquiry->id));
        $tracking = e($enquiry->complaint?->tracking_no ?? '—');
        $circle = e($enquiry->complaint?->circle?->name ?? '—');
        $diaryNo = e($activity->diary_no ?: ('D-' . $activity->id));
        $date = $activity->activity_date ? $activity->activity_date->format('d/m/Y') : '—';
        $desc = e($activity->description ?? '');
        $issuedAt = now()->format('d/m/Y h:i A');

        $body = <<<HTML
        <div class="diary">
          <div class="center">
            <img src="{$logo}" alt="NCCIA" class="logo" />
            <div class="org">National Compliance &amp; Integrity Authority (NCCIA)</div>
            <div class="tag">CASE DIARY</div>
          </div>
          <hr/>
          <div class="mrow"><span class="k">Diary No:</span><span>{$diaryNo}</span></div>
          <div class="mrow"><span class="k">Diary Date:</span><span>{$date}</span></div>
          <div class="mrow"><span class="k">Enquiry No:</span><span>{$enquiryNo}</span></div>
          <div class="mrow"><span class="k">Complaint No:</span><span>{$tracking}</span></div>
          <div class="mrow"><span class="k">Circle:</span><span>{$circle}</span></div>
          <hr/>
          <div class="body"><strong>Description</strong><p class="desc">{$desc}</p></div>
          <div class="sign center"><div class="sign-line"></div><div class="small">Enquiry Officer</div></div>
          <div class="small center">Printed: {$issuedAt}</div>
        </div>
        HTML;

        return $this->document(
            $body,
            '@page { size: A4; margin: 14mm; }
             body { margin:0; font-family: Arial, Helvetica, sans-serif; color:#000; }
             .diary { max-width: 170mm; margin: 0 auto; font-size: 13px; line-height:1.5; }
             .center { text-align:center; }
             .logo { width:70px; height:70px; object-fit:contain; }
             .org { font-size:15px; font-weight:700; margin-top:4px; }
             .tag { font-size:16px; font-weight:800; letter-spacing:1px; margin-top:6px; }
             .mrow { margin:4px 0; }
             .mrow .k { display:inline-block; width:120px; font-weight:700; }
             .body { margin-top:12px; }
             .desc { white-space:pre-wrap; margin-top:6px; }
             .sign { margin-top:40px; width:180px; }
             .sign-line { border-top:1px solid #000; margin-bottom:4px; }
             .small { font-size:11px; }
             hr { border:none; border-top:1px solid #000; margin:10px 0; }'
        );
    }

    private function document(string $body, string $css): string
    {
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' . $css . '</style></head><body>' . $body . '</body></html>';
    }
}
