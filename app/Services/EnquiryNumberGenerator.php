<?php

namespace App\Services;

use App\Models\Enquiry;
use Illuminate\Support\Facades\DB;

class EnquiryNumberGenerator
{
    public function generate(?string $circleCode = null): string
    {
        $year = now()->format('y');
        $code = $circleCode ?? 'CCW';

        $last = Enquiry::where('enquiry_number', 'like', "{$code}-E-%/{$year}")
            ->lockForUpdate()
            ->orderByRaw('CAST(SUBSTRING_INDEX(enquiry_number, "/", -1) AS UNSIGNED) DESC')
            ->value('enquiry_number');

        $seq = 1;
        if ($last) {
            $parts = explode('-', $last);
            $seq = ((int) end($parts)) + 1;
        }

        return "{$code}-E-{$seq}/{$year}";
    }
}
