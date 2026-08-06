<?php

namespace App\Http\Controllers;

use App\Models\InvestigationOfficer;
use App\Models\Otp;
use App\Models\User;
use App\Mail\OtpMail;
use App\Mail\GmailSender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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
        $password = $upper[random_int(0, 25)] . $lower[random_int(0, 25)] . $digits[random_int(0, 9)] . $special[random_int(0, 7)];
        for ($i = 0; $i < 6; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }
        return str_shuffle($password);
    }
    public function index()
    {
        $officers = InvestigationOfficer::latest()->paginate(15);

        if (request()->expectsJson()) {
            return response()->json($officers);
        }

        $stats = [
            'total'  => InvestigationOfficer::count(),
            'active' => InvestigationOfficer::where('status', 'active')->count(),
        ];

        return view('investigation-officers.index', compact('officers', 'stats'));
    }

    public function apiIndex()
    {
        $officers = InvestigationOfficer::latest()->paginate(15);
        return response()->json($officers);
    }

    public function show(InvestigationOfficer $investigationOfficer)
    {
        if (request()->expectsJson()) {
            return response()->json($investigationOfficer);
        }
        return view('investigation-officers.show', compact('investigationOfficer'));
    }

    public function create()
    {
        return view('investigation-officers.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'badge_no'        => 'required|string|max:50|unique:investigation_officers,badge_no',
            'designation'     => 'nullable|string|max:255',
            'circle'          => 'nullable|string|max:255',
            'zone'            => 'nullable|string|max:255',
            'contact_no'      => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string|max:1000',
            'date_of_joining' => 'nullable|date',
            'status'          => 'nullable|in:active,inactive',
            'remarks'         => 'nullable|string|max:2000',
        ]);

        InvestigationOfficer::create($data);

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Investigation Officer added successfully'], 201);
        }

        return redirect()->route('investigation-officers.index')
            ->with('success', 'Investigation Officer added successfully');
    }

    public function apiStore(Request $request)
    {
        return $this->store($request);
    }

    public function edit(InvestigationOfficer $investigationOfficer)
    {
        return view('investigation-officers.edit', compact('investigationOfficer'));
    }

    public function update(Request $request, InvestigationOfficer $investigationOfficer)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'badge_no'        => 'required|string|max:50|unique:investigation_officers,badge_no,' . $investigationOfficer->id,
            'designation'     => 'nullable|string|max:255',
            'circle'          => 'nullable|string|max:255',
            'zone'            => 'nullable|string|max:255',
            'contact_no'      => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:255',
            'address'         => 'nullable|string|max:1000',
            'date_of_joining' => 'nullable|date',
            'status'          => 'nullable|in:active,inactive',
            'remarks'         => 'nullable|string|max:2000',
        ]);

        $investigationOfficer->update($data);

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Investigation Officer updated successfully']);
        }

        return redirect()->route('investigation-officers.index')
            ->with('success', 'Investigation Officer updated successfully');
    }

    public function apiUpdate(Request $request, InvestigationOfficer $investigationOfficer)
    {
        return $this->update($request, $investigationOfficer);
    }

    public function grantAccess(Request $request, InvestigationOfficer $investigationOfficer)
    {
        if ($investigationOfficer->user_id) {
            return response()->json(['message' => 'Portal access already granted', 'user' => $investigationOfficer->user], 422);
        }

        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'nullable|string|min:8',
        ]);

        $password = $data['password'] ?? $this->generateStrongPassword();

        $user = User::where('email', $data['email'])->first();

        $userData = [
            'name'        => $investigationOfficer->name,
            'password'    => Hash::make($password),
            'designation' => $investigationOfficer->designation,
        ];

        // Map IO circle/zone (string) to circle_id/zone_id (FK)
        if ($investigationOfficer->circle) {
            $circle = \App\Models\Circle::where('name', $investigationOfficer->circle)
                ->orWhere('code', $investigationOfficer->circle)->first();
            if ($circle) $userData['circle_id'] = $circle->id;
        }
        if ($investigationOfficer->zone) {
            $zone = \App\Models\Zone::where('name', $investigationOfficer->zone)
                ->orWhere('code', $investigationOfficer->zone)->first();
            if ($zone) $userData['zone_id'] = $zone->id;
        }

        if ($user) {
            $user->update($userData);
            $user->assignRole('investigation_officer');
        } else {
            $user = User::create($userData + ['email' => $data['email']]);
            $user->assignRole('investigation_officer');
        }

        $investigationOfficer->update(['user_id' => $user->id]);

        return response()->json([
            'message'  => 'Portal access granted successfully',
            'user'     => $user,
            'password' => $password,
        ]);
    }

    public function sendOtp(Request $request, InvestigationOfficer $investigationOfficer)
    {
        if ($investigationOfficer->user_id) {
            return response()->json(['message' => 'Portal access already granted'], 422);
        }

        $data = $request->validate(['email' => 'required|email']);
        $email = $data['email'];

        // Invalidate any previous unverified OTPs for this email
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

        $mailSent = false;
        try {
            Mail::to($email)->send(new OtpMail($otp, $investigationOfficer->name));
            $mailSent = true;
        } catch (\Exception $e) {
            logger()->warning('Mail::send failed, trying GmailSender: ' . $e->getMessage());
        }

        if (!$mailSent) {
            $view = view('emails.otp', ['otp' => $otp, 'name' => $investigationOfficer->name])->render();
            $ok = GmailSender::send($email, 'NCCIA Portal - OTP for Account Access', $view);
            if (!$ok) {
                return response()->json(['message' => 'Failed to send OTP email. Server mail configuration issue.'], 500);
            }
        }

        return response()->json(['message' => 'OTP sent to ' . $email]);
    }

    public function verifyOtp(Request $request, InvestigationOfficer $investigationOfficer)
    {
        try {
            if ($investigationOfficer->user_id) {
                return response()->json(['message' => 'Portal access already granted', 'user' => $investigationOfficer->user], 422);
            }

            $data = $request->validate([
                'email' => 'required|email',
                'otp'   => 'required|string|size:6',
            ]);

            $valid = Otp::valid($data['email'], $data['otp'], 'io_access')->first();

            if (!$valid) {
                return response()->json(['message' => 'Invalid or expired OTP'], 422);
            }

            $valid->update(['verified_at' => now()]);

            // Generate password and grant access
            $password = $this->generateStrongPassword();
            $user = User::where('email', $data['email'])->first();

            $userData = [
                'name'        => $investigationOfficer->name,
                'password'    => Hash::make($password),
                'designation' => $investigationOfficer->designation,
            ];

            if ($investigationOfficer->circle) {
                $circle = \App\Models\Circle::where('name', $investigationOfficer->circle)
                    ->orWhere('code', $investigationOfficer->circle)->first();
                if ($circle) $userData['circle_id'] = $circle->id;
            }
            if ($investigationOfficer->zone) {
                $zone = \App\Models\Zone::where('name', $investigationOfficer->zone)
                    ->orWhere('code', $investigationOfficer->zone)->first();
                if ($zone) $userData['zone_id'] = $zone->id;
            }

            if ($user) {
                $user->update($userData);
                $user->assignRole('investigation_officer');
            } else {
                $user = User::create($userData + ['email' => $data['email']]);
                $user->assignRole('investigation_officer');
            }

            $investigationOfficer->update(['user_id' => $user->id]);

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
        if (!$investigationOfficer->user_id) {
            return response()->json(['message' => 'No portal access to reset password'], 422);
        }

        $user = $investigationOfficer->user;
        if (!$user) {
            return response()->json(['message' => 'Associated user not found'], 422);
        }

        $data = $request->validate([
            'password' => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
        ]);

        $password = $data['password'] ?? $this->generateStrongPassword();
        $user->update(['password' => Hash::make($password)]);
        \DB::table('sessions')->where('user_id', $user->id)->delete();

        return response()->json([
            'message'  => 'Password reset successfully',
            'email'    => $user->email,
            'password' => $password,
        ]);
    }

    public function revokeAccess(InvestigationOfficer $investigationOfficer)
    {
        if (!$investigationOfficer->user_id) {
            return response()->json(['message' => 'No portal access to revoke'], 422);
        }

        $user = $investigationOfficer->user;
        
        if ($user) {
            $user->removeRole('investigation_officer');
            $user->update(['password' => \Hash::make(\Str::random(32))]);
            \DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        $investigationOfficer->update(['user_id' => null]);

        return response()->json(['message' => 'Portal access removed successfully']);
    }

    public function destroy(InvestigationOfficer $investigationOfficer)
    {
        if ($investigationOfficer->user) {
            $investigationOfficer->user->delete();
        }

        $investigationOfficer->delete();

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Investigation Officer deleted successfully']);
        }

        return redirect()->route('investigation-officers.index')
            ->with('success', 'Investigation Officer deleted successfully');
    }

    public function apiDestroy(InvestigationOfficer $investigationOfficer)
    {
        return $this->destroy($investigationOfficer);
    }
}
