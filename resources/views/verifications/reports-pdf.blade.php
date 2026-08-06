<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verification Report - {{ $report->tracking_no }}</title>
  <style>
    @page { margin: 14mm 12mm; }
    body {
      font-family: 'DejaVu Sans', sans-serif;
      font-size: 9.5pt;
      color: #1a1a1a;
      line-height: 1.5;
      border: 2px solid #1a3d6b;
      padding: 8px 10px;
    }
    .watermark {
      position: fixed;
      top: 35%;
      left: 6%;
      right: 6%;
      text-align: center;
      font-size: 52pt;
      font-weight: bold;
      color: rgba(0, 40, 80, 0.05);
      text-transform: uppercase;
      letter-spacing: 14px;
      z-index: -1;
      line-height: 1.7;
    }
    .top-header-table {
      width: 100%;
      margin-bottom: 6px;
    }
    .top-header-table td {
      vertical-align: middle;
      padding: 0;
    }
    .top-logo {
      width: 60px;
      text-align: left;
    }
    .top-logo img {
      width: 60px;
      height: auto;
    }
    .top-right-logo {
      width: 60px;
      text-align: right;
    }
    .top-right-logo img {
      width: 60px;
      height: auto;
    }
    .top-header-text {
      text-align: center;
    }
    .top-header-text .govt-line {
      font-size: 10pt;
      font-weight: bold;
      color: #1a3d6b;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .top-header-text .govt-sub {
      font-size: 7.5pt;
      color: #555;
      margin-top: 1px;
    }
    .agency-bar {
      text-align: center;
      margin-bottom: 8px;
    }
    .agency-bar .agency-name {
      font-size: 12pt;
      font-weight: bold;
      color: #1a3d6b;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .agency-bar .branch-name {
      font-size: 10pt;
      font-weight: bold;
      color: #1a1a1a;
      margin: 1px 0 0;
    }
    .agency-bar .branch-sub {
      font-size: 7pt;
      color: #666;
      margin: 0;
    }
    .report-title {
      text-align: center;
      border-top: 2px solid #1a3d6b;
      border-bottom: 2px solid #1a3d6b;
      padding: 5px 0;
      margin-bottom: 12px;
    }
    .report-title h1 {
      font-size: 11pt;
      margin: 0;
      color: #1a3d6b;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .report-title p {
      font-size: 7.5pt;
      color: #555;
      margin: 1px 0 0;
    }
    .section {
      margin-bottom: 9px;
    }
    .section-title {
      font-size: 9pt;
      font-weight: bold;
      color: #fff;
      background: #1a3d6b;
      padding: 3px 8px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 5px;
    }
    table.data {
      width: 100%;
      border-collapse: collapse;
    }
    table.data td {
      padding: 2.5px 6px;
      font-size: 8.5pt;
      vertical-align: top;
    }
    table.data td.label {
      font-weight: bold;
      width: 155px;
      color: #333;
      border-bottom: 1px dotted #ddd;
    }
    table.data td.value {
      border-bottom: 1px dotted #ddd;
    }
    table.data tr:last-child td {
      border-bottom: none;
    }
    .accused-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      border: 1px solid #ccc;
    }
    .accused-table td {
      padding: 2px 6px;
      font-size: 8.5pt;
      vertical-align: top;
      border-bottom: 1px solid #eee;
    }
    .accused-table td.label {
      font-weight: bold;
      width: 140px;
      color: #444;
      background: #f5f5f5;
    }
    .badge {
      display: inline-block;
      padding: 1px 10px;
      font-size: 8pt;
      background: #e8f0fe;
      color: #1a3d6b;
      border: 1px solid #1a3d6b;
    }
    .sig-table {
      width: 100%;
      margin-top: 28px;
    }
    .sig-table td {
      vertical-align: bottom;
      padding: 0;
    }
    .sig-box {
      text-align: center;
    }
    .sig-box .sig-label {
      font-size: 7.5pt;
      color: #555;
      margin-bottom: 2px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sig-box .sig-stamp {
      margin-bottom: 2px;
    }
    .sig-box .sig-stamp img {
      max-height: 45px;
    }
    .sig-box .sig-line {
      border-top: 1.5px solid #1a3d6b;
      margin: 32px auto 0;
      width: 250px;
    }
    .sig-box .sig-name {
      font-weight: bold;
      font-size: 9.5pt;
      color: #1a3d6b;
      margin-top: 5px;
    }
    .sig-box .sig-desig {
      font-size: 8pt;
      color: #2b2b2b;
    }
    .sig-box .sig-branch {
      font-size: 7.5pt;
      color: #555;
    }
    .sig-box .sig-nccia {
      font-size: 7.5pt;
      font-weight: bold;
      color: #1a3d6b;
    }
    .sig-box .sig-date {
      font-size: 7.5pt;
      color: #777;
      margin-top: 2px;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 6.5pt;
      color: #999;
      border-top: 1px solid #ccc;
      padding-top: 2px;
    }
  </style>
</head>
<body>

<div class="watermark">
  NCCIA<br>GOVERNMENT OF PAKISTAN
</div>

<table class="top-header-table">
  <tr>
    <td class="top-logo">
      <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('images/images.jpg'))) }}" alt="NCCIA Logo">
    </td>
    <td class="top-header-text">
      <div class="govt-line">Government of Pakistan</div>
      <div class="govt-sub">Ministry of Interior</div>
    </td>
    <td class="top-right-logo">
      <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/pak-govt-logo.png'))) }}" alt="Government of Pakistan">
    </td>
  </tr>
</table>

<div class="agency-bar">
  <div class="agency-name">National Cyber Crime Investigation Agency</div>
  <div class="branch-name">{{ $report->creator?->circle?->name ?? 'NCCIA Circle' }}</div>
  <div class="branch-sub">{{ $report->creator?->circle?->city ?? 'Pakistan' }}</div>
</div>

<div class="report-title">
  <h1>Victim Verification Report</h1>
  <p>Report No: <strong>{{ $report->tracking_no }}</strong></p>
</div>

<div class="section">
  <div class="section-title">1. Tracking Information</div>
  <table class="data">
    <tr><td class="label">Tracking No</td><td class="value">{{ $report->tracking_no }}</td></tr>
    <tr><td class="label">Assignment Date</td><td class="value">{{ $report->assignment_date?->format('d M Y') ?? '—' }}</td></tr>
    <tr><td class="label">Verification Date</td><td class="value">{{ $report->verification_date?->format('d M Y') ?? '—' }}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">2. Victim Details</div>
  <table class="data">
    <tr><td class="label">Full Name</td><td class="value">{{ $report->victim_name }}</td></tr>
    <tr><td class="label">Father / Husband Name</td><td class="value">{{ $report->victim_father_name ?? '—' }}</td></tr>
    <tr><td class="label">Occupation</td><td class="value">{{ $report->victim_occupation ?? '—' }}</td></tr>
    <tr><td class="label">Gender</td><td class="value">{{ ucfirst($report->victim_gender ?? '—') }}</td></tr>
    <tr><td class="label">CNIC Number</td><td class="value">{{ $report->victim_cnic }}</td></tr>
    <tr><td class="label">Contact Number</td><td class="value">{{ $report->victim_country_code ?? '+92' }} {{ $report->victim_phone }}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">3. Crime Details</div>
  <table class="data">
    <tr><td class="label">Crime Category</td><td class="value"><span class="badge">{{ $report->crime_category }}</span></td></tr>
    <tr><td class="label">City / District</td><td class="value">{{ $report->city }}</td></tr>
    @if($report->crime_description)
    <tr><td class="label">Crime Description</td><td class="value">{{ $report->crime_description }}</td></tr>
    @endif
  </table>
</div>

<div class="section">
  <div class="section-title">4. Accused Details</div>
  <table class="data">
    <tr><td class="label">Accused Known</td><td class="value">{{ $report->accused_known ? 'Yes' : 'No' }}</td></tr>
  </table>
  @if($report->accused_known && $report->accused)
    @foreach($report->accused as $i => $a)
      <table class="accused-table">
        <tr><td class="label">Accused #{{ $i + 1 }} Name</td><td>{{ $a['name'] ?? '—' }}</td></tr>
        <tr><td class="label">Father Name</td><td>{{ $a['father_name'] ?? '—' }}</td></tr>
        <tr><td class="label">Phone</td><td>{{ $a['phone'] ?? '—' }}</td></tr>
        <tr><td class="label">CNIC</td><td>{{ $a['cnic'] ?? '—' }}</td></tr>
        <tr><td class="label">Address</td><td>{{ $a['address'] ?? '—' }}</td></tr>
      </table>
    @endforeach
  @else
    <p style="font-size:8pt;color:#888;margin:3px 0;">No accused details provided.</p>
  @endif
</div>

@if($report->recommendation_short || $report->recommendation_full)
<div class="section">
  <div class="section-title">5. Recommendations</div>
  <table class="data">
    @if($report->recommendation_short)
    <tr><td class="label">Short Recommendation</td><td class="value">{{ $report->recommendation_short }}</td></tr>
    @endif
    @if($report->recommendation_full)
    <tr><td class="label">Detailed Recommendation</td><td class="value">{{ $report->recommendation_full }}</td></tr>
    @endif
  </table>
</div>
@endif

@if($report->inquiry_no || $report->case_no)
<div class="section">
  <div class="section-title">6. Reference Numbers</div>
  <table class="data">
    @if($report->inquiry_no)
    <tr><td class="label">Inquiry No</td><td class="value">{{ $report->inquiry_no }}</td></tr>
    @endif
    @if($report->case_no)
    <tr><td class="label">Case No</td><td class="value">{{ $report->case_no }}</td></tr>
    @endif
  </table>
</div>
@endif

<table class="sig-table">
  <tr>
    <td width="55%"></td>
    <td width="45%" class="sig-box">
      <div class="sig-label">Verified By</div>
      @if($report->signature && file_exists(storage_path('app/public/' . $report->signature)))
      <div class="sig-stamp">
        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(storage_path('app/public/' . $report->signature))) }}" alt="Digital Signature">
      </div>
      @endif
      <div class="sig-line"></div>
      <div class="sig-name">{{ $report->creator?->name ?? '—' }}</div>
      <div class="sig-desig">{{ $report->creator?->designation ?? 'Investigation Officer' }}</div>
      <div class="sig-branch">{{ $report->creator?->circle?->name ?? 'NCCIA' }}</div>
      <div class="sig-nccia">National Cyber Crime Investigation Agency</div>
      <div class="sig-date">Dated: {{ $report->verification_date?->format('d M Y') ?? now()->format('d M Y') }}</div>
    </td>
  </tr>
</table>

<div class="footer">
  This is a computer-generated document &mdash; Generated on {{ now()->format('d M Y h:i A') }} &mdash; NCCIA Case Management System
</div>

</body>
</html>
