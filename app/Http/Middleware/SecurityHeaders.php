<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Anti-Clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Prevent MIME-sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Legacy XSS filter protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Strict Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Restrict device hardware permissions (microphone allowed for live voice sample recording)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()');

        // Disallow cross-domain Flash/PDF policy files
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // Cross-Origin Isolation
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

        // Hide internal pages from search engines & scrapers
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');

        // Enforce HTTPS HSTS (HTTP Strict Transport Security)
        $response->headers->set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

        return $response;
    }
}

