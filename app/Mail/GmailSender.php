<?php

namespace App\Mail;

use Illuminate\Support\Facades\Log;

class GmailSender
{
    public static function send(string $to, string $subject, string $body): bool
    {
        // Try PHP mail() function first (most reliable on shared hosting)
        if (self::sendPhpMail($to, $subject, $body)) return true;

        // Fallback: try raw SMTP on multiple ports
        $username = env('MAIL_USERNAME', 'internsoftix407@gmail.com');
        $password = env('MAIL_PASSWORD', 'mtbf wqop ysgc iqur');

        foreach ([[587, true], [465, false], [25, false], [2525, false]] as [$port, $starttls]) {
            if (self::sendSmtp($to, $subject, $body, $username, $password, $port, $starttls)) return true;
        }

        return false;
    }

    private static function sendPhpMail(string $to, string $subject, string $body): bool
    {
        $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: NCCIA Portal <" . env('MAIL_FROM_ADDRESS', 'internsoftix407@gmail.com') . ">\r\n";
        try {
            return mail($to, $subject, $body, $headers);
        } catch (\Throwable $e) {
            Log::error("GmailSender: mail() failed: " . $e->getMessage());
            return false;
        }
    }

    private static function sendSmtp(string $to, string $subject, string $body, string $username, string $password, int $port, bool $starttls): bool
    {
        $host = "tcp://smtp.gmail.com";
        $ctx = stream_context_create(['ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ]]);

        $s = @stream_socket_client("{$host}:{$port}", $e, $s, 10, STREAM_CLIENT_CONNECT, $ctx);
        if (!$s) { return false; }
        self::read($s);

        self::write($s, "EHLO nccia\r\n"); self::readAll($s);

        if ($starttls) {
            self::write($s, "STARTTLS\r\n"); self::read($s);
            if (!@stream_socket_enable_crypto($s, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                fclose($s); return false;
            }
            self::write($s, "EHLO nccia\r\n"); self::readAll($s);
        }

        self::write($s, "AUTH LOGIN\r\n"); self::read($s);
        self::write($s, base64_encode($username) . "\r\n"); self::read($s);
        self::write($s, base64_encode($password) . "\r\n");
        $r = self::read($s);
        if (!str_contains($r, '235')) { fclose($s); return false; }

        self::write($s, "MAIL FROM:<{$username}>\r\n"); self::read($s);
        self::write($s, "RCPT TO:<{$to}>\r\n"); self::read($s);
        self::write($s, "DATA\r\n"); self::read($s);

        $headers = "From: NCCIA Portal <{$username}>\r\nTo: {$to}\r\nSubject: {$subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n";
        self::write($s, $headers . "\r\n" . $body . "\r\n.\r\n");
        self::read($s);

        self::write($s, "QUIT\r\n"); fclose($s);
        return true;
    }

    private static function write($s, $d) { @fwrite($s, $d); }
    private static function read($s) { return @fgets($s, 512); }
    private static function readAll($s) { while ($l = @fgets($s, 512)) { if ($l[3] === ' ') break; } }
}
