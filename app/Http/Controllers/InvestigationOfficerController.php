<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use App\Models\InvestigationOfficer;
use App\Models\Otp;
use App\Models\User;
use App\Models\Zone;
use App\Services\OtpMailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InvestigationOfficerController extends Controller
{
    private function generateStrongPassword(): string
    {
        $upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lower = 'abcdefghijklmnopqrstuvwxyz';
        $digits = '0123456789';
        $special = '@$!%*#?&';
        $all = $upper . $lower . $digits . $special;
        $password = $upper[random_int(0, 25)]
            . $lower[random_int(0, 25)]
            . $digits[random_int(0, 9)]
            . $special[random_int(0, 7)];
        for ($i = 0; $i < 6; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        return str_shuffle($password);
    }

    private function scopedQuery(?User $user = null)
    {
        $user = $user ?? request()->user();
        $query = InvestigationOfficer::query()->with('user:id,name,email');

        if ($user && $user->hasRole('circle_incharge') && $user->circle_id
            && !$user->hasAnyRole(['admin', 'director_general'])) {
            $circle = $user->circle;
            if ($circle) {
                $query->where(function ($q) use ($circle) {
                    $q->where('circle', $circle->name)
                      ->orWhere('circle', $circle->code);
                });
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        return $query;
    }

    private function resolveCircleZoneIds(InvestigationOfficer $officer): array
    {
        $data = [];

        if ($officer->circle) {
            $circle = Circle::where(function ($q) use ($officer) {
                $q->where('name', $officer->circle)->orWhere('code', $officer->circle);
            })->first();
            if ($circle) {
                $data['circle_id'] = $circle->id;
            }
        }

        if ($officer->zone) {
            $zone = Zone::where(function ($q) use ($officer) {
                $q->where('name', $officer->zone)->orWhere('code', $officer->zone);
            })->first();
            if ($zone) {
                $data['zone_id'] = $zone->id;
            }
        }

        return $data;
    }

    private function createOrUpdatePortalUser(InvestigationOfficer $officer, string $email, string $password): User
    {
        $userData = array_merge([
            'name'        => $officer->name,
            'password'    => Hash::make($password),
            'designation' => $officer->designation,
        ], $this->resolveCircleZoneIds($officer));

        $user = User::where('email', $email)->first();
        if ($user) {
            $user->update($userData);
        } else {
            $user = User::create($userData + ['email' => strtolower($email)]);
        }

        if (!$user->hasRole('investigation_officer')) {
            $user->assignRole('investigation_officer');
        }

        $officer->update(['user_id' => $user->id, 'email' => $email]);

        return $user->fresh();
    }

    public function index()
    {
        $this->authorize('viewAny', InvestigationOfficer::class);

        $perPage = min(50, max(10, (int) request('per_page', 15)));
        $search = trim((string) request('search', ''));

        $query = $this->scopedQuery()->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search . '%')
                  ->orWhere('badge_no', 'like', $search . '%')
                  ->orWhere('email', 'like', $search . '%')
                  ->orWhere('designation', 'like', $search . '%');
            });
        }

        if ($status = request('status')) {
            $query->where('status', $status);
        }

        $officers = $query->paginate($perPage)->withQueryString();

        $base = $this->scopedQuery();
        $stats = [
            'total'       => (clone $base)->count(),
            'active'      => (clone $base)->where('status', 'active')->count(),
            'with_access' => (clone $base)->whereNotNull('user_id')->count(),
        ];

        if (request()->expectsJson()) {
            return response()->json(array_merge($officers->toArray(), ['stats' => $stats]));
        }

        return view('investigation-officers.index', compact('officers', 'stats'));
    }

    public function show(InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('view', $investigationOfficer);
        $investigationOfficer->load('user:id,name,email,designation,circle_id,zone_id');

        if (request()->expectsJson()) {
            return response()->json(['data' => $investigationOfficer]);
        }

        return view('investigation-officers.show', compact('investigationOfficer'));
    }

    public function create()
    {
        $this->authorize('create', InvestigationOfficer::class);

        return view('investigation-officers.create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', InvestigationOfficer::class);

        $data = $request->validate([
            'name'                 => 'required|string|max:255',
            'badge_no'             => 'required|string|max:50|unique:investigation_officers,badge_no',
            'designation'          => 'nullable|string|max:255',
            'circle'               => 'nullable|string|max:255',
            'zone'                 => 'nullable|string|max:255',
            'contact_no'           => 'nullable|string|max:20',
            'contact_country_code' => 'nullable|string|max:8',
            'email'                => 'nullable|email|max:255',
            'address'              => 'nullable|string|max:1000',
            'date_of_joining'      => 'nullable|date',
            'status'               => 'nullable|in:active,inactive',
            'remarks'              => 'nullable|string|max:2000',
        ]);

        $user = $request->user();
        if ($user->hasRole('circle_incharge') && $user->circle
            && !$user->hasAnyRole(['admin', 'director_general'])) {
            $data['circle'] = $user->circle->name;
            if ($user->zone) {
                $data['zone'] = $user->zone->name;
            }
        }

        $data['status'] = $data['status'] ?? 'active';
        $data['contact_country_code'] = $data['contact_country_code'] ?? '+92';

        $officer = InvestigationOfficer::create($data);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Investigation Officer added successfully',
                'data'    => $officer,
            ], 201);
        }

        return redirect()->route('investigation-officers.index')
            ->with('success', 'Investigation Officer added successfully');
    }

    public function edit(InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('update', $investigationOfficer);

        return view('investigation-officers.edit', compact('investigationOfficer'));
    }

    public function update(Request $request, InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('update', $investigationOfficer);

        $data = $request->validate([
            'name'                 => 'required|string|max:255',
            'badge_no'             => 'required|string|max:50|unique:investigation_officers,badge_no,' . $investigationOfficer->id,
            'designation'          => 'nullable|string|max:255',
            'circle'               => 'nullable|string|max:255',
            'zone'                 => 'nullable|string|max:255',
            'contact_no'           => 'nullable|string|max:20',
            'contact_country_code' => 'nullable|string|max:8',
            'email'                => 'nullable|email|max:255',
            'address'              => 'nullable|string|max:1000',
            'date_of_joining'      => 'nullable|date',
            'status'               => 'nullable|in:active,inactive',
            'remarks'              => 'nullable|string|max:2000',
        ]);

        $investigationOfficer->update($data);

        // Keep linked portal user in sync
        if ($investigationOfficer->user) {
            $investigationOfficer->user->update(array_filter([
                'name'        => $data['name'] ?? null,
                'designation' => $data['designation'] ?? null,
                'email'       => $data['email'] ?? null,
            ] + $this->resolveCircleZoneIds($investigationOfficer->fresh())));
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Investigation Officer updated successfully',
                'data'    => $investigationOfficer->fresh()->load('user:id,name,email'),
            ]);
        }

        return redirect()->route('investigation-officers.index')
            ->with('success', 'Investigation Officer updated successfully');
    }

    public function grantAccess(Request $request, InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('manageAccess', $investigationOfficer);

        if ($investigationOfficer->user_id) {
            return response()->json([
                'message' => 'Portal access already granted',
                'user'    => $investigationOfficer->user,
            ], 422);
        }

        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'nullable|string|min:8',
        ]);

        $password = $data['password'] ?? $this->generateStrongPassword();
        $user = $this->createOrUpdatePortalUser($investigationOfficer, $data['email'], $password);

        return response()->json([
            'message'  => 'Portal access granted successfully',
            'user'     => $user,
            'password' => $password,
        ]);
    }

    public function sendOtp(Request $request, InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('manageAccess', $investigationOfficer);

        if ($investigationOfficer->user_id) {
            return response()->json(['message' => 'Portal access already granted'], 422);
        }

        $data = $request->validate(['email' => 'required|email']);
        $email = strtolower($data['email']);

        Otp::where('email', $email)->where('type', 'io_access')->whereNull('verified_at')->update([
            'expires_at' => now(),
        ]);

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Otp::create([
            'email'      => $email,
            'otp'        => $otp,
            'type'       => 'io_access',
            'expires_at' => now()->addMinutes(10),
        ]);

        $result = app(OtpMailService::class)->send($email, $otp, $investigationOfficer->name);

        if (!$result['ok']) {
            return response()->json([
                'message' => 'OTP email send nahi hui: ' . ($result['error'] ?? 'unknown error'),
                'hint'    => 'cPanel pe chalao: php artisan nccia:test-mail ' . $email . ' — agar timeout aaye to host outbound Gmail SMTP (587/465) block kar raha hai.',
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent to ' . $email . '. Inbox / Spam folder check karein.',
            'email'   => $email,
            'via'     => $result['via'],
        ]);
    }

    public function verifyOtp(Request $request, InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('manageAccess', $investigationOfficer);

        try {
            if ($investigationOfficer->user_id) {
                return response()->json([
                    'message' => 'Portal access already granted',
                    'user'    => $investigationOfficer->user,
                ], 422);
            }

            $data = $request->validate([
                'email' => 'required|email',
                'otp'   => 'required|string|size:6',
            ]);

            $valid = Otp::valid(strtolower($data['email']), $data['otp'], 'io_access')->first();

            if (!$valid) {
                return response()->json(['message' => 'Invalid or expired OTP'], 422);
            }

            $valid->update(['verified_at' => now()]);

            $password = $this->generateStrongPassword();
            $user = $this->createOrUpdatePortalUser($investigationOfficer, $data['email'], $password);

            return response()->json([
                'message'  => 'Portal access granted successfully',
                'user'     => $user,
                'password' => $password,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    public function resetPassword(Request $request, InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('manageAccess', $investigationOfficer);

        if (!$investigationOfficer->user_id) {
            return response()->json(['message' => 'No portal access to reset password'], 422);
        }

        $user = $investigationOfficer->user;
        if (!$user) {
            return response()->json(['message' => 'Associated user not found'], 422);
        }

        $data = $request->validate([
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $password = $data['password'] ?? $this->generateStrongPassword();
        $user->update(['password' => Hash::make($password)]);
        DB::table('sessions')->where('user_id', $user->id)->delete();

        return response()->json([
            'message'  => 'Password reset successfully',
            'email'    => $user->email,
            'password' => $password,
        ]);
    }

    public function revokeAccess(InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('manageAccess', $investigationOfficer);

        if (!$investigationOfficer->user_id) {
            return response()->json(['message' => 'No portal access to revoke'], 422);
        }

        $user = $investigationOfficer->user;

        if ($user) {
            $user->removeRole('investigation_officer');
            $user->update(['password' => Hash::make(Str::random(32))]);
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        $investigationOfficer->update(['user_id' => null]);

        return response()->json(['message' => 'Portal access removed successfully']);
    }

    public function destroy(InvestigationOfficer $investigationOfficer)
    {
        $this->authorize('delete', $investigationOfficer);

        if ($investigationOfficer->user) {
            $investigationOfficer->user->removeRole('investigation_officer');
        }

        $investigationOfficer->delete();

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Investigation Officer deleted successfully']);
        }

        return redirect()->route('investigation-officers.index')
            ->with('success', 'Investigation Officer deleted successfully');
    }
}
