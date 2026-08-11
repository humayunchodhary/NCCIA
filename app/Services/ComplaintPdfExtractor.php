<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class ComplaintPdfExtractor
{
    /**
     * @return array{ok: bool, data: array<string, mixed>, used_ocr: bool, page_count: ?int, error: ?string}
     */
    public function extract(string $absolutePdfPath, string $originalFilename): array
    {
        $python = $this->pythonBinary();
        $script = base_path('scripts/nccia_pdf_extract.py');

        if (!is_file($script)) {
            return ['ok' => false, 'data' => [], 'used_ocr' => false, 'page_count' => null, 'error' => 'PDF extract script missing'];
        }

        if ($python) {
            $result = Process::timeout(180)->run([
                $python,
                $script,
                $absolutePdfPath,
            ]);

            if ($result->successful()) {
                $decoded = json_decode(trim($result->output()), true);
                if (is_array($decoded) && empty($decoded['error'])) {
                    $decoded['inquiry_no'] = $decoded['inquiry_no']
                        ?? $this->inquiryRefFromFilename($originalFilename);

                    return [
                        'ok'         => true,
                        'data'       => $decoded,
                        'used_ocr'   => (bool) ($decoded['used_ocr'] ?? false),
                        'page_count' => isset($decoded['page_count']) ? (int) $decoded['page_count'] : null,
                        'error'      => null,
                    ];
                }

                if (is_array($decoded) && !empty($decoded['error'])) {
                    Log::warning('PDF extract script error', ['error' => $decoded['error'], 'file' => $originalFilename]);
                }
            } else {
                Log::warning('PDF extract process failed', [
                    'file'   => $originalFilename,
                    'stderr' => Str::limit($result->errorOutput(), 500),
                ]);
            }
        }

        $fallback = $this->extractWithPhpPatterns($absolutePdfPath, $originalFilename);

        return [
            'ok'         => !empty($fallback),
            'data'       => $fallback,
            'used_ocr'   => false,
            'page_count' => null,
            'error'      => empty($fallback) ? 'Could not extract PDF text. Install Python + pymupdf + tesseract for scanned PDFs.' : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function extractWithPhpPatterns(string $absolutePdfPath, string $originalFilename): array
    {
        $text = $this->readPdfText($absolutePdfPath);
        if ($text === '') {
            return $this->filenameOnlyPayload($originalFilename);
        }

        return $this->parseVerificationReportText($text, $originalFilename);
    }

    private function readPdfText(string $path): string
    {
        $content = @file_get_contents($path);
        if ($content === false) {
            return '';
        }

        $chunks = [];
        if (preg_match_all('/\(([^()\\\\]*(?:\\\\.|[^()\\\\])*)?\)/s', $content, $matches)) {
            foreach ($matches[1] as $part) {
                $part = str_replace(['\\(', '\\)', '\\\\'], ['(', ')', '\\'], $part);
                $chunks[] = $part;
            }
        }

        return trim(preg_replace('/\s+/', ' ', implode(' ', $chunks)) ?? '');
    }

    /**
     * @return array<string, mixed>
     */
    public function parseVerificationReportText(string $text, string $originalFilename): array
    {
        $pick = function (array $patterns) use ($text): ?string {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $text, $m)) {
                    $val = trim(preg_replace('/\s+/', ' ', $m[1]) ?? '');
                    if ($val !== '') {
                        return $val;
                    }
                }
            }

            return null;
        };

        $trackingNo = $pick(['/Tracking\s*No\.?\s*:?\s*([A-Z0-9][A-Z0-9\-\/]+)/i']);
        $fullName = $pick(['/Name\s*:?\s*(.+?)\s+Gender\s*:/is', '/Name\s*:?\s*(.+?)(?:CNIC|$)/is']);
        [$victimName, $fatherName] = $this->splitNameFather($fullName);
        $cnicRaw = $pick(['/CNIC\s*No\.?\s*:?\s*([\d\-]+)/i']);
        $phoneRaw = $pick(['/Mobile\s*Number\s*:?\s*([\d\-]+)/i', '/Contact\s*Details\s*:?\s*([\d\-]+)/i']);

        return array_filter([
            'document_type'        => 'verification_report',
            'tracking_no'          => $trackingNo,
            'verification_date'    => $this->normalizeDate($pick(['/Verification\s*Date\s*:?\s*([\d\-\/]+)/i'])),
            'assignment_date'      => $this->normalizeDate($pick(['/Assignment\s*Date\s*:?\s*([\d\-\/]+)/i'])),
            'victim_name'          => $victimName,
            'victim_father_name'   => $fatherName,
            'victim_gender'        => strtolower($pick(['/Gender\s*:?\s*(Male|Female|Other)/i']) ?? '') ?: null,
            'victim_cnic'          => $this->normalizeCnic($cnicRaw),
            'victim_occupation'    => $pick(['/Occupation\s*:?\s*(.+?)(?:Contact|Mobile|Address|$)/is']),
            'victim_phone'         => $this->normalizePhone($phoneRaw),
            'victim_address'       => $pick(['/Current\s*Address\s*:?\s*(.+?)(?:BRIEF|Brief|RECOMMEND|$)/is']),
            'crime_category'       => $pick(['/BRIEF\s*DESCRIPTION.*?[\n\r]+(.+?)(?:accuse|Accuse|During|$)/is']),
            'crime_description'    => $pick(['/(accuse[d]?\s+defrauded.+?)(?:City|Amount|RECOMMEND|$)/is']),
            'city'                 => $pick(['/City\s*of\s*Occurrence\s*:?\s*(.+?)(?:Complaint|Amount|RECOMMEND|$)/is']),
            'amount_involved'      => $this->normalizeAmount($pick(['/Amount\s*Involved\s*:?\s*([\d,\.]+)/i'])),
            'recommendation_short' => $pick(['/RECOMMENDATIONS\s*:?\s*(.+?)(?:Justification|Reporting Officer|$)/is']),
            'recommendation_full'  => $pick(['/Justification\s*:?\s*(.+?)(?:Reporting Officer|$)/is']),
            'recommendation'       => $this->mapRecommendation($text),
            'inquiry_no'           => $this->inquiryRefFromFilename($originalFilename),
            'source_filename'      => $originalFilename,
            'raw_text_preview'     => Str::limit($text, 2000),
        ], fn ($v) => $v !== null && $v !== '');
    }

    /**
     * @return array<string, mixed>
     */
    private function filenameOnlyPayload(string $originalFilename): array
    {
        return array_filter([
            'document_type'   => 'verification_report',
            'inquiry_no'      => $this->inquiryRefFromFilename($originalFilename),
            'source_filename' => $originalFilename,
            'confidence_score'=> 0,
        ]);
    }

    public function inquiryRefFromFilename(string $filename): ?string
    {
        $stem = pathinfo($filename, PATHINFO_FILENAME);
        if (preg_match('/^(\d+)-(\d+)$/', $stem, $m)) {
            return "E/{$m[1]}/{$m[2]}";
        }
        if (preg_match('/^E[\/\-]?(\d+)[\/\-](\d+)$/i', $stem, $m)) {
            return "E/{$m[1]}/{$m[2]}";
        }

        return null;
    }

    private function pythonBinary(): ?string
    {
        $configured = env('PDF_EXTRACT_PYTHON');
        if ($configured && is_executable($configured)) {
            return $configured;
        }

        foreach (['python3', 'python', 'py'] as $bin) {
            $probe = Process::run([$bin, '--version']);
            if ($probe->successful()) {
                return $bin;
            }
        }

        return null;
    }

    public function normalizeCnic(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }
        $digits = preg_replace('/\D/', '', $raw);
        if (strlen($digits) !== 13) {
            return trim($raw) ?: null;
        }

        return substr($digits, 0, 5) . '-' . substr($digits, 5, 7) . '-' . substr($digits, 12, 1);
    }

    private function normalizePhone(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }
        $digits = preg_replace('/\D/', '', $raw);
        if (str_starts_with($digits, '92') && strlen($digits) > 10) {
            $digits = substr($digits, 2);
        }
        if (strlen($digits) === 10) {
            $digits = '0' . $digits;
        }

        return $digits ?: null;
    }

    private function normalizeAmount(?string $raw): ?float
    {
        if (!$raw) {
            return null;
        }
        $num = (float) preg_replace('/[^\d.]/', '', $raw);

        return $num > 0 ? $num : null;
    }

    private function normalizeDate(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }
        $raw = trim($raw);
        foreach (['d-m-Y', 'd/m/Y', 'Y-m-d', 'd-m-y', 'd/m/y'] as $fmt) {
            $dt = \DateTime::createFromFormat($fmt, $raw);
            if ($dt) {
                return $dt->format('Y-m-d');
            }
        }

        return null;
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    private function splitNameFather(?string $fullName): array
    {
        if (!$fullName) {
            return [null, null];
        }
        if (preg_match('/^(.+?)\s+S\/O\s+(.+)$/i', $fullName, $m)) {
            return [trim($m[1]), trim($m[2])];
        }
        if (preg_match('/^(.+?)\s+D\/O\s+(.+)$/i', $fullName, $m)) {
            return [trim($m[1]), trim($m[2])];
        }

        return [trim($fullName), null];
    }

    private function mapRecommendation(string $text): ?string
    {
        $lower = strtolower($text);
        if (str_contains($lower, 'register enquiry') || str_contains($lower, 'registration of enquiry')) {
            return 'enquiry_registration';
        }
        if (str_contains($lower, 'closure') || str_contains($lower, 'close')) {
            return 'closure';
        }
        if (str_contains($lower, 'merge')) {
            return 'merge';
        }
        if (str_contains($lower, 'transfer')) {
            return 'transfer';
        }

        return null;
    }
}
