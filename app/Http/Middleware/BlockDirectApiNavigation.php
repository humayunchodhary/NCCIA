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
    public function handle(Request , Closure ): Response
    {
        if ($request->is('api/*')) {
            $dest = $request->header('Sec-Fetch-Dest');
            $mode = $request->header('Sec-Fetch-Mode');

            if ($dest === 'document' || $mode === 'navigate') {
                return redirect('/');
            }
        }

        return $next($request);
    }
}
