<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\VerificationController;

Route::get('/', function () {
    return file_get_contents(public_path('react/index.html'));
})->name('dashboard');

Route::get('/login', function () {
    return file_get_contents(public_path('react/index.html'));
})->name('login');

Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Sanctum SPA auth routes (need session middleware from web group)
Route::post('/api/login', [LoginController::class, 'apiLogin']);
Route::post('/api/logout', [LoginController::class, 'apiLogout'])->middleware('auth:sanctum');
Route::get('/api/user', function (Request $r) {
    return $r->user()->load('roles', 'zone', 'circle', 'permissions');
})->middleware('auth:sanctum');

Route::put('/api/user/profile', function (Request $r) {
    $user = $r->user();
    $data = $r->validate([
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
        'password' => ['sometimes', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
    ]);
    if (!empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
    }
    $user->update($data);
    return response()->json(['message' => 'Profile updated', 'user' => $user->fresh()->load('roles', 'zone', 'circle')]);
})->middleware('auth:sanctum');

Route::post('/api/user/upload-signature', function (Request $r) {
    $user = $r->user();
    $r->validate(['signature' => 'required|file|mimes:jpg,jpeg,png|max:1024']);
    $path = $r->file('signature')->store('signatures', 'public');
    if ($user->signature) {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($user->signature);
    }
    $user->update(['signature' => $path]);
    return response()->json(['message' => 'Signature uploaded', 'user' => $user->fresh()->load('roles', 'zone', 'circle')]);
})->middleware('auth:sanctum');

// PDF download (needs auth but Laravel handles via React link)
Route::get('verifications/reports/{report}/pdf', [VerificationController::class, 'downloadPdf'])
    ->name('verifications.reports.pdf')
    ->middleware('auth');

// Force logout - no auth required, destroys any lingering session
Route::get('/force-logout', function (Illuminate\Http\Request $r) {
    Auth::logout();
    $r->session()->flush();
    $r->session()->invalidate();
    $r->session()->regenerateToken();
    $domain = config('session.domain');
    $secure = config('session.secure', false);
    $sameSite = config('session.same_site', 'lax');
    $sessionCookie = config('session.cookie');
    return redirect('/login')
        ->withCookie(cookie($sessionCookie, null, -2628000, '/', $domain, $secure, true, false, $sameSite))
        ->withCookie(cookie('XSRF-TOKEN', null, -2628000, '/', $domain, $secure, false, false, $sameSite));
});

// Public notice verification (scanned via QR code)
Route::get('/verify/notice/{token}', [EnquiryController::class, 'verifyNotice'])->name('notice.verify');

// React SPA - serve React app for all frontend routes
Route::get('/{any?}', function () {
    return file_get_contents(public_path('react/index.html'));
})->where('any', '^(?!api/|sanctum/).*');
