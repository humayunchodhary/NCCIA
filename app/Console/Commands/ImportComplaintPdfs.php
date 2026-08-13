<?php

namespace App\Console\Commands;

use App\Jobs\ProcessComplaintPdfImport;
use App\Models\ComplaintPdfImport;
use App\Models\User;
use App\Services\ComplaintPdfImportService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportComplaintPdfs extends Command
{
    protected $signature = 'complaints:import-pdfs
                            {path : Folder path or single PDF file}
                            {--user=1 : User ID to attribute imports to}
                            {--batch= : Optional batch id}
                            {--sync : Process immediately without queue}
                            {--extract-only : Extract only, do not create complaints}
                            {--in-place : Keep PDFs in place (do not copy into storage) — required for large batches}
                            {--copy : Copy PDFs into storage (default is in-place)}
                            {--no-attach : Do not copy PDF into public/uploads on apply}
                            {--skip-existing : Skip filenames already queued/imported (default true)}
                            {--no-skip-existing : Re-import even if filename exists}
                            {--limit=0 : Max PDFs this run (0 = all)}
                            {--dry-run : List matching PDFs only, do not import}';

    protected $description = 'Bulk import FIA/NCCIA verification PDFs (folder or file). Use --in-place for large batches.';

    public function handle(ComplaintPdfImportService $service): int
    {
        $path = $this->argument('path');
        if (!file_exists($path)) {
            $this->error("Path not found: {$path}");

            return self::FAILURE;
        }

        $user = User::with('roles')->find((int) $this->option('user'));
        if (!$user) {
            $this->error('User not found. Pass --user=<id> of an operator/admin.');

            return self::FAILURE;
        }

        $limit = (int) $this->option('limit');
        $inPlace = !$this->option('copy');
        $skipExisting = !$this->option('no-skip-existing');
        $copyAttachment = !$this->option('no-attach') && !$this->option('extract-only');
        $autoApply = !$this->option('extract-only');
        $batchId = $this->option('batch') ?: (string) Str::uuid();

        $this->info('Scanning PDFs…');
        $queued = 0;
        $skipped = 0;
        $seen = 0;
        $chunk = [];
        $chunkSize = 50;

        foreach ($this->iteratePdfs($path) as $pdfPath) {
            if ($limit > 0 && $seen >= $limit) {
                break;
            }
            $seen++;
            $chunk[] = $pdfPath;

            if (count($chunk) >= $chunkSize) {
                [$q, $s] = $this->ingestChunk($service, $user, $batchId, $chunk, $inPlace, $skipExisting, $autoApply, $copyAttachment);
                $queued += $q;
                $skipped += $s;
                $chunk = [];
                $this->line("  scanned {$seen}  queued {$queued}  skipped {$skipped}");
            }
        }

        if ($chunk) {
            if ($this->option('dry-run')) {
                $this->line('Dry-run remaining:');
                foreach ($chunk as $p) {
                    $this->line('  ' . $p);
                }
            } else {
                [$q, $s] = $this->ingestChunk($service, $user, $batchId, $chunk, $inPlace, $skipExisting, $autoApply, $copyAttachment);
                $queued += $q;
                $skipped += $s;
            }
        }

        $this->newLine();
        if ($this->option('dry-run')) {
            $this->info('Dry-run complete. No records created.');

            return self::SUCCESS;
        }

        $this->info("Queued/processed {$queued} PDF(s). Skipped {$skipped}. Batch: {$batchId}");

        if (!$this->option('sync')) {
            $this->line('Start workers (several terminals):');
            $this->line('  php artisan queue:work --timeout=300 --tries=1 --sleep=1');
        }

        $counts = ComplaintPdfImport::query()
            ->selectRaw('status, count(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');
        foreach ($counts as $status => $count) {
            $this->line("  {$status}: {$count}");
        }

        return self::SUCCESS;
    }

    /**
     * @param  list<string>  $paths
     * @return array{0: int, 1: int}
     */
    private function ingestChunk(
        ComplaintPdfImportService $service,
        User $user,
        string $batchId,
        array $paths,
        bool $inPlace,
        bool $skipExisting,
        bool $autoApply,
        bool $copyAttachment,
    ): array {
        if ($this->option('dry-run')) {
            foreach ($paths as $p) {
                $this->line('  ' . $p);
            }

            return [0, 0];
        }

        $stored = $service->registerLocalFiles($paths, $user, $batchId, $inPlace, $skipExisting);

        foreach ($stored['imports'] as $import) {
            if ($this->option('sync')) {
                $import = $service->process($import);
                if ($autoApply && $import->status === ComplaintPdfImport::STATUS_EXTRACTED) {
                    $service->applyToSystem($import, $user, true, $copyAttachment);
                }
            } else {
                ProcessComplaintPdfImport::dispatch($import->id, $user->id, $autoApply, $copyAttachment);
            }
        }

        return [count($stored['imports']), (int) ($stored['skipped'] ?? 0)];
    }

    /**
     * @return \Generator<int, string>
     */
    private function iteratePdfs(string $path): \Generator
    {
        if (is_file($path)) {
            if (strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'pdf') {
                yield $path;
            }

            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'pdf') {
                yield $file->getPathname();
            }
        }
    }
}
