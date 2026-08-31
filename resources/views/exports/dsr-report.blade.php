<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DSR — {{ $report->unit_name }} — {{ $report->report_date->format('d.m.Y') }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 24px; }
        h1, h2, h3 { text-align: center; margin: 8px 0; }
        h3 { text-align: left; margin-top: 18px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
        th { background: #f0f0f0; }
        .meta { text-align: center; margin-bottom: 16px; }
        .nil { font-weight: bold; padding: 8px 0; }
        @media print {
            body { margin: 10mm; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <p class="no-print" style="text-align:right"><button onclick="window.print()">Print / Save PDF</button></p>

    <h1>DAILY SITUATION REPORT (DSR) — {{ $report->unit_name }}</h1>
    <h2>Dated {{ $report->report_date->format('d.m.Y') }}</h2>
    <p class="meta"><strong>Circle:</strong> {{ $report->circle?->name }}</p>

    @php
        $h = $report->highlights ?? [];
        $p = $report->payload ?? [];
    @endphp

    <h3>HIGHLIGHTS</h3>
    <table>
        <tr>
            <td>Cases</td><td><strong>{{ $h['cases'] ?? 0 }}</strong></td>
            <td>Enquiries registered</td><td><strong>{{ $h['enquiries_registered'] ?? 0 }}</strong></td>
        </tr>
        <tr>
            <td>Enquiries closed</td><td><strong>{{ $h['enquiries_closed'] ?? 0 }}</strong></td>
            <td>Accused in Lockup</td><td><strong>{{ $h['accused_in_lockup'] ?? 0 }}</strong></td>
        </tr>
        <tr>
            <td>Number of Fresh Accused Arrested</td><td><strong>{{ $h['fresh_arrests'] ?? 0 }}</strong></td>
            <td>Bail Pre-Arrest / Post Arrest</td><td><strong>{{ $h['bail'] ?? 0 }}</strong></td>
        </tr>
        <tr>
            <td>Old Accused Arrested</td><td><strong>{{ $h['old_accused_arrested'] ?? 0 }}</strong></td>
            <td>Conviction</td><td><strong>{{ $h['conviction'] ?? 0 }}</strong></td>
        </tr>
    </table>

    <h3>Enquiries Registered ({{ count($p['enquiries_registered'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['enquiries_registered'] ?? [], 'columns' => ['enquiry_number','dated','complainant','circle','eo_name','gist','accused','amount_involved','cms_entered']])

    <h3>Enquiries Closed ({{ count($p['enquiries_closed'] ?? []) }})</h3>
    <p><em>Zone: {{ $report->unit_name }}</em></p>
    @include('exports.partials.dsr-table', ['rows' => $p['enquiries_closed'] ?? [], 'columns' => ['enquiry_number','dated','complainant','circle','eo_name','closure_reason','cms_entered']])

    <h3>FIR/Case Registered ({{ count($p['cases_registered'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['cases_registered'] ?? [], 'columns' => ['enquiry_no','fir_no','dated','circle','io_name','gist','accused','amount_involved','cms_entered']])

    <h3>FIR DISPOSED OFF ({{ count($p['cases_disposed'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['cases_disposed'] ?? [], 'columns' => ['fir_no','dated','circle','io_name','reason']])

    <h3>Accused / PO / CA Arrested ({{ count($p['arrests'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['arrests'] ?? [], 'columns' => ['circle','accused_name','cnic','fir_no','arrest_date']])

    <h3>PROGRESS OF CASES (As on {{ $report->report_date->format('d.m.Y') }})</h3>
    <table>
        <thead>
            <tr><th>Unit</th><th>Previous</th><th>Added</th><th>Pending</th><th>As on</th></tr>
        </thead>
        <tbody>
            @forelse(($p['progress_cases'] ?? []) as $row)
                <tr>
                    <td>{{ $report->unit_name }}</td>
                    <td>{{ $row['previous'] ?? 0 }}</td>
                    <td>{{ $row['added'] ?? 0 }}</td>
                    <td>{{ $row['pending'] ?? 0 }}</td>
                    <td>{{ $row['as_on'] ?? $report->report_date->format('d.m.Y') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="nil">NIL</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>PROGRESS OF ENQUIRIES (As on {{ $report->report_date->format('d.m.Y') }})</h3>
    <table>
        <thead>
            <tr><th>Unit</th><th>Previous</th><th>Added</th><th>Pending</th><th>As on</th></tr>
        </thead>
        <tbody>
            @forelse(($p['progress_enquiries'] ?? []) as $row)
                <tr>
                    <td>{{ $report->unit_name }}</td>
                    <td>{{ $row['previous'] ?? 0 }}</td>
                    <td>{{ $row['added'] ?? 0 }}</td>
                    <td>{{ $row['pending'] ?? 0 }}</td>
                    <td>{{ $row['as_on'] ?? $report->report_date->format('d.m.Y') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="nil">NIL</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>SUMMARY</h3>
    <table>
        <tr><td>{{ $report->unit_name }}</td><td>Total</td></tr>
        <tr><td>Cases Registered</td><td>{{ $p['summary']['total_cases_registered'] ?? 0 }}</td></tr>
        <tr><td>Enquiries Registered</td><td>{{ $p['summary']['total_enquiries_registered'] ?? 0 }}</td></tr>
        <tr><td>Arrested alleged</td><td>{{ $p['summary']['total_arrests'] ?? 0 }}</td></tr>
        <tr><td>Highlights dated {{ $report->report_date->format('d.m.Y') }}</td><td>{{ $report->notes ?: 'NIL' }}</td></tr>
    </table>
</body>
</html>
