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
            if ($r === 'operator' || $r === 'front_desk_officer') {
                if ($userRole === 'operator' || $userRole === 'front_desk_officer' || str_contains($userRole, 'front_desk') || str_contains($userDesig, 'front desk')) return true;
            }
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

    protected $appends = [
        'circle_code',
        'circle_name',
        'zone_code',
        'zone_name',
        'is_zonal_head',
    ];

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function circle()
    {
        return $this->belongsTo(Circle::class);
    }

    public function getCircleIdAttribute($value): ?int
    {
        if ($value) {
            return (int) $value;
        }

        // Auto-detect circle from name, email, or designation for unassigned legacy accounts
        $haystack = strtolower(($this->attributes['email'] ?? '') . ' ' . ($this->attributes['name'] ?? '') . ' ' . ($this->attributes['designation'] ?? ''));
        
        $code = null;
        if (str_contains($haystack, 'lhr') || str_contains($haystack, 'lahore')) {
            $code = 'LHR';
        } elseif (str_contains($haystack, 'grw') || str_contains($haystack, 'gujranwala')) {
            $code = 'GRW';
        } elseif (str_contains($haystack, 'rwp') || str_contains($haystack, 'rawalpindi')) {
            $code = 'RWP';
        } elseif (str_contains($haystack, 'mux') || str_contains($haystack, 'multan')) {
            $code = 'MUX';
        } elseif (str_contains($haystack, 'fsd') || str_contains($haystack, 'faisalabad')) {
            $code = 'FSD';
        } elseif (str_contains($haystack, 'pew') || str_contains($haystack, 'peshawar')) {
            $code = 'PEW';
        } elseif (str_contains($haystack, 'khi') || str_contains($haystack, 'karachi')) {
            $code = 'KHI';
        } elseif (str_contains($haystack, 'uet') || str_contains($haystack, 'quetta')) {
            $code = 'UET';
        } elseif (str_contains($haystack, 'gwd') || str_contains($haystack, 'gwadar')) {
            $code = 'GWD';
        } elseif (str_contains($haystack, 'glt') || str_contains($haystack, 'gilgit')) {
            $code = 'GLT';
        } elseif (str_contains($haystack, 'atd') || str_contains($haystack, 'abbottabad')) {
            $code = 'ATD';
        } elseif (str_contains($haystack, 'dik') || str_contains($haystack, 'ismail')) {
            $code = 'DIK';
        } elseif (str_contains($haystack, 'skr') || str_contains($haystack, 'sukkur')) {
            $code = 'SKR';
        }

        if ($code) {
            $circle = Circle::where('code', $code)->first();
            if ($circle) {
                return (int) $circle->id;
            }
        }

        // Default Circle Incharge with null circle to Lahore Central Directorate
        if (($this->attributes['role'] ?? '') === 'circle_incharge') {
            $circle = Circle::where('code', 'LHR')->first() ?? Circle::first();
            if ($circle) {
                return (int) $circle->id;
            }
        }

        return null;
    }

    public function getCircleCodeAttribute(): ?string
    {
        return $this->circle?->code;
    }

    public function getCircleNameAttribute(): ?string
    {
        return $this->circle?->name;
    }

    public function getZoneCodeAttribute(): ?string
    {
        return $this->zone?->code ?: $this->circle?->zone?->code;
    }

    public function getZoneNameAttribute(): ?string
    {
        return $this->zone?->name ?: $this->circle?->zone?->name;
    }

    public function getIsZonalHeadAttribute(): bool
    {
        return $this->isZonalHead();
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
        // Station/Circle roles are strictly local station officers, NEVER Headquarters!
        $role = strtolower(trim((string) ($this->role ?? '')));
        if (in_array($role, ['circle_incharge', 'operator', 'front_desk_officer', 'verification_officer', 'enquiry_officer', 'investigation_officer', 'moharrar', 'reader_branch'], true)) {
            return false;
        }

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
     * Check if user is a Zonal / Regional Head (e.g. Director Punjab / Lahore Central Directorate overseeing Punjab Zone).
     */
    public function isZonalHead(): bool
    {
        if ($this->seesAllData()) {
            return false;
        }
        $effectiveZoneId = $this->zone_id ?: $this->circle?->zone_id;
        if (!$effectiveZoneId) {
            return false;
        }

        $userRole = strtolower(trim((string) ($this->role ?? '')));
        $userDesig = strtolower(trim((string) ($this->designation ?? '')));

        // A Circle Incharge is strictly circle-level, not zonal head
        if ($userRole === 'circle_incharge' || str_contains($userRole, 'circle_incharge')) {
            return false;
        }

        return in_array($userRole, ['zonal_director', 'director', 'additional_director', 'director_punjab'], true)
            || str_contains($userDesig, 'zonal')
            || str_contains($userDesig, 'regional director')
            || (str_contains($userDesig, 'director') && !str_contains($userDesig, 'incharge'));
    }

    /**
     * Check whether this user has permission to access records/actions belonging to a specific circle.
     */
    public function canAccessCircle(?int $targetCircleId): bool
    {
        if (!$targetCircleId) {
            return false;
        }

        if ($this->seesAllData()) {
            return true;
        }

        if ($this->isZonalHead()) {
            $effectiveZoneId = $this->zone_id ?: $this->circle?->zone_id;
            if ($effectiveZoneId) {
                $targetCircle = Circle::find($targetCircleId);
                return $targetCircle && (int) $targetCircle->zone_id === (int) $effectiveZoneId;
            }
        }

        return (int) $this->circle_id === (int) $targetCircleId;
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
