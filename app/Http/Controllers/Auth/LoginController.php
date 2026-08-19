<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\LoginHistory;
use App\Services\IpDetectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check()) {
            return redirect('/');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $key = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'email' => "Too many attempts. Try again in {$seconds} seconds.",
            ]);
        }

        $userForCheck = \App\Models\User::where('email', $credentials['email'])->first();
        if ($userForCheck && \Illuminate\Support\Facades\Hash::check($credentials['password'], $userForCheck->password)) {
            if (\Illuminate\Support\Facades\Cache::has('user_online_' . $userForCheck->id)) {
                $ip = $request->ip();
                try {
                    \Illuminate\Support\Facades\Mail::to($userForCheck->email)->send(new \App\Mail\ConcurrentLoginAlert($userForCheck, $ip));
                } catch (\Throwable $e) {}
                \Illuminate\Support\Facades\Cache::put('login_alert_' . $userForCheck->id, $ip, now()->addMinutes(2));
                return back()->withErrors(['email' => 'Your account is currently logged in elsewhere. We have sent an alert to your email.']);
            }
        }

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            $request->session()->regenerate();
            RateLimiter::clear($key);
            $this->recordLoginHistory($request, 'web', Auth::id());
            return redirect('/');
        }

        RateLimiter::hit($key);
        $this->recordLoginHistory($request, 'failed_web');

        return back()->withErrors([
            'email' => 'Invalid email or password',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        $userId = auth()->id();
        $clientIp = $request->ip();

        // Update the latest login history with logout time
        try {
            if ($userId) {
                LoginHistory::where('user_id', $userId)
                    ->where('ip_address', $clientIp)
                    ->whereNull('logged_out_at')
                    ->latest('logged_in_at')
                    ->first()
                    ?->update(['logged_out_at' => now()]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Logout history update failed: ' . $e->getMessage());
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($userId) {
            \Illuminate\Support\Facades\Cache::forget('user_online_' . $userId);
        }

        return redirect()->route('login');
    }

    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $key = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $this->recordLoginHistory($request, 'rate_limited');
            return response()->json([
                'message' => "Too many attempts. Try again in {$seconds} seconds.",
                'retry_after' => $seconds,
            ], 429);
        }

        $userForCheck = \App\Models\User::where('email', $credentials['email'])->first();
        if ($userForCheck && \Illuminate\Support\Facades\Hash::check($credentials['password'], $userForCheck->password)) {
            if (\Illuminate\Support\Facades\Cache::has('user_online_' . $userForCheck->id)) {
                $ip = $request->ip();
                try {
                    \Illuminate\Support\Facades\Mail::to($userForCheck->email)->send(new \App\Mail\ConcurrentLoginAlert($userForCheck, $ip));
                } catch (\Throwable $e) {}
                \Illuminate\Support\Facades\Cache::put('login_alert_' . $userForCheck->id, $ip, now()->addMinutes(2));
                return response()->json(['message' => 'Your account is currently logged in elsewhere. We have sent an alert to your email.'], 403);
            }
        }

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            $user = $request->user();

            // Deny login if user has no roles (access revoked)
            if (!$user->roles()->count()) {
                Auth::logout();
                $request->session()->invalidate();
                $this->recordLoginHistory($request, 'access_revoked', $user->id);
                return response()->json(['message' => 'Access revoked. Contact administrator.'], 403);
            }

            $request->session()->regenerate();
            RateLimiter::clear($key);
            $this->recordLoginHistory($request, 'api', $user->id);
            return response()->json([
                'user' => $user->load('roles', 'zone', 'circle', 'permissions'),
            ]);
        }

        RateLimiter::hit($key);
        $this->recordLoginHistory($request, 'failed_api');
        $attempts = RateLimiter::attempts($key);
        $remaining = max(0, 3 - $attempts);

        return response()->json([
            'message' => 'Invalid email or password',
            'remaining' => $remaining,
        ], 401);
    }

    public function apiLogout(Request $request)
    {
        $userId = Auth::id();
        $clientIp = $request->ip();

        // Update the latest login history with logout time
        try {
            if ($userId) {
                LoginHistory::where('user_id', $userId)
                    ->where('ip_address', $clientIp)
                    ->whereNull('logged_out_at')
                    ->latest('logged_in_at')
                    ->first()
                    ?->update(['logged_out_at' => now()]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('API logout history update failed: ' . $e->getMessage());
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($userId) {
            \Illuminate\Support\Facades\Cache::forget('user_online_' . $userId);
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Authenticate for the Forensic Portal (only users with forensic access).
     */
    public function apiForensicLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $key = $this->throttleKey($request);

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            $this->recordLoginHistory($request, 'rate_limited');
            return response()->json([
                'message' => "Too many attempts. Try again in {$seconds} seconds.",
                'retry_after' => $seconds,
            ], 429);
        }

        $userForCheck = \App\Models\User::where('email', $credentials['email'])->first();
        if ($userForCheck && \Illuminate\Support\Facades\Hash::check($credentials['password'], $userForCheck->password)) {
            if (\Illuminate\Support\Facades\Cache::has('user_online_' . $userForCheck->id)) {
                $ip = $request->ip();
                try {
                    \Illuminate\Support\Facades\Mail::to($userForCheck->email)->send(new \App\Mail\ConcurrentLoginAlert($userForCheck, $ip));
                } catch (\Throwable $e) {}
                \Illuminate\Support\Facades\Cache::put('login_alert_' . $userForCheck->id, $ip, now()->addMinutes(2));
                return response()->json(['message' => 'Your account is currently logged in elsewhere. We have sent an alert to your email.'], 403);
            }
        }

        if (!Auth::attempt($credentials, $request->filled('remember'))) {
            RateLimiter::hit($key);
            $this->recordLoginHistory($request, 'failed_forensic');
            $attempts = RateLimiter::attempts($key);
            $remaining = max(0, 3 - $attempts);
            return response()->json([
                'message' => 'Invalid email or password',
                'remaining' => $remaining,
            ], 401);
        }

        $user = $request->user();

        if (!$user->roles()->count()) {
            Auth::logout();
            $request->session()->invalidate();
            $this->recordLoginHistory($request, 'access_revoked', $user->id);
            return response()->json(['message' => 'Access revoked. Contact administrator.'], 403);
        }

        if (!$user->isForensic()) {
            Auth::logout();
            $request->session()->invalidate();
            $this->recordLoginHistory($request, 'denied_forensic', $user->id);
            return response()->json([
                'message' => 'This account does not have Forensic Portal access.',
            ], 403);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);
        $this->recordLoginHistory($request, 'forensic', $user->id);

        return response()->json([
            'user' => $user->load('roles', 'zone', 'circle', 'permissions'),
        ]);
    }

    private function recordLoginHistory(Request $request, string $method, ?int $userId = null): void
    {
        try {
            $targetUserId = $userId ?: auth()->id();
            if (!$targetUserId) {
                $targetUser = \App\Models\User::where('email', $request->input('email'))->first();
                $targetUserId = $targetUser?->id;
            }

            if ($targetUserId) {
                $ipService = app(IpDetectionService::class);
                $clientIp = $ipService->getClientIp($request);
                $realIp = $ipService->getRealIp($request);
                $proxyHeaders = $ipService->getProxyHeaders($request);
                $isSpoofed = $ipService->detectSpoofing($request);

                LoginHistory::create([
                    'user_id' => $targetUserId,
                    'ip_address' => $clientIp ?: '0.0.0.0',
                    'real_ip' => $realIp ?: $clientIp,
                    'proxy_headers' => $proxyHeaders ?: null,
                    'is_spoofed' => $isSpoofed,
                    'user_agent' => substr((string) $request->userAgent(), 0, 500),
                    'login_method' => $method,
                    'logged_in_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Login history recording failed: ' . $e->getMessage());
        }
    }

    private function throttleKey(Request $request): string
    {
        return 'login:' . strtolower($request->input('email')) . '|' . $request->ip();
    }
}
