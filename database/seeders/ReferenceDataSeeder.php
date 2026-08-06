<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Law;
use App\Models\Rule;
use App\Models\Sop;
use App\Models\UserManual;

class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Laws ─────────────────────────────────────
        Law::insert([
            ['title' => 'Prevention of Electronic Crimes Act 2016', 'act_name' => 'PECA 2016', 'year' => '2016', 'description' => 'Primary legislation governing cyber crimes in Pakistan. Covers unauthorized access, data interference, cyber terrorism, electronic fraud, and online harassment.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pakistan Penal Code (Cyber Offences)', 'act_name' => 'PPC 1860', 'year' => '1860', 'description' => 'Relevant sections of PPC applicable to cyber offences including criminal breach of trust, cheating, and forgery committed through electronic means.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Electronic Transactions Ordinance 2002', 'act_name' => 'ETO 2002', 'year' => '2002', 'description' => 'Provides legal recognition for electronic records, digital signatures, and electronic transactions. Establishes the legal framework for e-commerce.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Investigation for Fair Trial Act 2013', 'act_name' => 'IFTA 2013', 'year' => '2013', 'description' => 'Governs criminal investigation procedures to ensure fair trial rights. Mandates timelines for investigation completion and case submission to courts.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Qanoon-e-Shahadat Order 1984 (Electronic Evidence)', 'act_name' => 'QSO 1984', 'year' => '1984', 'description' => 'Rules of evidence applicable in Pakistani courts. Recent amendments address admissibility of electronic records and digital evidence.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ─── Rules ─────────────────────────────────────
        Rule::insert([
            ['title' => 'NCCIA Case Registration Rules 2024', 'category' => 'Procedural', 'effective_date' => '2024-01-15', 'description' => 'Rules governing the registration, categorization, and assignment of cyber crime complaints received through all channels including online portal, email, and in-person.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Complaint Processing & Triage Guidelines', 'category' => 'Operational', 'effective_date' => '2024-02-01', 'description' => 'Standard procedures for initial complaint triage, severity assessment, and routing to appropriate investigation or verification teams.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Digital Evidence Handling & Chain of Custody', 'category' => 'Technical', 'effective_date' => '2024-03-10', 'description' => 'Mandatory protocols for seizure, preservation, analysis, and documentation of digital evidence to ensure admissibility in court proceedings.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Forensic Examination & Laboratory Procedures', 'category' => 'Technical', 'effective_date' => '2024-04-05', 'description' => 'Standard operating procedures for digital forensic examination including disk imaging, memory analysis, network forensics, and mobile device extraction.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Enquiry & Investigation Timelines', 'category' => 'Procedural', 'effective_date' => '2024-02-20', 'description' => 'Mandated timeframes for completion of preliminary enquiries, full investigations, and submission of Final Reports/Case Files to relevant authorities.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Verification Report Guidelines', 'category' => 'Operational', 'effective_date' => '2024-03-01', 'description' => 'Standards for verification report structure, content requirements, evidence annexures, and approval workflow for verification officers.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'IO Access & Data Confidentiality Rules', 'category' => 'Administrative', 'effective_date' => '2024-04-15', 'description' => 'Rules governing Investigation Officer system access levels, data viewing permissions, case assignment restrictions, and confidentiality obligations.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Court Case Management & Hearing Tracking', 'category' => 'Legal', 'effective_date' => '2024-05-01', 'description' => 'Procedures for tracking court cases, recording hearing outcomes, managing legal opinions, and forwarding verdicts to concerned departments.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Social Media Monitoring & Cyber Patrolling', 'category' => 'Operational', 'effective_date' => '2024-06-01', 'description' => 'Guidelines for proactive social media monitoring, identification of potential threats, cyber patrolling protocols, and escalation procedures.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ─── SOPs ──────────────────────────────────────
        Sop::insert([
            ['title' => 'Complaint Receipt & Acknowledgment', 'department' => 'Front Desk / Operations', 'version' => '1.2', 'effective_date' => '2024-01-15', 'description' => 'Step-by-step process for receiving complaints, issuing acknowledgment receipts, creating digital records, and forwarding for triage.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Digital Evidence Acquisition & Imaging', 'department' => 'Forensic Lab', 'version' => '2.0', 'effective_date' => '2024-03-10', 'description' => 'Detailed procedure for acquiring forensic images from storage devices, write-blocker usage, hash verification, and evidence packaging.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Enquiry Officer Case Assignment', 'department' => 'Operations', 'version' => '1.1', 'effective_date' => '2024-02-01', 'description' => 'Process for assigning enquiries to officers based on workload, expertise, jurisdiction, and case complexity.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Verification Report Submission & Approval', 'department' => 'Verification Wing', 'version' => '1.3', 'effective_date' => '2024-04-01', 'description' => 'End-to-end workflow for verification report creation, internal review, supervisor approval, and submission to requesting authority.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Court Hearing Attendance & Reporting', 'department' => 'Legal Wing', 'version' => '1.0', 'effective_date' => '2024-05-15', 'description' => 'Protocols for legal officer court attendance, hearing summary documentation, evidence submission tracking, and post-hearing reporting.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Forensic Report Generation', 'department' => 'Forensic Lab', 'version' => '2.1', 'effective_date' => '2024-06-01', 'description' => 'Standards for forensic report structure, findings documentation, methodology disclosure, and expert opinion formatting.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Inter-Agency Coordination & Information Sharing', 'department' => 'Administration', 'version' => '1.0', 'effective_date' => '2024-07-01', 'description' => 'Guidelines for secure information exchange with FIA, police, banks, telecom operators, and international agencies.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ─── User Manuals ──────────────────────────────
        UserManual::insert([
            ['title' => 'NCCIA Portal User Guide – Getting Started', 'audience' => 'All Users', 'version' => '1.0', 'description' => 'Complete guide to logging in, navigating the dashboard, understanding your role-based sidebar, and managing your profile settings.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Complaint Registration & Management', 'audience' => 'Operators / Moharrar', 'version' => '1.2', 'description' => 'How to register new complaints, update complaint details, manage attachments, perform scrutiny, and track complaint status.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Verification Module – Officer Guide', 'audience' => 'Verification Officers', 'version' => '1.1', 'description' => 'Step-by-step instructions for accepting verification assignments, conducting verifications, submitting reports, and responding to feedback.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Enquiry & Investigation Workflow', 'audience' => 'Enquiry Officers / IOs', 'version' => '1.0', 'description' => 'Guide to managing enquiries, recording case activities, submitting CFRs, generating DAC case files, and managing investigation records.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Digital Evidence Submission & Tracking', 'audience' => 'Investigation Officers / Forensic Staff', 'version' => '1.0', 'description' => 'How to submit digital evidence for forensic analysis, track examination progress, download forensic reports, and maintain chain of custody.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Court Case Management System', 'audience' => 'Legal Officers', 'version' => '1.1', 'description' => 'Guide to managing court case records, recording hearing details, uploading legal opinions, tracking verdicts, and generating case summaries.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'User & Permission Administration', 'audience' => 'Administrators', 'version' => '1.0', 'description' => 'Administrator guide for creating users, assigning roles, managing direct permissions, resetting passwords, and managing circle/zone configurations.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Analytics Dashboard – Reports & Insights', 'audience' => 'Administrators / DG / AD', 'version' => '1.0', 'description' => 'How to use the analytics module including monthly trends, category breakdown, officer performance metrics, and case outcome analysis.', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Offence Types & Legal Reference Library', 'audience' => 'All Users', 'version' => '1.0', 'description' => 'Guide to accessing and managing the legal reference library including cyber laws, procedural rules, SOPs, and user manuals.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
