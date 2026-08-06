<?php

namespace App\Services;

use App\Models\CaseFile;
use Illuminate\Support\Facades\DB;

class FirNumberGenerator
{
    public function generate(?string $circleCode = null): string
    {
        $year = now()->format('y');
        $code = $circleCode ?? 'CCW';

        $last = CaseFile::where('fir_no', 'like', "{$code}-F-%/{$year}")
            ->lockForUpdate()
            ->orderByRaw('CAST(SUBSTRING_INDEX(fir_no, "-", -1) AS UNSIGNED) DESC')
            ->value('fir_no');

        $seq = 1;
        if ($last) {
            $parts = explode('-', $last);
            $seq = ((int) end($parts)) + 1;
        }

        return "{$code}-F-{$seq}/{$year}";
    }
}
