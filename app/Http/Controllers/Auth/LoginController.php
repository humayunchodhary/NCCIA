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

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            $request->session()->regenerate();
            RateLimiter::clear($key);
            $this->recordLoginHistory($request, 'web');
            return redirect('/');
        }

        RateLimiter::hit($key);

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
            return response()->json([
                'message' => "Too many attempts. Try again in {$seconds} seconds.",
                'retry_after' => $seconds,
            ], 429);
        }

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            $user = $request->user();

            // Deny login if user has no roles (access revoked)
            if (!$user->roles()->count()) {
                Auth::logout();
                $request->session()->invalidate();
                return response()->json(['message' => 'Access revoked. Contact administrator.'], 403);
            }

            $request->session()->regenerate();
            RateLimiter::clear($key);
            $this->recordLoginHistory($request, 'api');
            return response()->json([
                'user' => $user->load('roles', 'zone', 'circle', 'permissions'),
            ]);
        }

        RateLimiter::hit($key);
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

        Auth::logout();
        $request->session()->flush();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Delete all sessions for this user to ensure complete logout
        if ($userId) {
            \DB::table('sessions')->where('user_id', $userId)->delete();
        }

        $domain = config('session.domain');
        $secure = config('session.secure', false);
        $sameSite = config('session.same_site', 'lax');
        $sessionCookie = config('session.cookie');

        $response = response()->json(['message' => 'Logged out']);

        // Clear session cookie (httpOnly: true)
        $response->withCookie(cookie($sessionCookie, null, -2628000, '/', $domain, $secure, true, false, $sameSite));
        // Clear XSRF-TOKEN cookie (httpOnly: false so JS can read it)
        $response->withCookie(cookie('XSRF-TOKEN', null, -2628000, '/', $domain, $secure, false, false, $sameSite));

        return $response;
    }

    /**
     * Login for the isolated Forensic portal — only accounts holding a
     * forensic role are allowed to sign in here.
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
            return response()->json([
                'message' => "Too many attempts. Try again in {$seconds} seconds.",
                'retry_after' => $seconds,
            ], 429);
        }

        if (!Auth::attempt($credentials, $request->filled('remember'))) {
            RateLimiter::hit($key);
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
            return response()->json(['message' => 'Access revoked. Contact administrator.'], 403);
        }

        if (!$user->isForensic()) {
            Auth::logout();
            $request->session()->invalidate();
            return response()->json([
                'message' => 'This account does not have Forensic Portal access.',
            ], 403);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);
        $this->recordLoginHistory($request, 'forensic');

        return response()->json([
            'user' => $user->load('roles', 'zone', 'circle', 'permissions'),
        ]);
    }

    private function recordLoginHistory(Request $request, string $method): void
    {
        try {
            $ipService = app(IpDetectionService::class);
            $clientIp = $ipService->getClientIp($request);
            $realIp = $ipService->getRealIp($request);
            $proxyHeaders = $ipService->getProxyHeaders($request);
            $isSpoofed = $ipService->detectSpoofing($request);

            LoginHistory::create([
                'user_id' => auth()->id(),
                'ip_address' => $clientIp,
                'real_ip' => $realIp,
                'proxy_headers' => $proxyHeaders ?: null,
                'is_spoofed' => $isSpoofed,
                'user_agent' => $request->userAgent(),
                'login_method' => $method,
                'logged_in_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Login history recording failed: ' . $e->getMessage());
        }
    }

    private function throttleKey(Request $request): string
    {
        return 'login:' . strtolower($request->input('email')) . '|' . $request->ip();
    }
}
