<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Enquiry;
use App\Models\EnquiryNotice;
use Illuminate\Support\Facades\URL;

class PrintService
{
    public function __construct(private readonly QrService $qr)
    {
    }

    /**
     * 80mm thermal complaint slip.
     */
    public function complaintSlip(Complaint $complaint): string
    {
        $complaint->loadMissing('circle');

        $number   = $complaint->slip_number ?: ($complaint->tracking_no ?: ('#' . $complaint->id));
        $circle   = $complaint->circle?->name ?? '—';
        $name     = e($complaint->complainant_name);
        $cnic     = e($complaint->cnic);
        $date     = $complaint->report_date ? \Illuminate\Support\Carbon::parse($complaint->report_date)->format('d/m/Y') : '—';
        $time     = $complaint->entry_time ? \Illuminate\Support\Carbon::parse($complaint->entry_time)->format('h:i A') : '—';
        $address  = e($complaint->address);
        $offence  = e($complaint->offence_type ?? '—');
        $issuedAt = now()->format('d/m/Y h:i A');
        $logo     = url('images/NCCIA.webp');

        return <<<HTML
        <div class="slip">
          <div class="center">
            <img src="{$logo}" alt="NCCIA" class="logo" />
            <div class="org">National Compliance &amp; Integrity Authority (NCCIA)</div>
            <div class="tag">COMPLAINT RECEIPT SLIP</div>
          </div>
          <hr/>
          <table class="kv">
            <tr><td class="k">Complaint No.</td><td class="v"><strong>{$number}</strong></td></tr>
            <tr><td class="k">Name</td><td class="v">{$name}</td></tr>
            <tr><td class="k">CNIC</td><td class="v">{$cnic}</td></tr>
            <tr><td class="k">Circle</td><td class="v">{$circle}</td></tr>
            <tr><td class="k">Report Date</td><td class="v">{$date}</td></tr>
            <tr><td class="k">Report Time</td><td class="v">{$time}</td></tr>
            <tr><td class="k">Offence</td><td class="v">{$offence}</td></tr>
          </table>
          <hr/>
          <div class="small center">Complainant: {$name}<br/>{$address}</div>
          <div class="small center">Issued: {$issuedAt}</div>
          <div class="small center">NCCIA — Serving the Nation</div>
        </div>
        HTML;
    }

    public function slipPrintDocument(Complaint $complaint): string
    {
        return $this->document(
            $this->complaintSlip($complaint),
            '@page { size: 80mm auto; margin: 2mm; }
             body { margin:0; }
             .slip { width: 76mm; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color:#000; }
             .center { text-align:center; }
             .org { font-weight:700; font-size:12px; margin-top:4px; }
             .tag { font-weight:700; letter-spacing:1px; margin-top:2px; }
             .logo { width:60px; height:60px; object-fit:contain; }
             .kv { width:100%; border-collapse:collapse; margin:4px 0; }
             .kv td { padding:3px 0; vertical-align:top; }
             .k { width:78px; font-weight:600; }
             .small { font-size:10px; margin-top:3px; }
             hr { border:none; border-top:1px dashed #000; margin:6px 0; }'
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

    private function document(string $body, string $css): string
    {
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' . $css . '</style></head><body>' . $body . '</body></html>';
    }
}
