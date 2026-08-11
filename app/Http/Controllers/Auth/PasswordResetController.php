<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordResetMailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    private const TOKEN_EXPIRE_MINUTES = 60;

    public function forgot(Request $request, PasswordResetMailService $mailer)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($data['email']));
        $key = 'password-reset:' . $email . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => "Too many reset attempts. Try again in {$seconds} seconds.",
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        $genericMessage = 'If that email is registered, a password reset link has been sent.';

        $user = User::where('email', $email)->first();
        if ($user && $user->roles()->exists()) {
            $plainToken = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token'      => Hash::make($plainToken),
                    'created_at' => now(),
                ]
            );

            $resetUrl = rtrim((string) config('app.url'), '/') . '/reset-password?' . http_build_query([
                'token' => $plainToken,
                'email' => $email,
            ]);

            $result = $mailer->send($user->email, $user->name, $resetUrl);
            if (!$result['ok']) {
                Log::error('Password reset email could not be sent', [
                    'email' => $email,
                    'error' => $result['error'],
                ]);
            }
        }

        return response()->json(['message' => $genericMessage]);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'email'                 => ['required', 'email', 'max:255'],
            'token'                 => ['required', 'string', 'min:32'],
            'password'              => ['required', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
            'password_confirmation' => ['required', 'string'],
        ], [
            'password.regex' => 'Password must include upper & lower case, a number, and a special character (@$!%*#?&).',
        ]);

        $email = strtolower(trim($data['email']));
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        $createdAt = $record->created_at ? \Carbon\Carbon::parse($record->created_at) : null;
        if (!$createdAt || $createdAt->lt(now()->subMinutes(self::TOKEN_EXPIRE_MINUTES))) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return response()->json(['message' => 'Reset link expired. Please request a new one.'], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user || !$user->roles()->exists()) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        $user->update(['password' => $data['password']]);
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json(['message' => 'Password updated successfully. You can sign in now.']);
    }
}
