<?php

namespace App\Policies;

use App\Models\CaseFile;
use App\Models\User;

class CaseFilePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CaseFile $caseFile): bool
    {
        if ($user->hasRole('investigation_officer')) {
            return $caseFile->investigation_officer_id === $user->id;
        }
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'circle_incharge']);
    }

    public function update(User $user, CaseFile $caseFile): bool
    {
        if ($user->hasRole('investigation_officer')) {
            return $caseFile->investigation_officer_id === $user->id;
        }
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('circle_incharge')) return true;
        return false;
    }

    public function delete(User $user, CaseFile $caseFile): bool
    {
        return $user->hasRole('admin');
    }
}
