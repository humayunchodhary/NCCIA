<?php

namespace App\Policies;

use App\Models\InvestigationOfficer;
use App\Models\User;

class InvestigationOfficerPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->hasRole('investigation_officer')) return false;
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, InvestigationOfficer $investigationOfficer): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, InvestigationOfficer $investigationOfficer): bool
    {
        return $user->hasRole('admin');
    }
}
