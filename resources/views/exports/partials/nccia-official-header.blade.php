@php
    /** @var string $qrType */
    /** @var int|string $qrId */
    /** @var string $documentSubtitle */
    /** @var string|null $qrCaption */

    $branding = app(\App\Services\ReportBrandingService::class);
    $qrService = app(\App\Services\QrService::class);

    $ncciaLogo = $branding->ncciaLogoDataUri();
    $moiLogo = $branding->ministryLogoDataUri();
    $qrCaption = $qrCaption ?? strtoupper((string) $qrType) . '-' . $qrId;
    $qrSvg = $qrService->svgMarkup($qrService->verifyUrl($qrType, $qrId));
@endphp

<table class="nccia-official-header" style="width:100%; border-collapse:collapse; border-bottom:2px solid #000; margin-bottom:12px;">
    <tr>
        <td style="width:88px; vertical-align:middle; text-align:left; border:none; padding:0 8px 8px 0;">
            @if($ncciaLogo)
                <img src="{{ $ncciaLogo }}" alt="NCCIA" style="width:52px; height:52px; object-fit:contain; display:block;">
            @endif
            @if($qrSvg)
                <div style="margin-top:4px; width:64px;">{!! $qrSvg !!}</div>
                <div style="font-family:monospace; font-size:8px; font-weight:bold; margin-top:2px; text-align:center; line-height:1.2;">{{ $qrCaption }}</div>
            @endif
        </td>
        <td style="vertical-align:middle; text-align:center; border:none; padding:0 8px 8px 8px;">
            <div style="font-size:22px; font-weight:800; letter-spacing:4px; line-height:1.1; color:#1a3d6b;">NCCIA</div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; margin-top:2px; color:#1a3d6b;">National Cyber Crime Investigation Agency</div>
            <div style="font-size:10px; font-weight:600; margin-top:1px; color:#334155;">Ministry of Interior &bull; Government of Pakistan</div>
            <div style="font-size:11.5px; font-weight:600; margin-top:4px; color:#0f172a;">{{ $documentSubtitle }}</div>
        </td>
        <td style="width:88px; vertical-align:middle; text-align:right; border:none; padding:0 0 8px 8px;">
            @if($moiLogo)
                <img src="{{ $moiLogo }}" alt="Ministry of Interior" style="width:52px; height:52px; object-fit:contain; display:inline-block;">
            @endif
        </td>
    </tr>
</table>
