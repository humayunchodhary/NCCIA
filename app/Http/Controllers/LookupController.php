<?php

namespace App\Http\Controllers;

use App\Models\Profession;
use App\Models\ReceivedViaOption;
use App\Models\ReceivedFromOption;
use App\Models\CMUOption;
use App\Models\OffenceType;

class LookupController extends Controller
{
    public function professions()
    {
        return response()->json(Profession::orderBy('name')->get(['id', 'name']));
    }

    public function receivedVia()
    {
        return response()->json(ReceivedViaOption::orderBy('name')->get(['id', 'name']));
    }

    public function receivedFrom()
    {
        return response()->json(ReceivedFromOption::orderBy('group')->orderBy('name')->get(['id', 'group', 'name']));
    }

    public function cmuOptions()
    {
        return response()->json(CMUOption::orderBy('name')->get(['id', 'name']));
    }

    public function offenceTypes()
    {
        return response()->json(OffenceType::orderBy('group')->orderBy('name')->get(['id', 'group', 'name', 'value']));
    }

    public function enquiryOfficers()
    {
        return response()->json(
            \App\Models\User::role('enquiry_officer')
                ->with('circle', 'zone')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id'])
        );
    }

    public function legalOfficers()
    {
        return response()->json(
            \App\Models\User::role(['ad_legal', 'additional_director', 'dd_legal'])
                ->with('circle', 'zone')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id'])
        );
    }

    public function verificationOfficers()
    {
        $user = request()->user();
        $query = \App\Models\User::role('verification_officer')
            ->with('circle', 'zone')
            ->orderBy('name');

        // Same-circle officers for operator / circle_incharge (admin sees all)
        if ($user && $user->circle_id && !$user->hasAnyRole(['admin', 'director_general'])) {
            $query->where('circle_id', $user->circle_id);
        }

        return response()->json(
            $query->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id'])
        );
    }

    public function investigationOfficers()
    {
        return response()->json(
            \App\Models\User::role('investigation_officer')
                ->with('circle', 'zone')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id'])
        );
    }

    public function circleIncharges()
    {
        return response()->json(
            \App\Models\User::role('circle_incharge')
                ->with('circle', 'zone')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'designation', 'circle_id', 'zone_id'])
        );
    }
}
