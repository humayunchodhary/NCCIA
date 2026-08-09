<?php

namespace App\Services;

use App\Mail\GmailSender;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpMailService
{
    /**
     * @return array{ok: bool, via: ?string, error: ?string}
     */
    public function send(string $to, string $otp, string $name): array
    {
        $username = trim((string) env('MAIL_USERNAME', ''));
        $password = preg_replace('/\s+/', '', (string) env('MAIL_PASSWORD', ''));
        $from = trim((string) env('MAIL_FROM_ADDRESS', $username));
        $fromName = (string) env('MAIL_FROM_NAME', 'NCCIA Portal');

        if ($username === '' || $password === '') {
            return ['ok' => false, 'via' => null, 'error' => 'MAIL_USERNAME / MAIL_PASSWORD missing in .env'];
        }

        $errors = [];

        // 1) Laravel SMTP 587 (STARTTLS) — preferred
        $r = $this->tryLaravelSmtp($to, $otp, $name, $username, $password, $from, $fromName, 587, null);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = '587: ' . $r['error'];

        // 2) Laravel SMTPS 465
        $r = $this->tryLaravelSmtp($to, $otp, $name, $username, $password, $from, $fromName, 465, 'smtps');
        if ($r['ok']) {
            return $r;
        }
        $errors[] = '465: ' . $r['error'];

        // 3) Raw socket fallback (Gmail 587)
        $subject = 'NCCIA Portal - OTP for Account Access';
        $html = view('emails.otp', ['otp' => $otp, 'name' => $name])->render();
        try {
            if (GmailSender::send($to, $subject, $html)) {
                return ['ok' => true, 'via' => 'gmail_socket', 'error' => null];
            }
            $errors[] = 'socket: send returned false (check storage/logs)';
        } catch (\Throwable $e) {
            $errors[] = 'socket: ' . $e->getMessage();
        }

        $error = implode(' | ', $errors);
        Log::error('OTP mail failed for ' . $to . ' — ' . $error);

        return ['ok' => false, 'via' => null, 'error' => $error];
    }

    /**
     * @return array{ok: bool, via: ?string, error: ?string}
     */
    private function tryLaravelSmtp(
        string $to,
        string $otp,
        string $name,
        string $username,
        string $password,
        string $from,
        string $fromName,
        int $port,
        ?string $scheme
    ): array {
        try {
            Config::set('mail.default', 'smtp');
            Config::set('mail.from', ['address' => $from, 'name' => $fromName]);
            Config::set('mail.mailers.smtp', [
                'transport' => 'smtp',
                'scheme' => $scheme,
                'url' => null,
                'host' => 'smtp.gmail.com',
                'port' => $port,
                'username' => $username,
                'password' => $password,
                'timeout' => 12,
                'local_domain' => 'nccia.real-erp.net',
                'stream' => [
                    'ssl' => [
                        'allow_self_signed' => true,
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ],
                ],
            ]);

            Mail::purge('smtp');
            Mail::mailer('smtp')->to($to)->send(new OtpMail($otp, $name));

            Log::info("OTP mail sent via Laravel smtp:{$port} to {$to}");

            return ['ok' => true, 'via' => "laravel:{$port}", 'error' => null];
        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            Log::warning("OTP Laravel smtp:{$port} failed: {$msg}");

            return ['ok' => false, 'via' => null, 'error' => $msg];
        }
    }
}
