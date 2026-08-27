<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }} Verification — NCCIA</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #f2f4f8; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
        .card { background: #fff; border-radius: 12px; max-width: 480px; width: 100%; box-shadow: 0 12px 40px rgba(0,0,0,0.12); overflow: hidden; }
        .head { background: #015C94; color: #fff; padding: 18px 22px; text-align: center; }
        .head img { height: 54px; }
        .head .org { font-weight: 700; margin-top: 6px; font-size: 13px; }
        .body { padding: 22px; }
        .badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; background: #e6f7ec; color: #18794e; }
        .doc-type { font-size: 15px; font-weight: 800; text-align: center; margin: 10px 0 14px; color: #0f172a; }
        .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eef0f3; font-size: 14px; }
        .row .k { color: #64748b; font-weight: 600; flex-shrink: 0; }
        .row .v { color: #0f172a; text-align: right; font-weight: 600; word-break: break-word; }
        .foot { padding: 14px 22px; background: #f8fafc; font-size: 12px; color: #64748b; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="head">
            <img src="{{ asset('images/NCCIA.webp') }}" alt="NCCIA">
            <div class="org">National Cyber Crime Investigation Agency (NCCIA)</div>
        </div>
        <div class="body">
            <div style="text-align:center; margin-bottom: 6px;">
                <span class="badge">✓ Authentic NCCIA Document</span>
            </div>
            <div class="doc-type">{{ $title }}</div>
            @foreach($rows as $row)
                <div class="row"><span class="k">{{ $row['k'] }}</span><span class="v">{{ $row['v'] }}</span></div>
            @endforeach
        </div>
        <div class="foot">This document was issued by NCCIA. Scan result confirms authenticity. For queries, contact the concerned circle office.</div>
    </div>
</body>
</html>
