<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>D.O. Letter — {{ $letter->month_label }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; }
        h1, h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #333; padding: 4px 6px; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>D.O. LETTER FOR THE MONTH OF {{ strtoupper($letter->month_label) }}</h1>
    <h2>({{ $letter->circle?->name }})</h2>
    <p><strong>Status:</strong> {{ str_replace('_', ' ', $letter->status) }}</p>

    @php $p = $letter->payload ?? []; @endphp

    <h3>1. Cases</h3>
    <table>
        <tr><th>At beginning</th><th>Added</th><th>Total</th><th>Final Challan</th><th>Pending</th></tr>
        <tr>
            <td>{{ $p['cases']['at_beginning'] ?? 0 }}</td>
            <td>{{ $p['cases']['added'] ?? 0 }}</td>
            <td>{{ $p['cases']['total'] ?? 0 }}</td>
            <td>{{ $p['cases']['final_challan'] ?? 0 }}</td>
            <td>{{ $p['cases']['pending'] ?? 0 }}</td>
        </tr>
    </table>

    <h3>2. CFR Pendency</h3>
    <table>
        <tr><th>Total CFRs</th><th>Pending Legal</th><th>Pending Forensic</th><th>Under Investigation</th><th>Total Pending</th></tr>
        <tr>
            <td>{{ $p['cfr_pendency']['total_cfrs'] ?? 0 }}</td>
            <td>{{ $p['cfr_pendency']['pending_legal'] ?? 0 }}</td>
            <td>{{ $p['cfr_pendency']['pending_forensic'] ?? 0 }}</td>
            <td>{{ $p['cfr_pendency']['pending_investigation'] ?? 0 }}</td>
            <td>{{ $p['cfr_pendency']['total_pending'] ?? 0 }}</td>
        </tr>
    </table>

    <h3>3. Enquiries</h3>
    <table>
        <tr><th>At beginning</th><th>Added</th><th>Closed</th><th>Pending</th></tr>
        <tr>
            <td>{{ $p['enquiries']['at_beginning'] ?? 0 }}</td>
            <td>{{ $p['enquiries']['added'] ?? 0 }}</td>
            <td>{{ $p['enquiries']['closed'] ?? 0 }}</td>
            <td>{{ $p['enquiries']['pending'] ?? 0 }}</td>
        </tr>
    </table>

    <h3>Accused Arrested in {{ $letter->month_label }}</h3>
    @include('exports.partials.dsr-table', ['rows' => $p['accused_arrested'] ?? [], 'columns' => ['fir_no','accused_name','arrest_date','address']])

    @if($letter->notes)
        <h3>Notes</h3>
        <p>{{ $letter->notes }}</p>
    @endif
</body>
</html>
