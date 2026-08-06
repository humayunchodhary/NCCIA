<?php

namespace App\Http\Controllers;

use App\Models\CaseFile;
use App\Models\Enquiry;
use App\Models\User;
use App\Models\Verification;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * List the authenticated user's notifications with unread count.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->limit(30)
            ->get()
            ->map(function ($n) {
                return [
                    'id'         => $n->id,
                    'type'       => class_basename($n->type),
                    'data'       => $n->data,
                    'read_at'    => $n->read_at?->toISOString(),
                    'created_at' => $n->created_at?->toISOString(),
                ];
            });

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'notifications' => $notifications,
        ]);
    }

    /**
     * Pending tasks assigned to the current officer
     * (plus items awaiting action for supervisory roles).
     */
    public function pendingTasks(Request $request)
    {
        $user = $request->user();
        $tasks = [];

        if (!$user) {
            return response()->json(['tasks' => [], 'count' => 0]);
        }

        // Verifications assigned to me, still pending
        foreach (Verification::where('verification_officer_id', $user->id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->with('complaint:id,tracking_no')
            ->orderByDesc('assigned_at')
            ->limit(10)
            ->get() as $v) {
            $tasks[] = [
                'module' => 'verification',
                'title'  => 'Verification for Complaint #' . ($v->complaint?->tracking_no ?? $v->complaint_id),
                'status' => $v->status,
                'url'    => '/verifications',
            ];
        }

        // Enquiries assigned to me, still pending
        foreach (Enquiry::where('enquiry_officer_id', $user->id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->with('complaint:id,tracking_no')
            ->orderByDesc('assignment_date')
            ->limit(10)
            ->get() as $e) {
            $tasks[] = [
                'module' => 'enquiry',
                'title'  => 'Enquiry ' . ($e->enquiry_number ?? ('#' . $e->id)) . ' — Complaint #' . ($e->complaint?->tracking_no ?? 'N/A'),
                'status' => $e->status,
                'url'    => '/enquiries',
            ];
        }

        // DAC cases assigned to me, still pending
        foreach (CaseFile::where('investigation_officer_id', $user->id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get() as $c) {
            $tasks[] = [
                'module' => 'case',
                'title'  => 'DAC Case (FIR #' . $c->fir_no . ')',
                'status' => $c->status,
                'url'    => '/cases',
            ];
        }

        // Supervisory roles: items awaiting their approval
        if ($user->seesAllData()) {
            foreach (Verification::whereIn('status', ['submitted'])
                ->with('complaint:id,tracking_no')
                ->orderByDesc('submitted_at')
                ->limit(10)
                ->get() as $v) {
                $tasks[] = [
                    'module' => 'verification_approval',
                    'title'  => 'Verification report awaiting approval — Complaint #' . ($v->complaint?->tracking_no ?? $v->complaint_id),
                    'status' => $v->status,
                    'url'    => '/verifications',
                ];
            }

            foreach (Enquiry::whereIn('status', ['cfr_submitted'])
                ->orderByDesc('submitted_at')
                ->limit(10)
                ->get() as $e) {
                $tasks[] = [
                    'module' => 'enquiry_approval',
                    'title'  => 'CFR awaiting approval — Enquiry ' . ($e->enquiry_number ?? ('#' . $e->id)),
                    'status' => $e->status,
                    'url'    => '/enquiries',
                ];
            }
        }

        return response()->json([
            'tasks' => $tasks,
            'count' => count($tasks),
        ]);
    }

    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
