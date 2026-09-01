<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DSR — {{ $report->unit_name }} — {{ $report->report_date->format('d.m.Y') }}</title>
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11px; color: #000; margin: 0; }
        h1 { text-align: center; font-size: 16px; margin: 0 0 4px; text-transform: uppercase; }
        h2 { text-align: center; font-size: 13px; margin: 0 0 12px; font-weight: normal; }
        h3 { font-size: 12px; margin: 14px 0 6px; text-transform: uppercase; }
        .zone { font-style: italic; margin: 4px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; word-wrap: break-word; }
        th { background: #f3f3f3; font-weight: bold; text-align: center; font-size: 10px; }
        .highlights td { width: 25%; }
        .nil-row td { text-align: center; font-weight: bold; }
        .count { font-size: 14px; font-weight: bold; text-align: center; }
        .no-print { text-align: right; margin-bottom: 8px; }
        .nccia-official-header svg { width: 64px; height: 64px; display: block; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
@php
    $h = $report->highlights ?? [];
    $p = $report->payload ?? [];
    $pad = fn($n) => str_pad((string)($n ?? 0), 2, '0', STR_PAD_LEFT);
    $nilRow = fn($cols) => '<tr class="nil-row">'.str_repeat('<td>NIL</td>', $cols).'</tr>';
@endphp

<p class="no-print"><button onclick="window.print()">Print / Save PDF</button></p>

@include('exports.partials.nccia-official-header', [
    'qrType' => 'dsr_report',
    'qrId' => $report->id,
    'qrCaption' => 'DSR-' . $report->id,
    'documentSubtitle' => 'Daily Situation Report (DSR) — ' . strtoupper($report->unit_name) . ' — Dated ' . $report->report_date->format('d.m.Y'),
])

<h3>Highlights</h3>
<table class="highlights">
    <tr>
        <td>Cases:</td><td class="count">{{ $pad($h['cases'] ?? 0) }}</td>
        <td>Enquiries registered:</td><td class="count">{{ $pad($h['enquiries_registered'] ?? 0) }}</td>
    </tr>
    <tr>
        <td>Enquiries closed:</td><td class="count">{{ $pad($h['enquiries_closed'] ?? 0) }}</td>
        <td>Accused in Lockup</td><td class="count">{{ $pad($h['accused_in_lockup'] ?? 0) }}</td>
    </tr>
    <tr>
        <td>Number of Fresh Accused Arrested:</td><td class="count">{{ $pad($h['fresh_arrests'] ?? 0) }}</td>
        <td>Bail Pre-Arrest/ Post Arrest</td><td class="count">{{ $pad($h['bail'] ?? 0) }}</td>
    </tr>
    <tr>
        <td>Old Accused Arrested:</td><td class="count">{{ $pad($h['old_accused_arrested'] ?? 0) }}</td>
        <td>Conviction:</td><td class="count">{{ $pad($h['conviction'] ?? 0) }}</td>
    </tr>
</table>

<h3>Enquiries Registered ({{ $pad(count($p['enquiries_registered'] ?? [])) }})</h3>
<table>
    <thead>
        <tr>
            <th>Sr.#</th><th>Enquiry No. &amp; Dated</th><th>Complainant</th><th>Circle</th><th>Name of E.O.</th>
            <th>Gist of allegations</th><th>Name of Accused along-with BPS (if any)</th><th>Amount involved</th><th>Amount recovered</th><th>Entered in CMS</th>
        </tr>
    </thead>
    <tbody>
        @forelse($p['enquiries_registered'] ?? [] as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ trim(($row['enquiry_number'] ?? '') . ' ' . ($row['dated'] ?? '')) }}</td>
                <td>{{ $row['complainant'] ?? '' }}</td><td>{{ $row['circle'] ?? '' }}</td><td>{{ $row['eo_name'] ?? '' }}</td>
                <td>{{ $row['gist'] ?? '' }}</td><td>{{ $row['accused'] ?? '' }}</td>
                <td>{{ $row['amount_involved'] ?? '' }}</td><td>{{ $row['amount_recovered'] ?? 'NIL' }}</td><td>{{ $row['cms_entered'] ?? '' }}</td>
            </tr>
        @empty
            {!! $nilRow(10) !!}
        @endforelse
    </tbody>
</table>

<h3>Enquiries Closed ({{ $pad(count($p['enquiries_closed'] ?? [])) }})</h3>
<p class="zone">Zone: {{ $report->unit_name }}</p>
<table>
    <thead>
        <tr>
            <th>Sr. #</th><th>Enquiry No. &amp; Dated</th><th>Complainant</th><th>Circle</th><th>Name of E.O.</th>
            <th>Gist of allegations</th><th>Name of Accused along-with BPS (if any)</th><th>Amount involved</th><th>Amount Recovered</th><th>Reason of Closure</th><th>Entered in CMS</th>
        </tr>
    </thead>
    <tbody>
        @forelse($p['enquiries_closed'] ?? [] as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ trim(($row['enquiry_number'] ?? '') . ' ' . ($row['dated'] ?? '')) }}</td>
                <td>{{ $row['complainant'] ?? '' }}</td><td>{{ $row['circle'] ?? '' }}</td><td>{{ $row['eo_name'] ?? '' }}</td>
                <td>{{ $row['gist'] ?? '' }}</td><td>{{ $row['accused'] ?? '' }}</td>
                <td>{{ $row['amount_involved'] ?? '' }}</td><td>{{ $row['amount_recovered'] ?? 'NIL' }}</td>
                <td>{{ $row['closure_reason'] ?? '' }}</td><td>{{ $row['cms_entered'] ?? '' }}</td>
            </tr>
        @empty
            {!! $nilRow(11) !!}
        @endforelse
    </tbody>
</table>

<h3>FIR/Case Registered ({{ $pad(count($p['cases_registered'] ?? [])) }})</h3>
<table>
    <thead>
        <tr>
            <th>Sr. #</th><th>Enquiry No. &amp; Dated/ Raid Case</th><th>FIR No. &amp; Dated along-with Sections of Laws</th><th>Circle</th><th>Name of I.O.</th>
            <th>Gist of allegations</th><th>Name of Accused along-with BPS (if any)</th><th>Amount involved (if any)</th><th>Amount recovered (if any)</th>
            <th>Total No. of Accused</th><th>Arrested</th><th>Not Arrested</th><th>On Bail</th><th>Entered in CMS</th>
        </tr>
    </thead>
    <tbody>
        @forelse($p['cases_registered'] ?? [] as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td><td>{{ $row['enquiry_no'] ?? '' }}</td><td>{{ $row['fir_no_dated_sections'] ?? $row['fir_no'] ?? '' }}</td>
                <td>{{ $row['circle'] ?? '' }}</td><td>{{ $row['io_name'] ?? '' }}</td><td>{{ $row['gist'] ?? '' }}</td><td>{{ $row['accused'] ?? '' }}</td>
                <td>{{ $row['amount_involved'] ?? '' }}</td><td>{{ $row['amount_recovered'] ?? 'NIL' }}</td>
                <td>{{ $row['total_accused'] ?? 0 }}</td><td>{{ $row['accused_arrested'] ?? 0 }}</td><td>{{ $row['accused_not_arrested'] ?? 0 }}</td><td>{{ $row['accused_on_bail'] ?? 0 }}</td><td>{{ $row['cms_entered'] ?? '' }}</td>
            </tr>
        @empty
            {!! $nilRow(14) !!}
        @endforelse
    </tbody>
</table>

<h3>FIR DISPOSED OFF ({{ $pad(count($p['cases_disposed'] ?? [])) }})</h3>
<p class="zone">Zone: {{ $report->circle?->name ?? 'Lahore' }}</p>
<table>
    <thead>
        <tr>
            <th>Sr. #</th><th>FIR No. &amp; Dated along-with Sections of Laws</th><th>Circle</th><th>Name of I.O.</th><th>Gist of allegations</th>
            <th>Name of Accused along-with BPS (if any)</th><th>Amount involved (if any)</th><th>Total No. of Accused</th><th>Reason of Disposal</th><th>Entered in CMS</th>
            <th>Arrested</th><th>Not Arrested</th><th>On Bail</th><th>Challenged/Closed/Transferred/Decided/ (Reason of Closure)</th>
        </tr>
    </thead>
    <tbody>
        @forelse($p['cases_disposed'] ?? [] as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td><td>{{ $row['fir_no_dated_sections'] ?? $row['fir_no'] ?? '' }}</td><td>{{ $row['circle'] ?? '' }}</td><td>{{ $row['io_name'] ?? '' }}</td>
                <td>{{ $row['gist'] ?? '' }}</td><td>{{ $row['accused'] ?? '' }}</td><td>{{ $row['amount_involved'] ?? '' }}</td><td>{{ $row['total_accused'] ?? 0 }}</td>
                <td>{{ $row['reason'] ?? '' }}</td><td>Yes</td><td>{{ $row['accused_arrested'] ?? 0 }}</td><td>{{ $row['accused_not_arrested'] ?? 0 }}</td><td>{{ $row['accused_on_bail'] ?? 0 }}</td><td>{{ $row['disposal_detail'] ?? $row['reason'] ?? '' }}</td>
            </tr>
        @empty
            {!! $nilRow(14) !!}
        @endforelse
    </tbody>
</table>

<h3>Accused/ PO/ CA Arrested: ({{ $pad(count($p['arrests'] ?? [])) }})</h3>
<p class="zone">Zone: {{ $report->unit_name }}</p>
<table>
    <thead>
        <tr><th>Sr.#</th><th>Circle</th><th>Name of accused, S/O</th><th>CNIC No. /PP No.</th><th>Phone No/Mobile No</th><th>FIR No &amp; date</th><th>U/S</th><th>Accused in Lockup</th></tr>
    </thead>
    <tbody>
        @forelse($p['arrests'] ?? [] as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td><td>{{ $row['circle'] ?? '' }}</td><td>{{ $row['accused_so'] ?? $row['accused_name'] ?? '' }}</td>
                <td>{{ $row['cnic'] ?? '' }}</td><td>{{ $row['phone'] ?? '' }}</td><td>{{ $row['fir_no_date'] ?? '' }}</td><td>{{ $row['sections'] ?? '' }}</td><td>{{ $row['in_lockup'] ?? '' }}</td>
            </tr>
        @empty
            {!! $nilRow(8) !!}
        @endforelse
    </tbody>
</table>

<h3>Accused in lockup ({{ $pad(count($p['lockup_list'] ?? [])) }})</h3>
<p class="zone">Zone: {{ $report->unit_name }}</p>
<table>
    <thead>
        <tr><th>Sr.#</th><th>Circle</th><th>Name of accused, S/O</th><th>CNIC No. /PP No.</th><th>Phone No/Mobile No</th><th>FIR No &amp; date</th><th>U/S</th><th>Accused in Lockup</th></tr>
    </thead>
    <tbody>
        @forelse($p['lockup_list'] ?? [] as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td><td>{{ $row['circle'] ?? '' }}</td><td>{{ $row['accused_so'] ?? '' }}</td><td>{{ $row['cnic'] ?? '' }}</td>
                <td>{{ $row['phone'] ?? '' }}</td><td>{{ $row['fir_no_date'] ?? '' }}</td><td>{{ $row['sections'] ?? '' }}</td><td>{{ $row['in_lockup'] ?? 'Yes' }}</td>
            </tr>
        @empty
            <tr class="nil-row"><td colspan="8">NIL.</td></tr>
        @endforelse
    </tbody>
</table>

<h3>BAIL STATUS (PRE-ARREST/POST ARREST) ({{ $pad(count($p['bail_records'] ?? [])) }})</h3>
<table>
    <thead><tr><th>SR. #</th><th>POLICE STATION</th><th>ACCUSED NAME</th><th>CASE FIR #</th><th>COURT</th><th>BAIL STATUS</th></tr></thead>
    <tbody>
        @forelse($p['bail_records'] ?? [] as $row)
            <tr>
                <td>{{ $row['sr'] ?? '' }}</td><td>{{ $row['police_station'] ?? '' }}</td><td>{{ $row['accused_name'] ?? '' }}</td>
                <td>{{ $row['fir_no'] ?? '' }}</td><td>{{ $row['court'] ?? '' }}</td><td>{{ $row['bail_status'] ?? '' }}</td>
            </tr>
        @empty
            {!! $nilRow(6) !!}
        @endforelse
    </tbody>
</table>

@php $pc = ($p['progress_cases_official'] ?? [])[0] ?? []; @endphp
<h3>PROGRESS OF CASES (As on {{ $report->report_date->format('d.m.Y') }})</h3>
<table>
    <thead>
        <tr>
            <th>UNIT</th><th>Previous</th><th>Added on {{ $report->report_date->year - 1 }}</th><th>Added on {{ $report->report_date->year }}</th><th>Total</th><th>Disposed off</th><th>Pending</th>
            <th>Less than 06 Months</th><th>More than 06 Months</th><th>Balance</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>{{ $pc['unit'] ?? $report->unit_name }}</td><td>{{ $pc['previous'] ?? 0 }}</td><td>{{ $pc['added_prev'] ?? 0 }}</td><td>{{ $pc['added_curr'] ?? 0 }}</td>
            <td>{{ $pc['total'] ?? 0 }}</td><td>{{ $pc['disposed'] ?? 0 }}</td><td>{{ $pc['pending'] ?? 0 }}</td><td>{{ $pc['less_than_6'] ?? 0 }}</td><td>{{ $pc['more_than_6'] ?? 0 }}</td><td>{{ $pc['balance'] ?? 0 }}</td>
        </tr>
    </tbody>
</table>

@php $pe = ($p['progress_enquiries_official'] ?? [])[0] ?? []; @endphp
<h3>PROGRESS OF ENQUIRES (As on {{ $report->report_date->format('d.m.Y') }})</h3>
<table>
    <thead>
        <tr>
            <th>UNIT</th><th>Previous</th><th>Added on {{ $report->report_date->year - 1 }}</th><th>Added on {{ $report->report_date->year }}</th><th>Total</th><th>Disposed off</th><th>Pending</th>
            <th>Less than 03 Months</th><th>More than 03 Months</th><th>Balance</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>{{ $pe['unit'] ?? $report->unit_name }}</td><td>{{ $pe['previous'] ?? 0 }}</td><td>{{ $pe['added_prev'] ?? 0 }}</td><td>{{ $pe['added_curr'] ?? 0 }}</td>
            <td>{{ $pe['total'] ?? 0 }}</td><td>{{ $pe['disposed'] ?? 0 }}</td><td>{{ $pe['pending'] ?? 0 }}</td><td>{{ $pe['less_than_3'] ?? 0 }}</td><td>{{ $pe['more_than_3'] ?? 0 }}</td><td>{{ $pe['balance'] ?? 0 }}</td>
        </tr>
    </tbody>
</table>

@php $pos = $p['po_ca_summary']['pos'] ?? []; $cas = $p['po_ca_summary']['cas'] ?? []; @endphp
<h3>ARREST OF POs &amp; CAs (UP TO DATE FIGURES)</h3>
<table>
    <thead>
        <tr><th>Unit</th><th colspan="3">Previous Balance</th><th colspan="3">Added on {{ $report->report_date->format('d.m.Y') }}</th><th colspan="3">Total</th><th colspan="3">Arrested</th><th colspan="3">Pending</th></tr>
        <tr><th></th><th>POs</th><th>CAs</th><th></th><th>POs</th><th>CAs</th><th></th><th>POs</th><th>CAs</th><th></th><th>POs</th><th>CAs</th><th></th><th>POs</th><th>CAs</th><th></th></tr>
    </thead>
    <tbody>
        <tr>
            <td>{{ $report->unit_name }}</td>
            <td>{{ $pos['previous'] ?? 0 }}</td><td>{{ $cas['previous'] ?? 0 }}</td><td></td>
            <td>{{ $pos['added'] ?? 0 }}</td><td>{{ $cas['added'] ?? 0 }}</td><td></td>
            <td>{{ ($pos['previous'] ?? 0) + ($pos['added'] ?? 0) }}</td><td>{{ ($cas['previous'] ?? 0) + ($cas['added'] ?? 0) }}</td><td></td>
            <td>{{ $pos['arrested'] ?? 0 }}</td><td>{{ $cas['arrested'] ?? 0 }}</td><td></td>
            <td>{{ $pos['pending'] ?? 0 }}</td><td>{{ $cas['pending'] ?? 0 }}</td><td></td>
        </tr>
    </tbody>
</table>

<h3>SUMMARY</h3>
<table>
    <tr><th>{{ $report->unit_name }}</th><th>Total</th></tr>
    <tr><td>Cases Registered</td><td>{{ $p['summary']['total_cases_registered'] ?? 0 }}</td></tr>
    <tr><td>Enquiries Registered</td><td>{{ $p['summary']['total_enquiries_registered'] ?? 0 }}</td></tr>
    <tr><td>Accused in Lockup</td><td>{{ $p['summary']['accused_in_lockup'] ?? ($h['accused_in_lockup'] ?? 0) }}</td></tr>
    <tr><td>Arrested alleged</td><td>{{ $p['summary']['total_arrests'] ?? 0 }}</td></tr>
    <tr><td>Arrested Pos</td><td>{{ $p['summary']['arrested_pos'] ?? 0 }}</td></tr>
    <tr><td>Arrested CAs</td><td>{{ $p['summary']['arrested_cas'] ?? 0 }}</td></tr>
    <tr><td>Highlights dated {{ $report->report_date->format('jS M, Y') }}</td><td>{{ $report->notes ?: 'NIL' }}</td></tr>
</table>
</body>
</html>
