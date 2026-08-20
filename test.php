<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$n = App\Models\EnquiryNotice::latest('id')->first();
echo "Raw appearance_date: " . ($n->getAttributes()['appearance_date'] ?? 'null') . "\n";
try {
  echo "Parsed: " . get_class($n->appearance_date) . "\n";
} catch (\Throwable $e) {
  echo "Parse Error: " . $e->getMessage() . "\n";
}
try {
  $p = app(App\Services\PrintService::class);
  $p->noticePrintDocument($n);
  echo "Print generated OK\n";
} catch (\Throwable $e) {
  echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
