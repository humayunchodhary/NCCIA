<?php

namespace App\Services;

use App\Mail\PasswordResetMail;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PasswordResetMailService
{
    /**
     * @return array{ok: bool, via: ?string, error: ?string}
     */
    public function send(string $to, string $name, string $resetUrl): array
    {
        $mailable = new PasswordResetMail($name, $resetUrl);

        $from = trim((string) env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME', 'noreply@nccia.real-erp.net')));
        $fromName = (string) env('MAIL_FROM_NAME', 'NCCIA Portal');
        $errors = [];

        Config::set('mail.from', ['address' => $from, 'name' => $fromName]);

        $host = trim((string) env('MAIL_HOST', 'localhost'));
        $isGmailHost = str_contains(strtolower($host), 'gmail.com');

        if (!$isGmailHost && $host !== '') {
            $username = trim((string) env('MAIL_USERNAME', ''));
            $password = (string) env('MAIL_PASSWORD', '');
            $port = (int) env('MAIL_PORT', 587);
            $scheme = env('MAIL_SCHEME');
            if (!$scheme) {
                $scheme = $port === 465 ? 'smtps' : null;
            }

            $r = $this->tryLaravelSmtp($to, $mailable, $host, $port, $scheme, $username ?: null, $password !== '' ? $password : null);
            if ($r['ok']) {
                return $r;
            }
            $errors[] = "smtp({$host}:{$port}): " . $r['error'];
        } else {
            $errors[] = 'smtp.gmail.com blocked by host — use cPanel mailbox SMTP or sendmail';
        }

        $r = $this->trySendmail($to, $mailable);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = 'sendmail: ' . $r['error'];

        $r = $this->tryPhpMail($to, $mailable, $from, $fromName);
        if ($r['ok']) {
            return $r;
        }
        $errors[] = 'php_mail: ' . $r['error'];

        $error = implode(' | ', $errors);
        Log::error('Password reset mail failed for ' . $to . ' — ' . $error);

        return ['ok' => false, 'via' => null, 'error' => $error];
    }

    /**
     * @return array{ok: bool, via: ?string, error: ?string}
     */
    private function tryLaravelSmtp(
        string $to,
        Mailable $mailable,
        string $host,
        int $port,
        ?string $scheme,
        ?string $username,
        ?string $password
    ): array {
        try {
            Config::set('mail.default', 'smtp');
            Config::set('mail.mailers.smtp', [
                'transport' => 'smtp',
                'scheme' => $scheme,
                'url' => null,
                'host' => $host,
                'port' => $port,
                'username' => $username,
                'password' => $password,
                'timeout' => 15,
                'local_domain' => parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'localhost',
                'stream' => [
                    'ssl' => [
                        'allow_self_signed' => true,
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ],
                ],
            ]);

            Mail::purge('smtp');
            Mail::mailer('smtp')->to($to)->send($mailable);

            Log::info("Password reset mail sent via smtp {$host}:{$port} to {$to}");

            return ['ok' => true, 'via' => "smtp:{$host}:{$port}", 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'via' => null, 'error' => $e->getMessage()];
        }
    }

    /**
     * @return array{ok: bool, via: ?string, error: ?string}
     */
    private function trySendmail(string $to, Mailable $mailable): array
    {
        try {
            Config::set('mail.default', 'sendmail');
            Mail::purge('sendmail');
            Mail::mailer('sendmail')->to($to)->send($mailable);

            Log::info("Password reset mail sent via sendmail to {$to}");

            return ['ok' => true, 'via' => 'sendmail', 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'via' => null, 'error' => $e->getMessage()];
        }
    }

    /**
     * @return array{ok: bool, via: ?string, error: ?string}
     */
    private function tryPhpMail(string $to, Mailable $mailable, string $from, string $fromName): array
    {
        try {
            $subject = 'NCCIA Portal - Reset Your Password';
            $html = $mailable->render();
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= 'From: "' . str_replace(['"', "\r", "\n"], '', $fromName) . "\" <{$from}>\r\n";
            $headers .= "Reply-To: {$from}\r\n";

            $ok = @mail($to, $subject, $html, $headers);
            if (!$ok) {
                return ['ok' => false, 'via' => null, 'error' => 'mail() returned false'];
            }

            Log::info("Password reset mail sent via php mail() to {$to}");

            return ['ok' => true, 'via' => 'php_mail', 'error' => null];
        } catch (\Throwable $e) {
            return ['ok' => false, 'via' => null, 'error' => $e->getMessage()];
        }
    }
}
