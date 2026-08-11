<?php

namespace App\Console\Commands;

use App\Jobs\ProcessComplaintPdfImport;
use App\Models\User;
use App\Services\ComplaintPdfImportService;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportComplaintPdfs extends Command
{
    protected $signature = 'complaints:import-pdfs
                            {path : Folder path or single PDF file}
                            {--user=1 : User ID to attribute imports to}
                            {--batch= : Optional batch id}
                            {--sync : Process immediately without queue}
                            {--extract-only : Extract only, do not create records}';

    protected $description = 'Bulk import NCCIA complaint/verification PDFs into the system';

    public function handle(ComplaintPdfImportService $service): int
    {
        $path = $this->argument('path');
        if (!file_exists($path)) {
            $this->error("Path not found: {$path}");

            return self::FAILURE;
        }

        $user = User::with('roles')->find((int) $this->option('user'));
        if (!$user) {
            $this->error('User not found.');

            return self::FAILURE;
        }

        $files = is_dir($path)
            ? File::files($path)
            : [new \SplFileInfo($path)];

        $pdfs = collect($files)->filter(fn ($f) => strtolower($f->getExtension()) === 'pdf')->values();
        if ($pdfs->isEmpty()) {
            $this->warn('No PDF files found.');

            return self::SUCCESS;
        }

        $batchId = $this->option('batch') ?: (string) Str::uuid();
        $autoApply = !$this->option('extract-only');
        $bar = $this->output->createProgressBar($pdfs->count());
        $bar->start();

        foreach ($pdfs->chunk(50) as $chunk) {
            $uploaded = [];
            foreach ($chunk as $pdf) {
                $uploaded[] = new UploadedFile(
                    $pdf->getPathname(),
                    $pdf->getFilename(),
                    'application/pdf',
                    null,
                    true
                );
            }

            $stored = $service->storeUploads($uploaded, $user, $batchId);

            foreach ($stored['imports'] as $import) {
                if ($this->option('sync')) {
                    $import = $service->process($import);
                    if ($autoApply && $import->status === 'extracted') {
                        $service->applyToSystem($import, $user, true);
                    }
                } else {
                    ProcessComplaintPdfImport::dispatch($import->id, $user->id, $autoApply);
                }
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Queued/processed {$pdfs->count()} PDF(s). Batch: {$batchId}");

        if (!$this->option('sync')) {
            $this->line('Run: php artisan queue:work --timeout=300');
        }

        return self::SUCCESS;
    }
}
