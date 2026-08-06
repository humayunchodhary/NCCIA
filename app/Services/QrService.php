<?php

namespace App\Services;

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class QrService
{
    /**
     * Render a QR code as an <img>-ready data URI (SVG).
     */
    public function svgDataUri(string $data): string
    {
        $oldReporting = error_reporting();
        error_reporting(E_ALL & ~E_DEPRECATED);

        try {
            $options = new QROptions;
            $options->outputType = QRCode::OUTPUT_MARKUP_SVG;
            $options->scale = 6;
            $options->addQuietzone = true;
            $options->connectPaths = true;

            return (new QRCode($options))->render($data);
        } finally {
            error_reporting($oldReporting);
        }
    }
}
