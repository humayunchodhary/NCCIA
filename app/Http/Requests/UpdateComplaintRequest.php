<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        $complaint = $this->route('complaint');

        return $complaint
            && ($this->user()?->can('update', $complaint) ?? false);
    }

    public function rules(): array
    {
        return [
            'complainant_name' => 'required|string|max:255',
            'cnic' => 'required|string|max:15',
            'contact_no'              => 'required|string|max:20',
            'contact_country_code'    => 'nullable|string|max:8',
            'nationality'             => 'nullable|string|max:50',
            'passport_no'             => 'nullable|string|max:50|required_if:nationality,Dual Nationality Holder|required_if:nationality,Foreigner',
            'address' => 'required|string',
            'post_address' => 'nullable|string',
            'profession' => 'nullable|string|max:255',

            'report_date'        => 'required|date',
            'diary_no'           => 'required|string|max:255',
            'received_via'       => 'required|string|max:255',
            'received_from'      => 'required|string|max:255',
            'cmu'                => 'nullable|string|max:255',
            'priority_type'      => 'nullable|string|max:50',

            'offence_type'       => 'required|string|max:255',
            'amount_involved'    => 'nullable|numeric|min:0',
            'occurrence_date'    => 'required|date',
            'laws'               => 'nullable|array',
            'laws.*'             => 'string',
            'description'        => 'required|string|max:2000',
            'evidence'           => 'nullable|array',
            'evidence.*'         => 'string',

            'operator_name'         => 'nullable|string|max:255',
            'operator_designation'  => 'nullable|string|max:255',
            'entry_time'            => 'nullable|date',
            'operator_remarks'      => 'nullable|string',

            'source'     => 'nullable|string|max:50',
            'circle_id'  => 'nullable|integer|exists:circles,id',
            'operator_id' => 'nullable|integer|exists:users,id',
            'scrutiny_result' => 'nullable|string|in:complete,incomplete,invalid,irrelevant',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx|max:10240',

            // Assign VO on Complete Registration (same form)
            'verification_officer_id' => 'nullable|integer|exists:users,id',
            'assign_priority_type'    => 'nullable|string|in:normal,high,critical',
        ];
    }
}
