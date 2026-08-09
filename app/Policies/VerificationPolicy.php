<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Verification;
use Illuminate\Auth\Access\HandlesAuthorization;

class VerificationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Verification $verification): bool
    {
        return Verification::visibleTo($user)->whereKey($verification->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'circle_incharge', 'operator']);
    }

    public function update(User $user, Verification $verification): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('circle_incharge')) {
            return true;
        }

        if ($user->hasAnyRole(['verification_officer', 'investigation_officer'])) {
            return (int) $user->id === (int) $verification->verification_officer_id;
        }

        return false;
    }

    public function delete(User $user, Verification $verification): bool
    {
        return $user->hasRole('admin');
    }

    public function approve(User $user, Verification $verification): bool
    {
        return $user->hasAnyRole(['admin', 'circle_incharge']);
    }

    public function submit(User $user, Verification $verification): bool
    {
        if ($user->hasAnyRole(['admin', 'circle_incharge'])) {
            return true;
        }

        return (int) $user->id === (int) $verification->verification_officer_id;
    }
}
