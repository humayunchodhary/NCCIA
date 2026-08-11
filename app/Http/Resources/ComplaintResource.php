<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplaintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'tracking_no'          => $this->tracking_no,
            'complainant_name'     => $this->complainant_name,
            'father_name'          => $this->father_name,
            'cnic'                 => $this->cnic,
            'contact_no'           => $this->contact_no,
            'whatsapp_no'          => $this->whatsapp_no,
            'gender'               => $this->gender,
            'email'                => $this->email,
            'contact_country_code' => $this->contact_country_code,
            'nationality'          => $this->nationality,
            'passport_no'          => $this->passport_no,
            'address'              => $this->address,
            'post_address'         => $this->post_address,
            'district'             => $this->district,
            'profession'           => $this->profession,
            'report_date'          => $this->report_date?->format('Y-m-d'),
            'reporting_time'       => $this->reporting_time?->format('Y-m-d\TH:i'),
            'diary_no'             => $this->diary_no,
            'received_via'         => $this->received_via,
            'received_from'        => $this->received_from,
            'cmu'                  => $this->cmu,
            'priority_type'        => $this->priority_type,
            'offence_type'         => $this->offence_type,
            'crime_mediums'        => $this->crime_mediums,
            'amount_involved'      => $this->amount_involved,
            'bank_name_sender'     => $this->bank_name_sender,
            'bank_name_receiver'   => $this->bank_name_receiver,
            'account_no_sender'    => $this->account_no_sender,
            'account_no_receiver'  => $this->account_no_receiver,
            'transaction_date'     => $this->transaction_date?->format('Y-m-d'),
            'occurrence_date'      => $this->occurrence_date?->format('Y-m-d'),
            'laws'                 => $this->laws,
            'description'          => $this->description,
            'platforms'            => $this->platforms,
            'platform_profile_page'    => $this->platform_profile_page,
            'platform_username'        => $this->platform_username,
            'platform_email_involved'  => $this->platform_email_involved,
            'platform_mobile_involved' => $this->platform_mobile_involved,
            'evidence'             => $this->evidence,
            'initial_accused'      => $this->initial_accused,
            'operator_name'        => $this->operator_name,
            'operator_designation' => $this->operator_designation,
            'entry_time'           => $this->entry_time?->format('Y-m-d\TH:i'),
            'scrutiny_result'      => $this->scrutiny_result,
            'operator_remarks'     => $this->operator_remarks,
            'registration_message' => $this->registration_message,
            'registration_notify_via' => $this->registration_notify_via,
            'registration_notified_at' => $this->registration_notified_at?->toISOString(),
            'user_id'              => $this->user_id,
            'status'               => $this->status,
            'final_status'         => $this->final_status,
            'closure_reason'       => $this->closure_reason,
            'merged_with_id'       => $this->merged_with_id,
            'transfer_to_department' => $this->transfer_to_department,
            'transfer_to_circle_id'  => $this->transfer_to_circle_id,
            'enquiry_id'           => $this->enquiry_id,
            'enquiry'              => $this->whenLoaded('enquiry', function () {
                return $this->enquiry ? [
                    'id'             => $this->enquiry->id,
                    'enquiry_number' => $this->enquiry->enquiry_number,
                    'status'         => $this->enquiry->status,
                ] : null;
            }),
            'circle_id'            => $this->circle_id,
            'circle_name'          => $this->whenLoaded('circle', fn () => $this->circle?->name),
            'attachment'           => $this->attachment,
            'attachment_url'       => $this->attachment ? url($this->attachment) : null,
            'slip_generated'       => $this->slip_generated,
            'slip_generated_at'    => $this->slip_generated_at?->toISOString(),
            'slip_number'          => $this->slip_number,
            'source'               => $this->source,
            'operator_id'          => $this->operator_id,
            'progress_percent'     => $this->progressPercent(),
            'progress_stage'       => $this->progressStage(),
            'workflow'             => $this->workflowProgress(),
            'verification'         => $this->whenLoaded('verification', function () {
                if (!$this->verification) {
                    return null;
                }

                return [
                    'id'                      => $this->verification->id,
                    'status'                  => $this->verification->status,
                    'verification_officer_id' => $this->verification->verification_officer_id,
                    'priority_type'           => $this->verification->priority_type,
                    'assigned_at'             => $this->verification->assigned_at?->toISOString(),
                    'submitted_at'            => $this->verification->submitted_at?->toISOString(),
                    'approved_at'             => $this->verification->approved_at?->toISOString(),
                    'completed_at'            => $this->verification->completed_at?->toISOString(),
                    'appeared_at'             => $this->verification->appeared_at?->toISOString(),
                    'officer_name'            => $this->verification->relationLoaded('officer')
                        ? $this->verification->officer?->name
                        : null,
                ];
            }),
            'created_at'           => $this->created_at?->toISOString(),
            'updated_at'           => $this->updated_at?->toISOString(),
        ];
    }
}
