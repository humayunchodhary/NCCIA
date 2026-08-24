<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enquiries Table Indexes
        if (Schema::hasTable('enquiries')) {
            Schema::table('enquiries', function (Blueprint ) {
                try {
                    ->index(['circle_id', 'status'], 'idx_enquiries_circle_status');
                } catch (\Throwable ) {}
                try {
                    ->index(['officer_id', 'status'], 'idx_enquiries_officer_status');
                } catch (\Throwable ) {}
                try {
                    ->index(['created_at'], 'idx_enquiries_created_at');
                } catch (\Throwable ) {}
            });
        }

        // 2. Complaints Table Indexes
        if (Schema::hasTable('complaints')) {
            Schema::table('complaints', function (Blueprint ) {
                try {
                    ->index(['circle_id', 'status'], 'idx_complaints_circle_status');
                } catch (\Throwable ) {}
                try {
                    ->index(['created_at'], 'idx_complaints_created_at');
                } catch (\Throwable ) {}
            });
        }

        // 3. Forensic Requests Table Indexes
        if (Schema::hasTable('forensic_requests')) {
            Schema::table('forensic_requests', function (Blueprint ) {
                try {
                    ->index(['status', 'destination'], 'idx_forensic_status_dest');
                } catch (\Throwable ) {}
                try {
                    ->index(['assigned_to', 'status'], 'idx_forensic_assigned_status');
                } catch (\Throwable ) {}
                try {
                    ->index(['created_at'], 'idx_forensic_created_at');
                } catch (\Throwable ) {}
            });
        }

        // 4. Forensic Request Items Table Indexes
        if (Schema::hasTable('forensic_request_items')) {
            Schema::table('forensic_request_items', function (Blueprint ) {
                try {
                    ->index(['forensic_request_id'], 'idx_items_req_id');
                } catch (\Throwable ) {}
            });
        }

        // 5. Enquiry Notices Table Indexes
        if (Schema::hasTable('enquiry_notices')) {
            Schema::table('enquiry_notices', function (Blueprint ) {
                try {
                    ->index(['enquiry_id', 'notice_number'], 'idx_notices_enq_num');
                } catch (\Throwable ) {}
            });
        }

        // 6. Users Table Indexes
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint ) {
                try {
                    ->index(['role', 'circle_id'], 'idx_users_role_circle');
                } catch (\Throwable ) {}
            });
        }
    }

    public function down(): void
    {
    }
};
