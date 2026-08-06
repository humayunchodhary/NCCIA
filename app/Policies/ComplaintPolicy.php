<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->hasRole('investigation_officer')) return false;
        return true;
    }

    public function view(User $user, Complaint $complaint): bool
    {
        if ($user->hasRole('investigation_officer')) return false;
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'circle_incharge', 'operator']);
    }

    public function update(User $user, Complaint $complaint): bool
    {
        if ($user->hasRole('investigation_officer')) return false;
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('circle_incharge')) return true;
        if ($user->id === $complaint->user_id) return true;
        return false;
    }

    public function delete(User $user, Complaint $complaint): bool
    {
        return $user->hasRole('admin');
    }
}
