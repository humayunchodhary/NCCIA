<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $fillable = ['email', 'otp', 'type', 'expires_at', 'verified_at'];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    public function scopeValid($query, $email, $otp, $type = 'io_access')
    {
        return $query->where('email', $email)
            ->where('otp', $otp)
            ->where('type', $type)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now());
    }
}
