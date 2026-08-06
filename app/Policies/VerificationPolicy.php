<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Verification;
use Illuminate\Auth\Access\HandlesAuthorization;

class VerificationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Verification $verification): bool
    {
        if ($user->hasRole('investigation_officer')) {
            return $user->id === $verification->verification_officer_id;
        }
        return true;
    }

    public function update(User $user, Verification $verification): bool
    {
        if ($user->hasRole('investigation_officer')) {
            return $user->id === $verification->verification_officer_id;
        }

        if ($user->hasRole('circle_incharge')) return true;

        return false;
    }

    public function delete(User $user, Verification $verification): bool
    {
        return $user->hasRole('admin');
    }
}
