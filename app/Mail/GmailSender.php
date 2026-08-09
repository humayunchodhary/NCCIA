<?php

namespace App\Mail;

use Illuminate\Support\Facades\Log;

/**
 * Reliable OTP/mail delivery for shared hosting (cPanel).
 * Tries PHP mail(), then Gmail SMTP (587 STARTTLS / 465 SSL).
 */
class GmailSender
{
    public static function send(string $to, string $subject, string $body): bool
    {
        $username = (string) env('MAIL_USERNAME', 'humayunchodhary@gmail.com');
        $password = preg_replace('/\s+/', '', (string) env('MAIL_PASSWORD', 'cqyq tzaa jndp zajf'));
        $from = (string) env('MAIL_FROM_ADDRESS', $username);
        $fromName = (string) env('MAIL_FROM_NAME', 'NCCIA Portal');

        if ($username === '' || $password === '') {
            Log::error('GmailSender: MAIL_USERNAME / MAIL_PASSWORD missing');
            return false;
        }

        // 1) Hosting PHP mail()
        if (self::sendPhpMail($to, $subject, $body, $from, $fromName)) {
            Log::info("GmailSender: OTP mail sent via PHP mail() to {$to}");
            return true;
        }

        // 2) Laravel-configured SMTP host (if not localhost)
        $cfgHost = (string) env('MAIL_HOST', '');
        if ($cfgHost !== '' && !in_array($cfgHost, ['127.0.0.1', 'localhost'], true)) {
            $cfgPort = (int) env('MAIL_PORT', 587);
            $enc = strtolower((string) env('MAIL_ENCRYPTION', $cfgPort === 465 ? 'ssl' : 'tls'));
            $mode = $enc === 'ssl' ? 'ssl' : 'starttls';
            if (self::sendSmtp($cfgHost, $cfgPort, $mode, $to, $subject, $body, $username, $password, $fromName)) {
                Log::info("GmailSender: OTP mail sent via {$cfgHost}:{$cfgPort} to {$to}");
                return true;
            }
        }

        // 3) Gmail SMTP fallbacks
        $attempts = [
            ['smtp.gmail.com', 587, 'starttls'],
            ['smtp.gmail.com', 465, 'ssl'],
        ];

        foreach ($attempts as [$host, $port, $mode]) {
            if (self::sendSmtp($host, $port, $mode, $to, $subject, $body, $username, $password, $fromName)) {
                Log::info("GmailSender: OTP mail sent via {$host}:{$port} ({$mode}) to {$to}");
                return true;
            }
        }

        Log::error("GmailSender: all delivery methods failed for {$to}");

        return false;
    }

    private static function sendPhpMail(string $to, string $subject, string $body, string $from, string $fromName): bool
    {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= 'From: ' . self::encodeAddress($fromName, $from) . "\r\n";
        $headers .= "Reply-To: {$from}\r\n";

        try {
            return @mail($to, $subject, $body, $headers);
        } catch (\Throwable $e) {
            Log::warning('GmailSender: mail() exception: ' . $e->getMessage());

            return false;
        }
    }

    private static function sendSmtp(
        string $host,
        int $port,
        string $mode,
        string $to,
        string $subject,
        string $body,
        string $username,
        string $password,
        string $fromName
    ): bool {
        $remote = ($mode === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
        $ctx = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ],
        ]);

        $socket = @stream_socket_client($remote, $errno, $errstr, 20, STREAM_CLIENT_CONNECT, $ctx);
        if (!$socket) {
            Log::warning("GmailSender: connect failed {$remote}: {$errno} {$errstr}");

            return false;
        }

        stream_set_timeout($socket, 20);

        try {
            self::expect($socket, 220);

            self::write($socket, "EHLO nccia.local\r\n");
            self::readAll($socket);

            if ($mode === 'starttls') {
                self::write($socket, "STARTTLS\r\n");
                self::expect($socket, 220);
                if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new \RuntimeException('STARTTLS crypto failed');
                }
                self::write($socket, "EHLO nccia.local\r\n");
                self::readAll($socket);
            }

            self::write($socket, "AUTH LOGIN\r\n");
            self::expect($socket, 334);
            self::write($socket, base64_encode($username) . "\r\n");
            self::expect($socket, 334);
            self::write($socket, base64_encode($password) . "\r\n");
            $auth = self::read($socket);
            if (!str_starts_with(trim($auth), '235')) {
                throw new \RuntimeException('SMTP AUTH failed: ' . trim($auth));
            }

            self::write($socket, "MAIL FROM:<{$username}>\r\n");
            self::expect($socket, 250);
            self::write($socket, "RCPT TO:<{$to}>\r\n");
            self::expect($socket, 250);
            self::write($socket, "DATA\r\n");
            self::expect($socket, 354);

            $headers = 'From: ' . self::encodeAddress($fromName, $username) . "\r\n";
            $headers .= "To: {$to}\r\n";
            $headers .= "Subject: {$subject}\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

            self::write($socket, $headers . "\r\n" . $body . "\r\n.\r\n");
            self::expect($socket, 250);

            self::write($socket, "QUIT\r\n");
            fclose($socket);

            return true;
        } catch (\Throwable $e) {
            Log::warning('GmailSender: SMTP ' . $remote . ' failed: ' . $e->getMessage());
            @fclose($socket);

            return false;
        }
    }

    private static function encodeAddress(string $name, string $email): string
    {
        $safe = str_replace(['"', "\r", "\n"], '', $name);

        return "\"{$safe}\" <{$email}>";
    }

    private static function write($socket, string $data): void
    {
        fwrite($socket, $data);
    }

    private static function read($socket): string
    {
        $line = fgets($socket, 515);

        return $line === false ? '' : $line;
    }

    private static function readAll($socket): string
    {
        $buf = '';
        while ($line = fgets($socket, 515)) {
            $buf .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        return $buf;
    }

    private static function expect($socket, int $code): string
    {
        $line = self::readAll($socket);
        if (!str_starts_with(trim($line), (string) $code)) {
            throw new \RuntimeException("Expected {$code}, got: " . trim($line));
        }

        return $line;
    }
}
