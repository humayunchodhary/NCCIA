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
            'cnic'                 => $this->cnic,
            'contact_no'           => $this->contact_no,
            'contact_country_code' => $this->contact_country_code,
            'nationality'          => $this->nationality,
            'passport_no'          => $this->passport_no,
            'address'              => $this->address,
            'post_address'         => $this->post_address,
            'profession'           => $this->profession,
            'report_date'          => $this->report_date?->format('Y-m-d'),
            'diary_no'             => $this->diary_no,
            'received_via'         => $this->received_via,
            'received_from'        => $this->received_from,
            'cmu'                  => $this->cmu,
            'priority_type'        => $this->priority_type,
            'offence_type'         => $this->offence_type,
            'amount_involved'      => $this->amount_involved,
            'occurrence_date'      => $this->occurrence_date?->format('Y-m-d'),
            'laws'                 => $this->laws,
            'description'          => $this->description,
            'evidence'             => $this->evidence,
            'operator_name'        => $this->operator_name,
            'operator_designation' => $this->operator_designation,
            'entry_time'           => $this->entry_time?->format('Y-m-d\TH:i'),
            'scrutiny_result'      => $this->scrutiny_result,
            'operator_remarks'     => $this->operator_remarks,
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
            'created_at'           => $this->created_at?->toISOString(),
            'updated_at'           => $this->updated_at?->toISOString(),
        ];
    }
}
