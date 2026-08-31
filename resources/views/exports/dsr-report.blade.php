<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DSR — {{ $report->unit_name }} — {{ $report->report_date->format('d.m.Y') }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 24px; }
        h1, h2 { text-align: center; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
        th { background: #f0f0f0; }
        .highlights td { font-weight: bold; }
        @media print { body { margin: 10mm; } }
    </style>
</head>
<body>
    <h1>DAILY SITUATION REPORT (DSR) — {{ $report->unit_name }}</h1>
    <h2>Dated {{ $report->report_date->format('d.m.Y') }}</h2>
    <p><strong>Circle:</strong> {{ $report->circle?->name }} | <strong>Status:</strong> {{ str_replace('_', ' ', $report->status) }}</p>

    <h3>Highlights</h3>
    <table class="highlights">
        @php $h = $report->highlights ?? []; @endphp
        <tr><td>Cases</td><td>{{ $h['cases'] ?? 0 }}</td><td>Enquiries Registered</td><td>{{ $h['enquiries_registered'] ?? 0 }}</td></tr>
        <tr><td>Enquiries Closed</td><td>{{ $h['enquiries_closed'] ?? 0 }}</td><td>Fresh Arrests</td><td>{{ $h['fresh_arrests'] ?? 0 }}</td></tr>
    </table>

    @php $p = $report->payload ?? []; @endphp

    <h3>Enquiries Registered ({{ count($p['enquiries_registered'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['enquiries_registered'] ?? [], 'columns' => ['enquiry_number','dated','complainant','circle','eo_name','gist','accused','amount_involved']])

    <h3>Enquiries Closed ({{ count($p['enquiries_closed'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['enquiries_closed'] ?? [], 'columns' => ['enquiry_number','dated','complainant','circle','eo_name','closure_reason']])

    <h3>FIR / Case Registered ({{ count($p['cases_registered'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['cases_registered'] ?? [], 'columns' => ['fir_no','dated','circle','io_name','gist','accused']])

    <h3>Accused Arrested ({{ count($p['arrests'] ?? []) }})</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['arrests'] ?? [], 'columns' => ['accused_name','cnic','fir_no','arrest_date','circle']])

    @if($report->notes)
        <h3>Notes</h3>
        <p>{{ $report->notes }}</p>
    @endif
</body>
</html>
