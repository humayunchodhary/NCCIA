<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('forensic_requests')) {
            Schema::table('forensic_requests', function (Blueprint ) {
                if (!Schema::hasColumn('forensic_requests', 'checklist_tech_report')) {
                    ->boolean('checklist_tech_report')->default(false)->after('note');
                }
                if (!Schema::hasColumn('forensic_requests', 'checklist_seizure_memo')) {
                    ->boolean('checklist_seizure_memo')->default(false)->after('checklist_tech_report');
                }
                if (!Schema::hasColumn('forensic_requests', 'checklist_fir_copy')) {
                    ->boolean('checklist_fir_copy')->default(false)->after('checklist_seizure_memo');
                }
                if (!Schema::hasColumn('forensic_requests', 'checklist_scope_letter')) {
                    ->boolean('checklist_scope_letter')->default(false)->after('checklist_fir_copy');
                }
                if (!Schema::hasColumn('forensic_requests', 'audio_script')) {
                    ->text('audio_script')->nullable()->after('checklist_scope_letter');
                }
                if (!Schema::hasColumn('forensic_requests', 'audio_source_path')) {
                    ->string('audio_source_path', 500)->nullable()->after('audio_script');
                }
                if (!Schema::hasColumn('forensic_requests', 'audio_sample_path')) {
                    ->string('audio_sample_path', 500)->nullable()->after('audio_source_path');
                }
                if (!Schema::hasColumn('forensic_requests', 'routed_to')) {
                    ->string('routed_to', 255)->nullable()->after('audio_sample_path');
                }
            });
        }
    }

    public function down(): void
    {
    }
};
