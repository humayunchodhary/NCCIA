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
        .nccia-official-header svg { width: 64px; height: 64px; display: block; }
    </style>
</head>
<body>
    @include('exports.partials.nccia-official-header', [
        'qrType' => 'do_letter',
        'qrId' => $letter->id,
        'qrCaption' => 'DO-' . $letter->id,
        'documentSubtitle' => 'D.O. Letter for the Month of ' . strtoupper($letter->month_label) . ' (' . ($letter->circle?->name ?? 'Circle') . ')',
    ])

    <p style="text-align:center; margin:0 0 12px;"><strong>Status:</strong> {{ str_replace('_', ' ', $letter->status) }}</p>

    @php $p = $letter->payload ?? []; @endphp

    <h3>1. Cases</h3>
    <table>
        <tr><th>At beginning</th><th>Added</th><th>Total</th><th>Interim Challan</th><th>Final Challan</th><th>Discharge</th><th>Transferred</th><th>Pending</th></tr>
        <tr>
            <td>{{ $p['cases']['at_beginning'] ?? 0 }}</td>
            <td>{{ $p['cases']['added'] ?? 0 }}</td>
            <td>{{ $p['cases']['total'] ?? 0 }}</td>
            <td>{{ $p['cases']['interim_challan'] ?? 0 }}</td>
            <td>{{ $p['cases']['final_challan'] ?? 0 }}</td>
            <td>{{ $p['cases']['discharge'] ?? 0 }}</td>
            <td>{{ $p['cases']['transferred'] ?? 0 }}</td>
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

    <h3>4. Raids</h3>
    <table>
        <tr><th>Total raids</th><th>Cases after raid</th><th>Enquiries after raid</th></tr>
        <tr>
            <td>{{ $p['raid']['total_raid'] ?? 0 }}</td>
            <td>{{ $p['raid']['cases_after_raid'] ?? 0 }}</td>
            <td>{{ $p['raid']['enquiries_after_raid'] ?? 0 }}</td>
        </tr>
    </table>

    <h3>5. Proclaimed Offenders (PO)</h3>
    <table>
        <tr><th>Previous</th><th>Added</th><th>Arrested</th><th>Pending</th></tr>
        <tr>
            <td>{{ $p['pos']['previous'] ?? 0 }}</td>
            <td>{{ $p['pos']['added'] ?? 0 }}</td>
            <td>{{ $p['pos']['arrested'] ?? 0 }}</td>
            <td>{{ $p['pos']['pending'] ?? 0 }}</td>
        </tr>
    </table>

    <h3>6. Court Absconders (CA)</h3>
    <table>
        <tr><th>Previous</th><th>Added</th><th>Arrested</th><th>Pending</th></tr>
        <tr>
            <td>{{ $p['cas']['previous'] ?? 0 }}</td>
            <td>{{ $p['cas']['added'] ?? 0 }}</td>
            <td>{{ $p['cas']['arrested'] ?? 0 }}</td>
            <td>{{ $p['cas']['pending'] ?? 0 }}</td>
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
