<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = ['name', 'email', 'password', 'role', 'designation', 'circle_id', 'zone_id', 'signature', 'phone', 'country_code'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower($value);
    }

    public function findForPassport($username)
    {
        return $this->where('email', $username)->first();
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function circle()
    {
        return $this->belongsTo(Circle::class);
    }

    public function getSignatureUrlAttribute(): ?string
    {
        return $this->signature ? \Illuminate\Support\Facades\Storage::url($this->signature) : null;
    }

    /**
     * Supervisory roles see all records across the system.
     */
    public function seesAllData(): bool
    {
        return $this->hasAnyRole([
            'admin',
            'director_general',
            'additional_director',
            'moharrar',
            'reader_branch',
            'ad_legal',
            'dd_legal',
        ]);
    }

    /**
     * Forensic portal roles (isolated from the main NCCIA modules).
     */
    public const FORENSIC_ROLES = [
        'admin_forensic',
        'ad_forensic',
        'desk_forensic',
        'forensic_team',
    ];

    public function isForensic(): bool
    {
        return $this->hasAnyRole(self::FORENSIC_ROLES);
    }
}
