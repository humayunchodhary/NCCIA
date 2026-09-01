<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DSR — {{ $report->unit_name }} — {{ $report->report_date->format('d.m.Y') }}</title>
    <style>
        @page { size: A4 landscape; margin: 8mm 10mm; }

        * { box-sizing: border-box; }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px;
            color: #111;
            margin: 0;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .no-print { text-align: right; margin-bottom: 8px; }
        @media print { .no-print { display: none; } }

        /* Letterhead */
        .nccia-letterhead {
            border: 1.5px solid #1a3d6b;
            margin-bottom: 14px;
            background: #fff;
        }
        .letterhead-table { width: 100%; border-collapse: collapse; }
        .letterhead-table td { border: none; vertical-align: middle; padding: 8px 10px 4px; }
        .letterhead-side { width: 72px; }
        .letterhead-left { text-align: left; }
        .letterhead-right { text-align: right; }
        .letterhead-logo-img { width: 56px; height: 56px; object-fit: contain; display: inline-block; }
        .letterhead-center { text-align: center; }
        .letterhead-agency {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 5px;
            color: #1a3d6b;
            line-height: 1;
        }
        .letterhead-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #1a3d6b;
            margin-top: 3px;
        }
        .letterhead-sub {
            font-size: 9.5px;
            font-weight: 600;
            color: #475569;
            margin-top: 2px;
        }
        .letterhead-banner {
            background: #1a3d6b;
            color: #fff;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            padding: 5px 8px;
        }
        .letterhead-meta {
            text-align: center;
            font-size: 10px;
            font-weight: 600;
            color: #334155;
            padding: 4px 8px 2px;
            border-bottom: 1px solid #cbd5e1;
        }
        .letterhead-qr {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 6px 8px 8px;
            border-top: 1px dashed #cbd5e1;
        }
        .letterhead-qr-box svg { width: 52px; height: 52px; display: block; }
        .letterhead-qr-caption {
            font-family: Consolas, monospace;
            font-size: 9px;
            font-weight: 700;
            color: #1a3d6b;
        }

        /* Highlights grid */
        .highlights-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-bottom: 14px;
        }
        .highlight-card {
            border: 1px solid #94a3b8;
            border-radius: 4px;
            padding: 6px 8px;
            background: #f8fafc;
            min-height: 52px;
        }
        .highlight-card .label {
            font-size: 8.5px;
            font-weight: 600;
            color: #475569;
            line-height: 1.25;
            min-height: 22px;
        }
        .highlight-card .value {
            font-size: 18px;
            font-weight: 800;
            color: #1a3d6b;
            text-align: center;
            margin-top: 4px;
        }

        /* Sections */
        .report-section {
            margin-bottom: 12px;
            page-break-inside: avoid;
        }
        .section-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 12px;
            background: #e2e8f0;
            border: 1px solid #94a3b8;
            border-bottom: none;
            padding: 5px 8px;
        }
        .section-head h3 {
            margin: 0;
            font-size: 10.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
        }
        .section-head .zone {
            font-size: 9px;
            font-style: italic;
            color: #475569;
            white-space: nowrap;
        }

        /* Data tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin: 0;
        }
        .data-table thead { display: table-header-group; }
        .data-table th,
        .data-table td {
            border: 1px solid #64748b;
            padding: 4px 5px;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: anywhere;
        }
        .data-table th {
            background: #f1f5f9;
            font-size: 8px;
            font-weight: 700;
            text-align: center;
            line-height: 1.2;
            text-transform: uppercase;
        }
        .data-table td {
            font-size: 9px;
        }
        .data-table tbody tr:nth-child(even) td { background: #fafafa; }
        .col-sr { width: 3%; text-align: center; }
        .col-xs { width: 5%; }
        .col-sm { width: 7%; }
        .col-md { width: 9%; }
        .col-lg { width: 14%; }
        .col-xl { width: 18%; }
        .col-num { text-align: center; }
        .nil-row td {
            text-align: center;
            font-weight: 700;
            font-size: 10px;
            padding: 10px;
            color: #64748b;
            background: #f8fafc !important;
        }

        .summary-table { width: 48%; margin-top: 4px; }
        .summary-table th { width: 65%; text-align: left; }
    </style>
</head>
<body>
@php
    $h = $report->highlights ?? [];
    $p = $report->payload ?? [];
    $pad = fn($n) => str_pad((string)($n ?? 0), 2, '0', STR_PAD_LEFT);
    $highlights = [
        ['Cases', $h['cases'] ?? 0],
        ['Enquiries Registered', $h['enquiries_registered'] ?? 0],
        ['Enquiries Closed', $h['enquiries_closed'] ?? 0],
        ['Accused in Lockup', $h['accused_in_lockup'] ?? 0],
        ['Fresh Accused Arrested', $h['fresh_arrests'] ?? 0],
        ['Bail (Pre/Post Arrest)', $h['bail'] ?? 0],
        ['Old Accused Arrested', $h['old_accused_arrested'] ?? 0],
        ['Conviction', $h['conviction'] ?? 0],
    ];
@endphp

<p class="no-print"><button onclick="window.print()">Print / Save PDF</button></p>

@include('exports.partials.nccia-official-header', [
    'qrType' => 'dsr_report',
    'qrId' => $report->id,
    'qrCaption' => 'DSR-' . $report->id,
    'documentSubtitle' => 'Daily Situation Report (DSR) — ' . strtoupper($report->unit_name),
    'documentMeta' => 'Dated ' . $report->report_date->format('d.m.Y') . ' · Circle: ' . ($report->circle?->name ?? '—'),
])

<div class="highlights-grid">
    @foreach($highlights as [$label, $value])
        <div class="highlight-card">
            <div class="label">{{ $label }}</div>
            <div class="value">{{ $pad($value) }}</div>
        </div>
    @endforeach
</div>

<div class="report-section">
    <div class="section-head">
        <h3>Enquiries Registered ({{ $pad(count($p['enquiries_registered'] ?? [])) }})</h3>
        <span class="zone">Zone: {{ $report->unit_name }}</span>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-md">Enquiry No.<br>&amp; Dated</th>
                <th class="col-sm">Complainant</th>
                <th class="col-xs">Circle</th>
                <th class="col-sm">E.O.</th>
                <th class="col-xl">Gist of Allegations</th>
                <th class="col-lg">Accused / BPS</th>
                <th class="col-sm">Amount<br>Involved</th>
                <th class="col-sm">Amount<br>Recovered</th>
                <th class="col-xs">CMS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['enquiries_registered'] ?? [] as $i => $row)
                <tr>
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td>{{ trim(($row['enquiry_number'] ?? '') . ' ' . ($row['dated'] ?? '')) }}</td>
                    <td>{{ $row['complainant'] ?? '' }}</td>
                    <td>{{ $row['circle'] ?? '' }}</td>
                    <td>{{ $row['eo_name'] ?? '' }}</td>
                    <td>{{ $row['gist'] ?? '' }}</td>
                    <td>{{ $row['accused'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_involved'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_recovered'] ?? 'NIL' }}</td>
                    <td class="col-num">{{ $row['cms_entered'] ?? '' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="10">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head">
        <h3>Enquiries Closed ({{ $pad(count($p['enquiries_closed'] ?? [])) }})</h3>
        <span class="zone">Zone: {{ $report->unit_name }}</span>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-md">Enquiry No.<br>&amp; Dated</th>
                <th class="col-sm">Complainant</th>
                <th class="col-xs">Circle</th>
                <th class="col-sm">E.O.</th>
                <th class="col-lg">Gist</th>
                <th class="col-md">Accused / BPS</th>
                <th class="col-sm">Amount</th>
                <th class="col-sm">Recovered</th>
                <th class="col-sm">Closure Reason</th>
                <th class="col-xs">CMS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['enquiries_closed'] ?? [] as $i => $row)
                <tr>
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td>{{ trim(($row['enquiry_number'] ?? '') . ' ' . ($row['dated'] ?? '')) }}</td>
                    <td>{{ $row['complainant'] ?? '' }}</td>
                    <td>{{ $row['circle'] ?? '' }}</td>
                    <td>{{ $row['eo_name'] ?? '' }}</td>
                    <td>{{ $row['gist'] ?? '' }}</td>
                    <td>{{ $row['accused'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_involved'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_recovered'] ?? 'NIL' }}</td>
                    <td>{{ $row['closure_reason'] ?? '' }}</td>
                    <td class="col-num">{{ $row['cms_entered'] ?? '' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="11">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head">
        <h3>FIR / Case Registered ({{ $pad(count($p['cases_registered'] ?? [])) }})</h3>
        <span class="zone">Zone: {{ $report->unit_name }}</span>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-sm">Enquiry No.</th>
                <th class="col-lg">FIR No. / Date / U/S</th>
                <th class="col-xs">Circle</th>
                <th class="col-sm">I.O.</th>
                <th class="col-lg">Gist</th>
                <th class="col-md">Accused</th>
                <th class="col-xs">Amt</th>
                <th class="col-xs">Rec.</th>
                <th class="col-xs">Tot</th>
                <th class="col-xs">Arr</th>
                <th class="col-xs">N/A</th>
                <th class="col-xs">Bail</th>
                <th class="col-xs">CMS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['cases_registered'] ?? [] as $i => $row)
                <tr>
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td>{{ $row['enquiry_no'] ?? '' }}</td>
                    <td>{{ $row['fir_no_dated_sections'] ?? $row['fir_no'] ?? '' }}</td>
                    <td>{{ $row['circle'] ?? '' }}</td>
                    <td>{{ $row['io_name'] ?? '' }}</td>
                    <td>{{ $row['gist'] ?? '' }}</td>
                    <td>{{ $row['accused'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_involved'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_recovered'] ?? 'NIL' }}</td>
                    <td class="col-num">{{ $row['total_accused'] ?? 0 }}</td>
                    <td class="col-num">{{ $row['accused_arrested'] ?? 0 }}</td>
                    <td class="col-num">{{ $row['accused_not_arrested'] ?? 0 }}</td>
                    <td class="col-num">{{ $row['accused_on_bail'] ?? 0 }}</td>
                    <td class="col-num">{{ $row['cms_entered'] ?? '' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="14">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head">
        <h3>FIR Disposed Off ({{ $pad(count($p['cases_disposed'] ?? [])) }})</h3>
        <span class="zone">Zone: {{ $report->circle?->name ?? 'Lahore' }}</span>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-lg">FIR No. / Date / U/S</th>
                <th class="col-xs">Circle</th>
                <th class="col-sm">I.O.</th>
                <th class="col-lg">Gist</th>
                <th class="col-md">Accused</th>
                <th class="col-xs">Amt</th>
                <th class="col-xs">Tot</th>
                <th class="col-sm">Disposal</th>
                <th class="col-xs">Arr</th>
                <th class="col-xs">N/A</th>
                <th class="col-xs">Bail</th>
                <th class="col-md">Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['cases_disposed'] ?? [] as $i => $row)
                <tr>
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td>{{ $row['fir_no_dated_sections'] ?? $row['fir_no'] ?? '' }}</td>
                    <td>{{ $row['circle'] ?? '' }}</td>
                    <td>{{ $row['io_name'] ?? '' }}</td>
                    <td>{{ $row['gist'] ?? '' }}</td>
                    <td>{{ $row['accused'] ?? '' }}</td>
                    <td class="col-num">{{ $row['amount_involved'] ?? '' }}</td>
                    <td class="col-num">{{ $row['total_accused'] ?? 0 }}</td>
                    <td>{{ $row['reason'] ?? '' }}</td>
                    <td class="col-num">{{ $row['accused_arrested'] ?? 0 }}</td>
                    <td class="col-num">{{ $row['accused_not_arrested'] ?? 0 }}</td>
                    <td class="col-num">{{ $row['accused_on_bail'] ?? 0 }}</td>
                    <td>{{ $row['disposal_detail'] ?? $row['reason'] ?? '' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="13">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head">
        <h3>Accused / PO / CA Arrested ({{ $pad(count($p['arrests'] ?? [])) }})</h3>
        <span class="zone">Zone: {{ $report->unit_name }}</span>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-sm">Circle</th>
                <th class="col-lg">Name of Accused, S/O</th>
                <th class="col-md">CNIC / PP No.</th>
                <th class="col-sm">Phone</th>
                <th class="col-md">FIR No. &amp; Date</th>
                <th class="col-sm">U/S</th>
                <th class="col-xs">Lockup</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['arrests'] ?? [] as $i => $row)
                <tr>
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td>{{ $row['circle'] ?? '' }}</td>
                    <td>{{ $row['accused_so'] ?? $row['accused_name'] ?? '' }}</td>
                    <td>{{ $row['cnic'] ?? '' }}</td>
                    <td>{{ $row['phone'] ?? '' }}</td>
                    <td>{{ $row['fir_no_date'] ?? '' }}</td>
                    <td>{{ $row['sections'] ?? '' }}</td>
                    <td class="col-num">{{ $row['in_lockup'] ?? '' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="8">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head">
        <h3>Accused in Lockup ({{ $pad(count($p['lockup_list'] ?? [])) }})</h3>
        <span class="zone">Zone: {{ $report->unit_name }}</span>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-sm">Circle</th>
                <th class="col-lg">Name of Accused, S/O</th>
                <th class="col-md">CNIC / PP No.</th>
                <th class="col-sm">Phone</th>
                <th class="col-md">FIR No. &amp; Date</th>
                <th class="col-sm">U/S</th>
                <th class="col-xs">Lockup</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['lockup_list'] ?? [] as $i => $row)
                <tr>
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td>{{ $row['circle'] ?? '' }}</td>
                    <td>{{ $row['accused_so'] ?? '' }}</td>
                    <td>{{ $row['cnic'] ?? '' }}</td>
                    <td>{{ $row['phone'] ?? '' }}</td>
                    <td>{{ $row['fir_no_date'] ?? '' }}</td>
                    <td>{{ $row['sections'] ?? '' }}</td>
                    <td class="col-num">{{ $row['in_lockup'] ?? 'Yes' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="8">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head">
        <h3>Bail Status (Pre-Arrest / Post-Arrest) ({{ $pad(count($p['bail_records'] ?? [])) }})</h3>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-sr">Sr</th>
                <th class="col-lg">Police Station</th>
                <th class="col-lg">Accused Name</th>
                <th class="col-md">FIR No.</th>
                <th class="col-md">Court</th>
                <th class="col-md">Bail Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($p['bail_records'] ?? [] as $row)
                <tr>
                    <td class="col-num">{{ $row['sr'] ?? '' }}</td>
                    <td>{{ $row['police_station'] ?? '' }}</td>
                    <td>{{ $row['accused_name'] ?? '' }}</td>
                    <td>{{ $row['fir_no'] ?? '' }}</td>
                    <td>{{ $row['court'] ?? '' }}</td>
                    <td>{{ $row['bail_status'] ?? '' }}</td>
                </tr>
            @empty
                <tr class="nil-row"><td colspan="6">NIL</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

@php $pc = ($p['progress_cases_official'] ?? [])[0] ?? []; @endphp
<div class="report-section">
    <div class="section-head"><h3>Progress of Cases (as on {{ $report->report_date->format('d.m.Y') }})</h3></div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Unit</th><th>Previous</th><th>Added {{ $report->report_date->year - 1 }}</th><th>Added {{ $report->report_date->year }}</th>
                <th>Total</th><th>Disposed</th><th>Pending</th><th>&lt; 6 Mo</th><th>&gt; 6 Mo</th><th>Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $pc['unit'] ?? $report->unit_name }}</td>
                <td class="col-num">{{ $pc['previous'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['added_prev'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['added_curr'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['total'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['disposed'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['pending'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['less_than_6'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['more_than_6'] ?? 0 }}</td>
                <td class="col-num">{{ $pc['balance'] ?? 0 }}</td>
            </tr>
        </tbody>
    </table>
</div>

@php $pe = ($p['progress_enquiries_official'] ?? [])[0] ?? []; @endphp
<div class="report-section">
    <div class="section-head"><h3>Progress of Enquiries (as on {{ $report->report_date->format('d.m.Y') }})</h3></div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Unit</th><th>Previous</th><th>Added {{ $report->report_date->year - 1 }}</th><th>Added {{ $report->report_date->year }}</th>
                <th>Total</th><th>Disposed</th><th>Pending</th><th>&lt; 3 Mo</th><th>&gt; 3 Mo</th><th>Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $pe['unit'] ?? $report->unit_name }}</td>
                <td class="col-num">{{ $pe['previous'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['added_prev'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['added_curr'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['total'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['disposed'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['pending'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['less_than_3'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['more_than_3'] ?? 0 }}</td>
                <td class="col-num">{{ $pe['balance'] ?? 0 }}</td>
            </tr>
        </tbody>
    </table>
</div>

@php $pos = $p['po_ca_summary']['pos'] ?? []; $cas = $p['po_ca_summary']['cas'] ?? []; @endphp
<div class="report-section">
    <div class="section-head"><h3>Arrest of POs &amp; CAs (Up to Date)</h3></div>
    <table class="data-table">
        <thead>
            <tr>
                <th rowspan="2">Unit</th>
                <th colspan="2">Previous Balance</th>
                <th colspan="2">Added Today</th>
                <th colspan="2">Total</th>
                <th colspan="2">Arrested</th>
                <th colspan="2">Pending</th>
            </tr>
            <tr>
                <th>PO</th><th>CA</th>
                <th>PO</th><th>CA</th>
                <th>PO</th><th>CA</th>
                <th>PO</th><th>CA</th>
                <th>PO</th><th>CA</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $report->unit_name }}</td>
                <td class="col-num">{{ $pos['previous'] ?? 0 }}</td><td class="col-num">{{ $cas['previous'] ?? 0 }}</td>
                <td class="col-num">{{ $pos['added'] ?? 0 }}</td><td class="col-num">{{ $cas['added'] ?? 0 }}</td>
                <td class="col-num">{{ ($pos['previous'] ?? 0) + ($pos['added'] ?? 0) }}</td><td class="col-num">{{ ($cas['previous'] ?? 0) + ($cas['added'] ?? 0) }}</td>
                <td class="col-num">{{ $pos['arrested'] ?? 0 }}</td><td class="col-num">{{ $cas['arrested'] ?? 0 }}</td>
                <td class="col-num">{{ $pos['pending'] ?? 0 }}</td><td class="col-num">{{ $cas['pending'] ?? 0 }}</td>
            </tr>
        </tbody>
    </table>
</div>

<div class="report-section">
    <div class="section-head"><h3>Summary</h3></div>
    <table class="data-table summary-table">
        <tbody>
            <tr><th>Cases Registered</th><td class="col-num">{{ $p['summary']['total_cases_registered'] ?? 0 }}</td></tr>
            <tr><th>Enquiries Registered</th><td class="col-num">{{ $p['summary']['total_enquiries_registered'] ?? 0 }}</td></tr>
            <tr><th>Accused in Lockup</th><td class="col-num">{{ $p['summary']['accused_in_lockup'] ?? ($h['accused_in_lockup'] ?? 0) }}</td></tr>
            <tr><th>Arrested (Today)</th><td class="col-num">{{ $p['summary']['total_arrests'] ?? 0 }}</td></tr>
            <tr><th>Arrested POs</th><td class="col-num">{{ $p['summary']['arrested_pos'] ?? 0 }}</td></tr>
            <tr><th>Arrested CAs</th><td class="col-num">{{ $p['summary']['arrested_cas'] ?? 0 }}</td></tr>
            <tr><th>Notes ({{ $report->report_date->format('j M Y') }})</th><td>{{ $report->notes ?: 'NIL' }}</td></tr>
        </tbody>
    </table>
</div>

</body>
</html>
