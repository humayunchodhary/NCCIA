<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockDirectApiNavigation
{
    /**
     * Prevent direct browser address bar visits to raw API endpoints.
     * Legitimate AJAX / Axios / Mobile calls use Sec-Fetch-Dest: empty or send JSON headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/*')) {
            $dest = $request->header('Sec-Fetch-Dest');
            $mode = $request->header('Sec-Fetch-Mode');

            // 1. Direct browser address bar navigation blocked
            if ($dest === 'document' || $mode === 'navigate') {
                return redirect('/');
            }

            // 2. Direct browser GET requests without JSON headers blocked
            if ($request->isMethod('GET') && ! $request->expectsJson() && ! $request->ajax() && ! $request->bearerToken()) {
                return redirect('/');
            }
        }

        return $next($request);
    }
}
