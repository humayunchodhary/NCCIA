<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Verification;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Global header search: tracking no / complainant / CNIC / verification id.
     */
    public function __invoke(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        if (mb_strlen($q) < 1) {
            return response()->json(['data' => []]);
        }

        $user = $request->user();
        $like = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $q) . '%';

        // Prefer prefix match on tracking/cnic (index-friendly) for scale
        $complaints = Complaint::visibleTo($user)
            ->with(['verification.officer'])
            ->where(function ($query) use ($like, $q) {
                $query->where('tracking_no', 'like', $q . '%')
                    ->orWhere('diary_no', 'like', $q . '%')
                    ->orWhere('cnic', 'like', $q . '%')
                    ->orWhere('complainant_name', 'like', $q . '%');

                if (ctype_digit($q)) {
                    $query->orWhere('id', (int) $q);
                } elseif (str_contains($q, '/')) {
                    $query->orWhere('tracking_no', 'like', '%' . $q . '%');
                }
            })
            ->orderByDesc('id')
            ->limit(12)
            ->get();

        // Also match verification id directly when numeric
        $extraVerificationIds = [];
        if (ctype_digit($q)) {
            $extraVerificationIds = Verification::visibleTo($user)
                ->where('id', (int) $q)
                ->whereNotIn('complaint_id', $complaints->pluck('id'))
                ->with(['complaint', 'officer'])
                ->limit(5)
                ->get();
        }

        $results = $complaints->map(function (Complaint $c) {
            $v = $c->verification;

            return [
                'type'              => 'complaint',
                'id'                => $c->id,
                'tracking_no'       => $c->tracking_no,
                'complainant_name'  => $c->complainant_name,
                'cnic'              => $c->cnic,
                'status'            => $c->final_status ?: $c->status,
                'verification_id'   => $v?->id,
                'verification_no'   => $v ? ('V-' . $v->id) : null,
                'verification_status' => $v?->status,
                'officer_name'      => $v?->officer?->name,
                'process_url'       => $v
                    ? '/verifications/' . $v->id . '/edit'
                    : '/complaints/' . $c->id . '/edit',
            ];
        });

        foreach ($extraVerificationIds as $v) {
            $c = $v->complaint;
            if (!$c) {
                continue;
            }
            $results->push([
                'type'              => 'verification',
                'id'                => $c->id,
                'tracking_no'       => $c->tracking_no,
                'complainant_name'  => $c->complainant_name,
                'cnic'              => $c->cnic,
                'status'            => $c->final_status ?: $c->status,
                'verification_id'   => $v->id,
                'verification_no'   => 'V-' . $v->id,
                'verification_status' => $v->status,
                'officer_name'      => $v->officer?->name,
                'process_url'       => '/verifications/' . $v->id . '/edit',
            ]);
        }

        return response()->json(['data' => $results->values()]);
    }
}
