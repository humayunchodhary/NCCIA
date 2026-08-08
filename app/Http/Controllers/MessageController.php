<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * List all active portal users the current user can message.
     */
    public function contacts(Request $request)
    {
        $users = User::whereHas('roles')
            ->where('id', '!=', $request->user()->id)
            ->with('roles')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'designation'])
            ->map(function ($u) {
                return [
                    'id'          => $u->id,
                    'name'        => $u->name,
                    'email'       => $u->email,
                    'designation' => $u->designation,
                    'role'        => $u->roles->first()?->name ?? 'user',
                ];
            });

        return response()->json($users);
    }

    /**
     * List conversations (distinct other users) with last message + unread count.
     */
    public function conversations(Request $request)
    {
        $me = $request->user()->id;

        $messages = Message::where('sender_id', $me)
            ->orWhere('receiver_id', $me)
            ->orderByDesc('id')
            ->get();

        $otherIds = $messages
            ->map(fn ($m) => $m->sender_id === $me ? $m->receiver_id : $m->sender_id)
            ->unique()
            ->values();

        $conversations = $otherIds->map(function ($otherId) use ($me) {
            $last = Message::where(function ($q) use ($me, $otherId) {
                $q->where('sender_id', $me)->where('receiver_id', $otherId);
            })->orWhere(function ($q) use ($me, $otherId) {
                $q->where('sender_id', $otherId)->where('receiver_id', $me);
            })->orderByDesc('id')->first();

            $other = User::with('roles')->find($otherId);
            if (!$other) {
                return null;
            }

            return [
                'user' => [
                    'id'          => $other->id,
                    'name'        => $other->name,
                    'designation' => $other->designation,
                    'role'        => $other->roles->first()?->name ?? 'user',
                ],
                'last_message' => $last?->message,
                'last_time'    => $last?->created_at?->toISOString(),
                'unread'       => Message::where('sender_id', $otherId)
                    ->where('receiver_id', $me)
                    ->where('is_read', false)
                    ->count(),
            ];
        })->filter()->sortByDesc('last_time')->values();

        return response()->json($conversations);
    }

    /**
     * Show the thread between me and $user; marks incoming messages as read.
     */
    public function show(Request $request, User $user)
    {
        $me = $request->user();

        if ($user->id === $me->id) {
            return response()->json(['message' => 'You cannot open a conversation with yourself.'], 422);
        }

        Message::where('sender_id', $user->id)
            ->where('receiver_id', $me->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        $messages = Message::between($me->id, $user->id)
            ->orderBy('created_at')
            ->with('sender:id,name')
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'sender_id'  => $m->sender_id,
                'message'    => $m->message,
                'is_read'    => $m->is_read,
                'created_at' => $m->created_at?->toISOString(),
            ]);

        return response()->json($messages);
    }

    /**
     * Send a message to another user.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|integer|exists:users,id',
            'message'     => 'required|string|max:5000',
        ]);

        if ((int) $data['receiver_id'] === $request->user()->id) {
            return response()->json(['message' => 'You cannot send a message to yourself.'], 422);
        }

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $data['receiver_id'],
            'message'     => trim($data['message']),
        ]);

        return response()->json($message->load('sender:id,name'), 201);
    }

    /**
     * Total unread message count for the current user (for the nav badge).
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => Message::where('receiver_id', $request->user()->id)
                ->where('is_read', false)
                ->count(),
        ]);
    }

    /**
     * Mark all incoming unread messages as read.
     */
    public function markAllRead(Request $request)
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All messages marked as read', 'marked' => $count]);
    }
}
