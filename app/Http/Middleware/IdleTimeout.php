<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IdleTimeout
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $timeout = config('session.idle_timeout', 15); // minutes

            if ($timeout > 0) {
                $lastActivity = session('last_activity', now());
                $elapsed = now()->diffInMinutes($lastActivity);

                if ($elapsed >= $timeout) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    if ($request->expectsJson()) {
                        return response()->json(['message' => 'Session expired due to inactivity'], 401);
                    }

                    return redirect()->route('login');
                }
            }

            session(['last_activity' => now()]);
        }

        return $next($request);
    }
}
