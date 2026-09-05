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
    use HasFactory, Notifiable;
    use HasRoles {
        hasRole as traitHasRole;
        hasAnyRole as traitHasAnyRole;
    }

    protected $fillable = ['name', 'email', 'password', 'role', 'designation', 'circle_id', 'zone_id', 'signature', 'phone', 'country_code', 'status', 'status_remarks'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function isSuspended(): bool
    {
        return strtolower((string) ($this->status ?? 'active')) === 'suspended';
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function hasRole($roles, string $guard = null): bool
    {
        $userRole = strtolower(trim((string) ($this->role ?? '')));
        $userDesig = strtolower(trim((string) ($this->designation ?? '')));

        $checkSingle = function ($role) use ($userRole, $userDesig) {
            $r = strtolower(trim((string) $role));
            if ($userRole === $r) return true;
            if ($r === 'enquiry_officer' && (str_contains($userRole, 'enquiry') || str_contains($userRole, 'inspector') || str_contains($userDesig, 'enquiry') || str_contains($userDesig, 'inspector'))) return true;
            if ($r === 'investigation_officer' && (str_contains($userRole, 'investigation') || str_contains($userDesig, 'investigation'))) return true;
            if ($r === 'verification_officer' && (str_contains($userRole, 'verification') || str_contains($userDesig, 'verification'))) return true;
            if ($r === 'circle_incharge' && (str_contains($userRole, 'circle_incharge') || str_contains($userRole, 'incharge') || str_contains($userDesig, 'incharge'))) return true;
            if ($r === 'admin' && ($userRole === 'admin' || $userRole === 'superadmin')) return true;
            return false;
        };

        if (is_string($roles)) {
            if ($checkSingle($roles)) return true;
        } elseif (is_array($roles)) {
            foreach ($roles as $r) {
                if ($checkSingle($r)) return true;
            }
        }

        try {
            return $this->traitHasRole($roles, $guard);
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function hasAnyRole(...$roles): bool
    {
        $flattened = is_array($roles[0] ?? null) ? $roles[0] : $roles;
        foreach ($flattened as $r) {
            if ($this->hasRole($r)) return true;
        }
        return false;
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
     * Check if user belongs to Islamabad / National Headquarters.
     */
    public function isHeadquarters(): bool
    {
        // 1. If user is explicitly assigned to a regional circle (e.g. Lahore, Gujranwala, Karachi, etc.)
        // then they are strictly a regional officer/executive, NEVER Headquarters!
        if ($this->circle_id) {
            $circle = $this->circle;
            if ($circle) {
                $code = strtoupper(trim((string)$circle->code));
                $name = strtolower(trim((string)$circle->name));
                return ($code === 'HQ' || $code === 'ISL' || $code === 'ISB' || str_contains($name, 'islamabad') || str_contains($name, 'headquarter'));
            }
            return false;
        }

        // 2. Unassigned circle_id: Admin, DG, and Federal Directorate officers operate at Headquarters
        return $this->hasAnyRole(['admin', 'director_general', 'additional_director', 'ad_legal', 'dd_legal'])
            || in_array(strtolower($this->role ?? ''), ['admin', 'director_general', 'additional_director', 'ad_legal', 'dd_legal'], true);
    }

    /**
     * Who sees all records across Pakistan:
     * Only Admin, Director General, or officers stationed at Islamabad / Headquarters.
     * Regional circle officers (Gujranwala, Lahore, Karachi, etc.) NEVER see all data.
     */
    public function seesAllData(): bool
    {
        // If assigned to a regional circle (e.g. Lahore, Gujranwala, Karachi, etc.), they do NOT see nationwide data!
        if ($this->circle_id && !$this->isHeadquarters()) {
            return false;
        }

        return $this->isHeadquarters();
    }

    /**
     * Forensic portal roles (isolated from the main NCCIA modules).
     */
    public const FORENSIC_ROLES = [
        'admin_forensic',
        'dd_forensic',
        'ad_forensic',
    ];

    public function isForensic(): bool
    {
        return $this->hasAnyRole(self::FORENSIC_ROLES);
    }
}
