<?php

namespace App\Policies;

use App\Models\Enquiry;
use App\Models\User;

class EnquiryPolicy
{
    /**
     * Roles that participate in the Enquiry stage (flowchart page 5).
     * Verification officers are intentionally excluded.
     */
    private function canAccessEnquiryModule(User $user): bool
    {
        if ($user->hasRole('verification_officer')
            && !$user->hasAnyRole([
                'admin', 'circle_incharge', 'enquiry_officer', 'operator',
                'moharrar', 'reader_branch', 'ad_legal', 'dd_legal',
                'additional_director', 'director_general',
            ])) {
            return false;
        }

        return $user->hasAnyRole([
            'admin', 'circle_incharge', 'enquiry_officer', 'operator',
            'moharrar', 'reader_branch', 'ad_legal', 'dd_legal',
            'additional_director', 'director_general', 'investigation_officer',
        ]) || $user->can('enquiries');
    }

    public function viewAny(User $user): bool
    {
        return $this->canAccessEnquiryModule($user);
    }

    public function view(User $user, Enquiry $enquiry): bool
    {
        if (!$this->canAccessEnquiryModule($user)) {
            return false;
        }

        if ($user->hasRole('enquiry_officer') && !$user->hasAnyRole(['admin', 'circle_incharge'])) {
            return (int) $enquiry->enquiry_officer_id === (int) $user->id;
        }

        return Enquiry::visibleTo($user)->whereKey($enquiry->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'circle_incharge', 'operator', 'reader_branch', 'moharrar']);
    }

    public function update(User $user, Enquiry $enquiry): bool
    {
        if (!$this->canAccessEnquiryModule($user)) {
            return false;
        }

        if ($user->hasRole('admin') || $user->hasRole('circle_incharge')) {
            return true;
        }

        if ($user->hasRole('enquiry_officer')) {
            return (int) $enquiry->enquiry_officer_id === (int) $user->id;
        }

        return false;
    }

    public function delete(User $user, Enquiry $enquiry): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Register enquiry as DAC case/FIR (Circle Incharge, legal chain, Moharrar, Admin).
     */
    public function registerCase(User $user, Enquiry $enquiry): bool
    {
        if (!$this->canAccessEnquiryModule($user)) {
            return false;
        }

        if (!$user->hasAnyRole([
            'admin', 'circle_incharge', 'moharrar',
            'ad_legal', 'dd_legal', 'additional_director', 'director_general',
        ])) {
            return false;
        }

        if ($enquiry->hasRegisteredCase()) {
            return false;
        }

        return in_array($enquiry->status, [
            'cfr_submitted', 'approved', 'referred_court', 'in_progress',
            'legal_review_dd', 'legal_review_ad', 'legal_review_dg',
        ], true);
    }
}
