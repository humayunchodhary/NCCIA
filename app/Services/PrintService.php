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
        try {
            $complaint->loadMissing(['circle', 'verification.officer', 'latestVerificationReport.creator']);
        } catch (\Throwable $e) {
            // Safe fallback if relations are missing
        }

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

        $voName = $complaint->verification?->officer?->name
            ?: ($complaint->latestVerificationReport?->creator?->name
                ?: ($complaint->verification_officer_name ?: null));

        if (!$voName && $complaint->verification?->verification_officer_id) {
            $voUser = \App\Models\User::find($complaint->verification->verification_officer_id);
            $voName = $voUser?->name;
        }

        $voDisplay = $voName ? e($voName) : 'Pending Assignment';
        $issuedAt = now()->format('d/m/Y h:i A');
        $logo     = url('images/images.jpg');
        $numberE  = e($number);

        return <<<HTML
        <div class="slip">
          <div class="head">
            <img src="{$logo}" alt="NCCIA" class="logo" />
            <div class="org">NATIONAL CYBER CRIME<br/>INVESTIGATION AGENCY</div>
            <div class="org-ur">قومی سائبر کرائم تفتیش ایجنسی</div>
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
            <tr><td class="k">Verif. Officer</td><td class="v"><strong>{$voDisplay}</strong></td></tr>
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
                <div class="small">Verif. Officer / Desk</div>
                <div class="tiny">{$voDisplay}</div>
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
             body { margin:0; padding:0; background:#fff; }
             .slip { width: 76mm; margin: 0 auto; font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 11px; color:#111; }
             .head { text-align:center; border-bottom: 3px solid #000; padding-bottom: 7px; margin-bottom: 6px; }
             .logo { display:block; width:100px; height:100px; margin:0 auto 4px; object-fit:contain; border-radius:50%; border:3px solid #264078; padding:3px; background:#fff; }
             .org { font-weight:800; font-size:11px; line-height:1.3; margin-top:3px; letter-spacing:0.2px; text-align:center; }
             .org-ur { font-size:11px; font-weight:700; margin-top:2px; text-align:center; }
             .tag { display:inline-block; margin-top:6px; padding:2px 10px; border:2px solid #000; font-weight:800; font-size:10px; letter-spacing:1.2px; text-align:center; }
             .num-box { text-align:center; border:2px dashed #000; padding:6px 4px; margin:8px auto; width:90%; }
             .num-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; }
             .num-val { font-size:16px; font-weight:800; letter-spacing:0.5px; margin-top:2px; }
             .kv { width:100%; border-collapse:collapse; margin:2px auto 6px; }
             .kv td { padding:3px 0; vertical-align:top; border-bottom:1px dotted #bbb; }
             .kv tr:last-child td { border-bottom:none; }
             .k { width:78px; font-weight:700; color:#222; }
             .v { word-break:break-word; text-align:right; }
             .note { font-size:9.5px; line-height:1.35; text-align:center; border:2px solid #000; padding:5px 4px; margin:6px auto; width:92%; }
             .sign-row { width:100%; border-collapse:collapse; margin:10px auto 6px; }
             .sign { width:50%; text-align:center; vertical-align:top; padding:0 3px; }
             .sign-line { border-top:2px solid #000; margin:18px 0 3px; }
             .qr-block { text-align:center; border-top:2px dashed #000; padding-top:6px; margin-top:4px; }
             .qr { width:92px; height:92px; }
             .foot { text-align:center; margin-top:4px; border-top:2px solid #000; padding-top:4px; }
             .small { font-size:9.5px; font-weight:700; text-align:center; }
             .tiny { font-size:8.5px; margin-top:1px; text-align:center; }
             .muted { color:#444; word-break:break-all; line-height:1.2; }'
        );
    }

    /**
     * Full A4 complaint report: complainant, offence, description, accused (with identity files).
     */
    public function complaintReportPrintDocument(Complaint $complaint): string
    {
        $complaint->loadMissing('circle');
        $logo = url('images/NCCIA.webp');
        $issuedAt = now()->format('d/m/Y h:i A');

        $number  = $complaint->tracking_no ?: ($complaint->slip_number ?: ('#' . $complaint->id));
        $circle  = e($complaint->circle?->name ?? '—');
        $name    = e($complaint->complainant_name ?: '—');
        $father  = e($complaint->father_name ?: '—');
        $cnic    = e($complaint->cnic ?: '—');
        $phone   = trim(($complaint->contact_country_code ? '+' . ltrim((string) $complaint->contact_country_code, '+') . ' ' : '') . ($complaint->contact_no ?? ''));
        $phone   = e($phone !== '' ? $phone : '—');
        $whatsapp = e($complaint->whatsapp_no ?: '—');
        $gender  = e($complaint->gender ? ucfirst($complaint->gender) : '—');
        $email   = e($complaint->email ?: '—');
        $address = e($complaint->address ?: '—');
        $district = e($complaint->district ?: '—');
        $passportNo = e($complaint->passport_no ?: '—');
        $nationality = e($complaint->nationality ?: '—');

        $reportDate = $complaint->report_date ? \Illuminate\Support\Carbon::parse($complaint->report_date)->format('d/m/Y') : '—';
        $occurrence = $complaint->occurrence_date ? \Illuminate\Support\Carbon::parse($complaint->occurrence_date)->format('d/m/Y') : '—';
        $offence  = e($complaint->offence_type ?: '—');
        $priority = e(ucfirst(str_replace('_', ' ', $complaint->priority_type ?? '—')));
        $source   = e($complaint->source ? ucfirst(str_replace('_', ' ', $complaint->source)) : '—');
        $amount   = $complaint->amount_involved !== null ? e(number_format((float) $complaint->amount_involved, 2)) : '—';
        $diary    = e($complaint->diary_no ?: '—');
        $operator = e($complaint->operator_name ?: '—');
        $status   = e(ucfirst(str_replace('_', ' ', $complaint->status ?? '—')));
        $description = nl2br(e($complaint->description ?: '—'));

        $laws = collect($complaint->laws ?: [])->implode(', ');
        $laws = $laws ? e($laws) : '—';

        $complaintFiles = '';
        $complaintDocs = [
            ['label' => 'CNIC Front',   'value' => $complaint->cnic_front],
            ['label' => 'CNIC Back',    'value' => $complaint->cnic_back],
            ['label' => 'Passport',     'value' => $complaint->passport_attachment],
            ['label' => 'Photo',        'value' => $complaint->picture],
            ['label' => 'Attachment',   'value' => $complaint->attachment],
        ];
        foreach ($complaintDocs as $doc) {
            if (!empty($doc['value'])) {
                $complaintFiles .= '<span class="alink"><a href="' . e(url($doc['value'])) . '">' . $doc['label'] . '</a></span>';
            }
        }
        if (!$complaintFiles) {
            $complaintFiles = '<div class="muted">No attachments</div>';
        }

        // Financial record (bank transfer details)
        $bankSender = trim(($complaint->bank_name_sender ?? '') . ' ' . ($complaint->account_no_sender ?? ''));
        $bankReceiver = trim(($complaint->bank_name_receiver ?? '') . ' ' . ($complaint->account_no_receiver ?? ''));
        $transactionDate = $complaint->transaction_date ? \Illuminate\Support\Carbon::parse($complaint->transaction_date)->format('d/m/Y') : '—';
        $crimeMediums = collect($complaint->crime_mediums ?: [])->implode(', ');
        $crimeMediums = $crimeMediums ? e($crimeMediums) : '—';
        $platforms = collect($complaint->platforms ?: [])->implode(', ');
        $platforms = $platforms ? e($platforms) : '—';
        $bankSender = $bankSender !== '' ? e($bankSender) : '—';
        $bankReceiver = $bankReceiver !== '' ? e($bankReceiver) : '—';
        $platformProfile = e($complaint->platform_profile_page ?: '—');
        $platformUsername = e($complaint->platform_username ?: '—');
        $platformEmail = e($complaint->platform_email_involved ?: '—');
        $platformMobile = e($complaint->platform_mobile_involved ?: '—');

        $accusedRows = '';
        $accused = $complaint->initial_accused ?: [];
        if (is_array($accused) && count($accused) > 0) {
            foreach ($accused as $index => $a) {
                if (!is_array($a)) {
                    continue;
                }
                $n = $index + 1;
                $aName    = e($a['name'] ?? '—');
                $aFather  = e($a['father_name'] ?? '—');
                $aCnic    = e($a['cnic'] ?? '—');
                $aMobile  = e($a['mobile_no'] ?? '—');
                $aEmail   = e($a['email'] ?? '—');
                $aSocial  = e($a['social_media_url'] ?? '—');
                $aOther   = e($a['other_info'] ?? '—');
                $aDesc    = e($a['description'] ?? '—');
                $aDocs = '';
                $aDocFields = [
                    ['label' => 'CNIC Front', 'value' => $a['cnic_front'] ?? null],
                    ['label' => 'CNIC Back',  'value' => $a['cnic_back'] ?? null],
                    ['label' => 'Photo',      'value' => $a['picture'] ?? null],
                    ['label' => 'Passport',   'value' => $a['passport_attachment'] ?? null],
                ];
                foreach ($aDocFields as $doc) {
                    if (!empty($doc['value'])) {
                        $aDocs .= '<span class="alink"><a href="' . e(url($doc['value'])) . '">' . $doc['label'] . '</a></span>';
                    }
                }
                $accusedRows .= <<<HTML
                <tr>
                  <td class="c">{$n}</td>
                  <td><strong>{$aName}</strong><br/><span class="k" style="font-size:10.5px;">S/O {$aFather}</span></td>
                  <td>{$aCnic}</td>
                  <td>{$aMobile}</td>
                  <td>{$aEmail}</td>
                  <td>{$aDocs}</td>
                </tr>
                <tr class="desc"><td></td><td colspan="5"><span class="k">Other:</span> {$aOther}<br/><span class="k">Social:</span> {$aSocial}<br/><span class="k">Description:</span> {$aDesc}</td></tr>
                HTML;
            }
        } else {
            $accusedRows = '<tr><td colspan="6" class="c muted">No accused recorded at registration</td></tr>';
        }

        $body = <<<HTML
        <div class="report">
          <div class="head">
            <img src="{$logo}" alt="NCCIA" class="logo" />
            <div class="org">National Cyber Crime Investigation Agency (NCCIA)</div>
            <div class="addr">Islamabad — Pakistan</div>
            <div class="tag">COMPLAINT REPORT</div>
          </div>

          <div class="meta">
            <div class="mrow"><span class="k">Complaint No:</span><span><strong>{$number}</strong></span></div>
            <div class="mrow"><span class="k">Circle:</span><span>{$circle}</span></div>
            <div class="mrow"><span class="k">Report Date:</span><span>{$reportDate}</span></div>
            <div class="mrow"><span class="k">Status:</span><span>{$status}</span></div>
            <div class="mrow"><span class="k">Diary No:</span><span>{$diary}</span></div>
            <div class="mrow"><span class="k">Operator:</span><span>{$operator}</span></div>
          </div>

          <h3 class="sec">1. Complainant Information</h3>
          <table class="info">
            <tr><td class="k">Name</td><td>{$name}</td><td class="k">Father Name</td><td>{$father}</td></tr>
            <tr><td class="k">CNIC</td><td>{$cnic}</td><td class="k">Gender</td><td>{$gender}</td></tr>
            <tr><td class="k">Contact</td><td>{$phone}</td><td class="k">WhatsApp</td><td>{$whatsapp}</td></tr>
            <tr><td class="k">Email</td><td>{$email}</td><td class="k">Nationality</td><td>{$nationality}</td></tr>
            <tr><td class="k">Passport No</td><td>{$passportNo}</td><td class="k">District</td><td>{$district}</td></tr>
            <tr><td class="k">Address</td><td colspan="3">{$address}</td></tr>
          </table>

          <h3 class="sec">2. Complaint / Offence Details</h3>
          <table class="info">
            <tr><td class="k">Offence Type</td><td>{$offence}</td><td class="k">Priority</td><td>{$priority}</td></tr>
            <tr><td class="k">Source</td><td>{$source}</td><td class="k">Occurrence Date</td><td>{$occurrence}</td></tr>
            <tr><td class="k">Amount Involved</td><td>{$amount}</td><td class="k">Laws</td><td>{$laws}</td></tr>
          </table>
          <div class="desc"><span class="k">Description:</span><div class="descbox">{$description}</div></div>

          <h3 class="sec">3. Identity Files &amp; Attachments</h3>
          <div class="flist-wrap">{$complaintFiles}</div>

          <h3 class="sec">4. Financial Record</h3>
          <table class="info">
            <tr><td class="k">Amount Involved</td><td>{$amount}</td><td class="k">Crime Medium</td><td>{$crimeMediums}</td></tr>
            <tr><td class="k">Sender Bank / A/C</td><td colspan="3">{$bankSender}</td></tr>
            <tr><td class="k">Receiver Bank / A/C</td><td colspan="3">{$bankReceiver}</td></tr>
            <tr><td class="k">Transaction Date</td><td>{$transactionDate}</td><td class="k">Platforms</td><td>{$platforms}</td></tr>
            <tr><td class="k">Platform Profile</td><td colspan="3">{$platformProfile}</td></tr>
            <tr><td class="k">Platform Username</td><td>{$platformUsername}</td><td class="k">Email Involved</td><td>{$platformEmail}</td></tr>
            <tr><td class="k">Mobile Involved</td><td colspan="3">{$platformMobile}</td></tr>
          </table>

          <h3 class="sec">5. Accused (Initial Stage)</h3>
          <table class="accused">
            <thead>
              <tr><th>#</th><th>Name</th><th>CNIC</th><th>Mobile</th><th>Email</th><th>Identity Files</th></tr>
            </thead>
            <tbody>{$accusedRows}</tbody>
          </table>

          <div class="sign-row">
            <div class="sign"><div class="sign-line"></div><div class="small">Operator / Desk — {$operator}</div></div>
            <div class="sign"><div class="sign-line"></div><div class="small">Circle Incharge</div></div>
          </div>

          <div class="foot"><div class="small">Printed: {$issuedAt}</div><div class="tiny">NCCIA — Serving the Nation</div></div>
        </div>
        HTML;

        return $this->document(
            $body,
            '@page { size: A4; margin: 14mm; }
             body { margin:0; font-family: Arial, Helvetica, sans-serif; color:#000; }
             .report { max-width: 175mm; margin: 0 auto; font-size: 13px; line-height: 1.5; }
             .head { text-align:center; border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
             .head .logo { width:130px; height:130px; object-fit:contain; border-radius:50%; border:3px solid #264078; padding:3px; background:#fff; }
             .head .org { font-size:16px; font-weight:700; margin-top:2px; }
             .head .addr { font-size:11px; color:#333; margin-top:2px; }
             .head .tag { display:inline-block; margin-top:6px; padding:3px 14px; border:2px solid #000; font-weight:800; font-size:12px; letter-spacing:1.5px; }
             .meta { margin:6px 0; }
             .mrow { margin:2px 0; }
             .mrow .k { display:inline-block; width:110px; font-weight:700; }
             h3.sec { font-size:13px; margin:16px 0 6px; padding:4px 8px; background:#f0f0f0; border-left:5px solid #015C94; }
             table.info { width:100%; border-collapse:collapse; margin-bottom:4px; }
             table.info td { border:1.5px solid #999; padding:5px 8px; vertical-align:top; font-size:12.5px; }
             table.info .k { width:110px; background:#f7f7f7; font-weight:700; }
             .desc { margin-top:6px; }
             .descbox { border:1.5px solid #999; padding:8px; margin-top:4px; font-size:12.5px; white-space:pre-wrap; }
             .flist-wrap { border:1.5px solid #999; padding:8px; }
             .flist { margin:2px 0; }
             table.accused { width:100%; border-collapse:collapse; margin-top:4px; }
             table.accused th { background:#e9e9e9; border:1.5px solid #999; padding:6px 8px; font-size:12px; }
             table.accused td { border:1.5px solid #999; padding:5px 8px; font-size:12.5px; vertical-align:top; }
             table.accused td.c { text-align:center; }
             table.accused tr.desc td { font-size:11.5px; color:#333; }
             .alink { display:inline-block; margin-right:6px; padding:1px 6px; border:1.5px solid #015C94; border-radius:4px; font-size:11px; color:#015C94; }
             .muted { color:#666; }
             .sign-row { width:100%; margin:30px 0 10px; }
             .sign-row .sign { display:inline-block; width:48%; text-align:center; vertical-align:top; }
             .sign-line { border-top:2px solid #000; margin:0 30px 4px; }
             .small { font-size:11px; }
             .tiny { font-size:10px; color:#444; margin-top:2px; }
             .foot { text-align:center; border-top:1px solid #000; margin-top:14px; padding-top:6px; }'
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
$logo = url('images/images.jpg');

        $via       = $notice->notice_via ? ucfirst(str_replace('_', ' ', $notice->notice_via)) : '—';
        $person    = $notice->person_type ? ucfirst($notice->person_type) : '—';
        $type      = $notice->notice_type ?: 'Summon';

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
              <div class="org">National Cyber Crime Investigation Agency (NCCIA)</div>
              <div class="addr">Islamabad — Pakistan &nbsp;|&nbsp; Circle: {$circle}</div>
            </div>
            <hr/>
            <div class="center title">{$type}</div>
          </div>

          <div class="meta">
            <div class="mrow"><span class="k">Summon No:</span><span>{$number}</span></div>
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
              <div class="small center">Scan to verify this summon</div>
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
        $enquiry->loadMissing('complaint.circle');        $logo = url('images/NCCIA.webp');
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
            <div class="org">National Cyber Crime Investigation Agency (NCCIA)</div>
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
