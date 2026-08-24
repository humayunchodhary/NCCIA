<?php

namespace App\Http\Controllers;

use App\Models\Profession;
use App\Models\ReceivedViaOption;
use App\Models\ReceivedFromOption;
use App\Models\CMUOption;
use App\Models\OffenceType;
use Illuminate\Support\Facades\Cache;

class LookupController extends Controller
{
    public function professions()
    {
        $data = Cache::remember('lookup_professions', 3600, function () {
            return Profession::orderBy('name')->get(['id', 'name']);
        });
        return response()->json($data);
    }

    public function receivedVia()
    {
        $data = Cache::remember('lookup_received_via', 3600, function () {
            return ReceivedViaOption::orderBy('name')->get(['id', 'name']);
        });
        return response()->json($data);
    }

    public function receivedFrom()
    {
        $data = Cache::remember('lookup_received_from', 3600, function () {
            return ReceivedFromOption::orderBy('group')->orderBy('name')->get(['id', 'group', 'name']);
        });
        return response()->json($data);
    }

    public function cmuOptions()
    {
        $data = Cache::remember('lookup_cmu_options', 3600, function () {
            return CMUOption::orderBy('name')->get(['id', 'name']);
        });
        return response()->json($data);
    }

    public function offenceTypes()
    {
        $data = Cache::remember('lookup_offence_types', 3600, function () {
            return OffenceType::orderBy('group')->orderBy('name')->get(['id', 'group', 'name', 'value']);
        });
        return response()->json($data);
    }

    public function enquiryOfficers()
    {
        $user = request()->user();
        $circleId = ($user && $user->circle_id && !$user->hasAnyRole(['admin', 'director_general'])) ? $user->circle_id : 0;
        
        $data = Cache::remember('lookup_eo_circle_' . $circleId, 60, function () use ($user, $circleId) {
            $query = \App\Models\User::role('enquiry_officer')
                ->with('circle:id,name,code', 'zone:id,name,code')
                ->orderBy('name');

            if ($circleId > 0) {
                $query->where('circle_id', $circleId);
            }

            return $query->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id']);
        });

        return response()->json($data);
    }

    public function legalOfficers()
    {
        $data = Cache::remember('lookup_legal_officers', 60, function () {
            return \App\Models\User::role(['ad_legal', 'additional_director', 'dd_legal'])
                ->with('circle:id,name,code', 'zone:id,name,code')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id']);
        });

        return response()->json($data);
    }

    public function verificationOfficers()
    {
        $user = request()->user();
        $circleId = ($user && $user->circle_id && !$user->hasAnyRole(['admin', 'director_general'])) ? $user->circle_id : 0;

        $data = Cache::remember('lookup_vo_circle_' . $circleId, 60, function () use ($circleId) {
            $query = \App\Models\User::role('verification_officer')
                ->with('circle:id,name,code', 'zone:id,name,code')
                ->orderBy('name');

            if ($circleId > 0) {
                $query->where('circle_id', $circleId);
            }

            return $query->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id']);
        });

        return response()->json($data);
    }

    public function investigationOfficers()
    {
        $data = Cache::remember('lookup_investigation_officers', 60, function () {
            return \App\Models\User::role('investigation_officer')
                ->with('circle:id,name,code', 'zone:id,name,code')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id']);
        });

        return response()->json($data);
    }

    public function circleIncharges()
    {
        $data = Cache::remember('lookup_circle_incharges', 60, function () {
            return \App\Models\User::role('circle_incharge')
                ->with('circle:id,name,code', 'zone:id,name,code')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id']);
        });

        return response()->json($data);
    }
}
