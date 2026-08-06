<?php

namespace App\Policies;

use App\Models\Enquiry;
use App\Models\User;

class EnquiryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Enquiry $enquiry): bool
    {
        if ($user->hasRole('investigation_officer')) {
            return $enquiry->enquiry_officer_id === $user->id;
        }
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'circle_incharge']);
    }

    public function update(User $user, Enquiry $enquiry): bool
    {
        if ($user->hasRole('investigation_officer')) {
            return $enquiry->enquiry_officer_id === $user->id;
        }
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('circle_incharge')) return true;
        return false;
    }

    public function delete(User $user, Enquiry $enquiry): bool
    {
        return $user->hasRole('admin');
    }
}
