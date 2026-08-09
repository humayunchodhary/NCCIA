<?php

namespace App\Providers;

use App\Models\Complaint;
use App\Models\Verification;
use App\Policies\ComplaintPolicy;
use App\Policies\VerificationPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Complaint::class, ComplaintPolicy::class);
        Gate::policy(Verification::class, VerificationPolicy::class);

        $this->registerSqliteCompatibilityFunctions();
    }

    /**
     * Register MySQL-compatible SQL functions for SQLite so the same
     * queries (DATEDIFF, SUBSTRING_INDEX, YEAR) work on both databases.
     */
    protected function registerSqliteCompatibilityFunctions(): void
    {
        try {
            $connection = DB::connection();
        } catch (\Throwable $e) {
            return;
        }

        if ($connection->getDriverName() !== 'sqlite') {
            return;
        }

        $pdo = $connection->getPdo();

        $pdo->sqliteCreateFunction('DATEDIFF', function ($date1, $date2) {
            if ($date1 === null || $date2 === null) {
                return null;
            }
            $ts1 = strtotime((string) $date1);
            $ts2 = strtotime((string) $date2);
            if ($ts1 === false || $ts2 === false) {
                return null;
            }
            return (int) floor(($ts1 - $ts2) / 86400);
        }, 2);

        $pdo->sqliteCreateFunction('SUBSTRING_INDEX', function ($string, $delimiter, $count) {
            if ($string === null || $delimiter === '') {
                return null;
            }
            $string = (string) $string;
            $count = (int) $count;
            $parts = explode((string) $delimiter, $string);

            if ($count > 0) {
                if (count($parts) <= $count) {
                    return $string;
                }
                return implode((string) $delimiter, array_slice($parts, 0, $count));
            }

            if ($count < 0) {
                $abs = abs($count);
                if (count($parts) <= $abs) {
                    return $string;
                }
                return implode((string) $delimiter, array_slice($parts, -$abs));
            }

            return '';
        }, 3);

        $pdo->sqliteCreateFunction('YEAR', function ($date) {
            if ($date === null) {
                return null;
            }
            return (int) date('Y', strtotime((string) $date));
        }, 1);
    }
}
