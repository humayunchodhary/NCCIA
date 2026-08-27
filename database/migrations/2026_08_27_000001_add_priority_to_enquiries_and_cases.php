<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('enquiries') && !Schema::hasColumn('enquiries', 'priority')) {
            Schema::table('enquiries', function (Blueprint $table) {
                $table->string('priority', 20)->nullable()->after('status');
            });
        }

        if (Schema::hasTable('cases') && !Schema::hasColumn('cases', 'priority')) {
            Schema::table('cases', function (Blueprint $table) {
                $table->string('priority', 20)->nullable()->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('enquiries') && Schema::hasColumn('enquiries', 'priority')) {
            Schema::table('enquiries', function (Blueprint $table) {
                $table->dropColumn('priority');
            });
        }

        if (Schema::hasTable('cases') && Schema::hasColumn('cases', 'priority')) {
            Schema::table('cases', function (Blueprint $table) {
                $table->dropColumn('priority');
            });
        }
    }
};
