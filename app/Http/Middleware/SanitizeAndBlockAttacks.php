<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SanitizeAndBlockAttacks
{
    /**
     * Common attack signatures to instantly block (LFI, RFI, Path Traversal, Null Byte, Malicious Schemes, SSTI, Prototype Pollution, SQLi)
     */
    protected array $dangerousPatterns = [
        '/\.\.[\/\\\\]/',                                    // Directory traversal (../ or ..\)
        '/%00|\x00/',                                        // Null byte injection
        '/<\s*script\b[^>]*>/i',                             // Direct script tags
        '/javascript\s*:/i',                                 // Javascript URI scheme
        '/data\s*:\s*text\/html/i',                          // Data HTML scheme
        '/(?:\bunion\b\s+(?:all\s+)?\bselect\b)/i',         // Classic SQL injection union select
        '/;\s*(?:shutdown|drop\s+table|exec\s+xp_|truncate\s+table)/i', // High-risk SQL destruction
        '/(?:\bbenchmark\b\s*\(\s*\d+\s*,|\bsleep\b\s*\(\s*\d+\s*\))/i', // Time-based blind SQLi
        '/(?:__proto__|constructor\.prototype)/i',           // Prototype pollution attempts
        '/(?:\{\{\s*(?:config|app|env|system|phpinfo)\s*\}\})/i', // SSTI / Template injection
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // 1. Inspect URL path and raw query string for blatant attack attempts
        $uri = urldecode($request->getRequestUri());
        foreach ($this->dangerousPatterns as $pattern) {
            if (preg_match($pattern, $uri)) {
                Log::warning('Security Alert: Intrusion attempt blocked', [
                    'ip'         => $request->ip(),
                    'uri'        => $uri,
                    'user_agent' => $request->userAgent(),
                    'user_id'    => $request->user()?->id,
                    'timestamp'  => now()->toIso8601String(),
                ]);

                return response()->json([
                    'error'   => 'Access Denied',
                    'message' => 'Malicious payload or suspicious characters detected in request.',
                ], 400);
            }
        }

        // 2. Sanitize all string inputs (strip null bytes and dangerous control characters)
        $cleanInputs = $this->cleanArray($request->all());
        $request->merge($cleanInputs);

        return $next($request);
    }

    protected function cleanArray(array $inputs): array
    {
        foreach ($inputs as $key => $value) {
            if (is_string($value)) {
                // Strip null bytes and control chars while keeping normal unicode/Urdu text
                $inputs[$key] = str_replace(["\0", "\x00", "\r\0"], '', $value);
            } elseif (is_array($value)) {
                $inputs[$key] = $this->cleanArray($value);
            }
        }
        return $inputs;
    }
}
