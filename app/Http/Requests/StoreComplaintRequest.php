<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Step 1
            'complainant_name'  => 'required|string|max:255',
            'cnic'              => 'required|string|max:15|regex:/^\d{5}-\d{7}-\d$/',
            'contact_no'              => 'required|string|max:20',
            'contact_country_code'    => 'nullable|string|max:8',
            'nationality'             => 'nullable|string|max:50',
            'passport_no'             => 'nullable|string|max:50|required_if:nationality,Dual Nationality Holder|required_if:nationality,Foreigner',
            'address'           => 'required|string|max:2000',
            'post_address'      => 'nullable|string|max:2000',
            'profession'        => 'nullable|string|max:255',

            // Step 2
            'report_date'    => 'required|date',
            'diary_no'       => 'required|string|max:100',
            'received_via'   => 'required|string|max:255',
            'received_from'  => 'required|string|max:255',
            'cmu'            => 'nullable|string|max:255',
            'priority_type'  => 'nullable|string|in:normal,high,critical',

            // Step 3
            'offence_type'     => 'required|string|max:255',
            'amount_involved'  => 'nullable|numeric|min:0',
            'occurrence_date'  => 'required|date',
            'laws'             => 'nullable|array',
            'laws.*'           => 'string|max:100',
            'description'      => 'required|string|max:2000',
            'evidence'         => 'nullable|array',
            'evidence.*'       => 'string|max:100',

            // Step 4
            'operator_name'         => 'required|string|max:255',
            'operator_designation'  => 'required|string|max:255',
            'entry_time'            => 'required|date',
            'operator_remarks'      => 'nullable|string|max:2000',

            // New fields
            'source'     => 'nullable|string|max:50',
            'circle_id'  => 'nullable|integer|exists:circles,id',
            'operator_id' => 'nullable|integer|exists:users,id',
            'scrutiny_result' => 'nullable|string|in:complete,incomplete,invalid,irrelevant',
        ];
    }

    public function messages(): array
    {
        return [
            'cnic.regex'       => 'CNIC must follow format: XXXXX-XXXXXXX-X',

        ];
    }
}
