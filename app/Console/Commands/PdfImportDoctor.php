<?php

namespace App\Console\Commands;

use App\Models\ComplaintPdfImport;
use App\Services\ComplaintPdfExtractor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class PdfImportDoctor extends Command
{
    protected $signature = 'complaints:pdf-import-doctor
                            {pdf? : Optional PDF path to test extract}
                            {--last : Show last failed import error}';

    protected $description = 'Check Python/Tesseract OCR setup and last PDF import failure';

    public function handle(ComplaintPdfExtractor $extractor): int
    {
        $python = $extractor->pythonBinary();
        $this->line('Python: ' . ($python ?: 'NOT FOUND'));

        if ($python) {
            $ver = Process::timeout(15)->run([$python, '--version']);
            $this->line('  version: ' . trim($ver->output() . ' ' . $ver->errorOutput()));

            $mods = Process::timeout(20)->run([$python, '-c', 'import fitz; print("pymupdf", getattr(fitz, "VersionBind", "?"))']);
            $this->line('  pymupdf: ' . ($mods->successful() ? trim($mods->output()) : 'MISSING — pip install pymupdf'));
            if (!$mods->successful()) {
                $this->line('    ' . trim($mods->errorOutput()));
            }

            $pil = Process::timeout(20)->run([$python, '-c', 'import pytesseract, PIL; print("pytesseract ok")']);
            $this->line('  pytesseract: ' . ($pil->successful() ? 'ok' : 'MISSING — pip install pytesseract pillow'));
            if (!$pil->successful()) {
                $this->line('    ' . trim($pil->errorOutput()));
            }
        }

        $tess = Process::timeout(15)->run(['tesseract', '--version']);
        $this->line('Tesseract: ' . ($tess->successful() ? trim(explode("\n", $tess->output() . $tess->errorOutput())[0] ?? 'ok') : 'NOT FOUND — dnf/yum/apt install tesseract'));

        $script = base_path('scripts/nccia_pdf_extract.py');
        $this->line('Extract script: ' . (is_file($script) ? $script : 'MISSING'));
        $this->line('PDF_EXTRACT_PYTHON=' . (env('PDF_EXTRACT_PYTHON') ?: '(empty)'));

        $last = ComplaintPdfImport::query()->where('status', 'failed')->latest('id')->first();
        if ($last) {
            $this->newLine();
            $this->error('Last failed import:');
            $this->line('  file:  ' . $last->original_filename);
            $this->line('  path:  ' . $last->stored_path);
            $this->line('  error: ' . $last->error_message);
        }

        $pdf = $this->argument('pdf');
        if ($pdf) {
            if (!is_file($pdf)) {
                $this->error("PDF not found: {$pdf}");

                return self::FAILURE;
            }
            $this->newLine();
            $this->info("Testing extract on {$pdf} …");
            $result = $extractor->extract($pdf, basename($pdf));
            $this->line('  ok: ' . ($result['ok'] ? 'yes' : 'no'));
            $this->line('  used_ocr: ' . ($result['used_ocr'] ? 'yes' : 'no'));
            if (!empty($result['error'])) {
                $this->error('  error: ' . $result['error']);
            }
            $data = $result['data'] ?? [];
            foreach (['victim_name', 'victim_cnic', 'victim_phone', 'tracking_no', 'inquiry_no'] as $k) {
                $this->line("  {$k}: " . ($data[$k] ?? '—'));
            }
        }

        $this->newLine();
        $this->line('If Python/tesseract missing, on Alma/RHEL:');
        $this->line('  sudo dnf install -y python3 python3-pip tesseract tesseract-langpack-eng');
        $this->line('  python3 -m pip install --user pymupdf pytesseract pillow');
        $this->line('  # then in .env: PDF_EXTRACT_PYTHON=/usr/bin/python3');

        return self::SUCCESS;
    }
}
