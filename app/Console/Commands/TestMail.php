<?php

namespace App\Console\Commands;

use App\Services\OtpMailService;
use Illuminate\Console\Command;

class TestMail extends Command
{
    protected $signature = 'nccia:test-mail {email? : Recipient email}';

    protected $description = 'Send a test OTP email to verify Gmail SMTP on this server';

    public function handle(OtpMailService $mailer): int
    {
        $email = $this->argument('email') ?: (string) env('MAIL_USERNAME');
        if (!$email) {
            $this->error('Provide an email: php artisan nccia:test-mail you@gmail.com');

            return self::FAILURE;
        }

        $this->info('Sending test OTP to ' . $email . ' ...');
        $this->line('MAIL_USERNAME=' . env('MAIL_USERNAME'));
        $this->line('MAIL_HOST=' . env('MAIL_HOST') . ' PORT=' . env('MAIL_PORT'));

        $result = $mailer->send($email, '123456', 'Test User');

        if ($result['ok']) {
            $this->info('SUCCESS via ' . $result['via']);

            return self::SUCCESS;
        }

        $this->error('FAILED: ' . $result['error']);
        $this->warn('Agar connection timeout dikhe: cPanel host ne outbound SMTP (587/465) block kiya hua ho sakta hai.');

        return self::FAILURE;
    }
}
