<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $cacheKey = config('permission.cache.key');
        $cacheStore = config('permission.cache.store');
        app('cache')->store($cacheStore != 'default' ? $cacheStore : null)->forget($cacheKey);

        $features = [
            'dashboard', 'analytics', 'complaints', 'verifications',
            'reports', 'enquiries', 'io_records', 'dac_cases',
            'court_cases', 'users', 'circles', 'offence_types',
            'reference', 'profile',
        ];

        foreach ($features as $feat) {
            Permission::firstOrCreate(['name' => $feat, 'guard_name' => 'web']);
        }

        $roleFeatures = [
            'admin'               => ['dashboard','analytics','complaints','verifications','reports','enquiries','io_records','dac_cases','court_cases','users','circles','offence_types','reference','profile'],
            'circle_incharge'     => ['dashboard','analytics','complaints','verifications','reports','enquiries','io_records','dac_cases','court_cases','offence_types','reference','profile'],
            'verification_officer'=> ['dashboard','verifications','reports','enquiries','profile'],
            'enquiry_officer'     => ['dashboard','enquiries','dac_cases','profile'],
            'investigation_officer'=>['dashboard','verifications','reports','enquiries','dac_cases','profile'],
            'moharrar'            => ['dashboard','analytics','complaints','enquiries','dac_cases','court_cases','offence_types','reference','profile'],
            'reader_branch'       => ['dashboard','complaints','enquiries','profile'],
            'operator'            => ['dashboard','analytics','complaints','verifications','reports','enquiries','io_records','dac_cases','court_cases','offence_types','reference','profile'],
            'ad_legal'            => ['dashboard','enquiries','dac_cases','profile'],
            'dd_legal'            => ['dashboard','enquiries','dac_cases','profile'],
            'additional_director' => ['dashboard','enquiries','dac_cases','profile'],
            'director_general'    => ['dashboard','analytics','complaints','verifications','reports','enquiries','io_records','dac_cases','court_cases','users','circles','offence_types','reference','profile'],
        ];

        foreach ($roleFeatures as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($perms);
        }
    }
}
