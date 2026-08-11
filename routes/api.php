<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ComplaintPdfImportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\LookupController;
use App\Http\Controllers\CaseFileController;
use App\Http\Controllers\CourtCaseController;
use App\Http\Controllers\OffenceTypeController;
use App\Http\Controllers\InvestigationOfficerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReferenceController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SidebarCountsController;

Route::middleware(['web', 'auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'apiIndex']);
    Route::get('/analytics', [AnalyticsController::class, 'index']);
    Route::get('/search', SearchController::class)->name('api.search');

    // Complaints
    Route::get('/complaints', [ComplaintController::class, 'index'])->name('api.complaints.index');
    Route::get('/complaints/search', [ComplaintController::class, 'search'])->name('api.complaints.search');
    Route::post('/complaints', [ComplaintController::class, 'store'])
        ->middleware('role:operator,admin,circle_incharge,director_general')
        ->name('api.complaints.store');
    Route::get('/complaints/{complaint}', [ComplaintController::class, 'show'])->name('api.complaints.show');
    Route::put('/complaints/{complaint}', [ComplaintController::class, 'update'])->name('api.complaints.update');
    Route::delete('/complaints/{complaint}', [ComplaintController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('api.complaints.destroy');
    Route::get('/complaints/{complaint}/slip', [ComplaintController::class, 'slip'])->name('api.complaints.slip');
    Route::post('/complaints/{complaint}/scrutiny', [ComplaintController::class, 'scrutiny'])
        ->middleware('role:admin,circle_incharge');
    Route::post('/complaints/{complaint}/direct-assign', [ComplaintController::class, 'directAssign'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::post('/complaints/{complaint}/notify-complainant', [ComplaintController::class, 'notifyComplainant'])
        ->middleware('role:operator,admin,circle_incharge');

    Route::get('/complaint-pdf-imports', [ComplaintPdfImportController::class, 'index']);
    Route::get('/complaint-pdf-imports/stats', [ComplaintPdfImportController::class, 'stats']);
    Route::get('/complaint-pdf-imports/capabilities', [ComplaintPdfImportController::class, 'capabilities']);
    Route::post('/complaint-pdf-imports', [ComplaintPdfImportController::class, 'store'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::post('/complaint-pdf-imports/preview', [ComplaintPdfImportController::class, 'preview'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::post('/complaint-pdf-imports/render-page', [ComplaintPdfImportController::class, 'renderPage'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::get('/complaint-pdf-imports/{complaintPdfImport}', [ComplaintPdfImportController::class, 'show']);
    Route::post('/complaint-pdf-imports/{complaintPdfImport}/process', [ComplaintPdfImportController::class, 'process'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::post('/complaint-pdf-imports/{complaintPdfImport}/extract', [ComplaintPdfImportController::class, 'extract'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::post('/complaint-pdf-imports/{complaintPdfImport}/apply', [ComplaintPdfImportController::class, 'apply'])
        ->middleware('role:operator,admin,circle_incharge');

    Route::post('/adp/extract', [\App\Http\Controllers\AdpApplyController::class, 'extract'])
        ->middleware('role:operator,admin,circle_incharge');
    Route::post('/adp/apply', [\App\Http\Controllers\AdpApplyController::class, 'apply'])
        ->middleware('role:operator,admin,circle_incharge');

    // Verifications — SPECIFIC routes FIRST, then wildcard {verification} routes
    Route::get('/verifications', [VerificationController::class, 'index'])->name('api.verifications.index');
    Route::post('/verifications', [VerificationController::class, 'store'])
        ->middleware('role:operator,admin,circle_incharge')
        ->name('api.verifications.store');
    Route::get('/verifications/stats', [VerificationController::class, 'stats']);
    Route::get('/verifications/reports-list', [VerificationController::class, 'listReports']);
    Route::post('/verifications/reports/bulk-delete', [VerificationController::class, 'bulkDestroyReports']);
    Route::get('/verifications/reports/{report}', [VerificationController::class, 'showReport']);
    Route::put('/verifications/reports/{report}', [VerificationController::class, 'updateReport']);
    Route::delete('/verifications/reports/{report}', [VerificationController::class, 'destroyReport']);
    Route::post('/verifications/reports', [VerificationController::class, 'storeReport']);
    Route::post('/verifications/bulk-close', [VerificationController::class, 'bulkClose'])
        ->middleware('role:admin,circle_incharge');
    Route::get('/verifications/{verification}', [VerificationController::class, 'show'])->name('api.verifications.show');
    Route::put('/verifications/{verification}', [VerificationController::class, 'update'])->name('api.verifications.update');
    Route::delete('/verifications/{verification}', [VerificationController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('api.verifications.destroy');
    Route::post('/verifications/{verification}/submit-report', [VerificationController::class, 'submitReport']);
    Route::post('/verifications/{verification}/notify-complainant', [VerificationController::class, 'notifyComplainant']);
    Route::post('/verifications/{verification}/approve', [VerificationController::class, 'approve'])
        ->middleware('role:admin,circle_incharge');
    Route::post('/verifications/{verification}/change-officer', [VerificationController::class, 'changeOfficer'])
        ->middleware('role:admin,circle_incharge');

    // Enquiries — Verification Officer has no access (flowchart: separate Enquiry stage)
    Route::get('/enquiries', [EnquiryController::class, 'index'])->name('api.enquiries.index');
    Route::post('/enquiries', [EnquiryController::class, 'store'])
        ->middleware('role:admin,circle_incharge,operator,reader_branch,moharrar,enquiry_officer,director_general,ad_legal,dd_legal,additional_director')
        ->name('api.enquiries.store');
    Route::get('/enquiries/{enquiry}', [EnquiryController::class, 'show'])->name('api.enquiries.show');
    Route::put('/enquiries/{enquiry}', [EnquiryController::class, 'update'])->name('api.enquiries.update');
    Route::delete('/enquiries/{enquiry}', [EnquiryController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('api.enquiries.destroy');
    Route::get('/enquiries/{enquiry}/notice-print', [EnquiryController::class, 'noticePrint'])->name('api.enquiries.notice-print');
    Route::get('/enquiries/{enquiry}/diary-print', [EnquiryController::class, 'diaryPrint'])->name('api.enquiries.diary-print');
    Route::get('/enquiries/stats', [EnquiryController::class, 'stats']);
    Route::post('/enquiries/{enquiry}/assign', [EnquiryController::class, 'assign'])
        ->middleware('role:admin,circle_incharge');
    Route::post('/enquiries/{enquiry}/submit-cfr', [EnquiryController::class, 'submitCfr'])
        ->middleware('role:admin,circle_incharge,enquiry_officer');
    Route::post('/enquiries/{enquiry}/approve', [EnquiryController::class, 'approve'])
        ->middleware('role:admin,circle_incharge');
    Route::post('/enquiries/{enquiry}/register-case', [EnquiryController::class, 'registerCase'])
        ->middleware('role:admin,circle_incharge,moharrar,ad_legal,dd_legal,additional_director,director_general');
    Route::post('/enquiries/{enquiry}/change-officer', [EnquiryController::class, 'changeOfficer'])
        ->middleware('role:admin,circle_incharge');

    // DAC Cases
    Route::get('/cases', [CaseFileController::class, 'index'])->name('api.cases.index');
    Route::post('/cases', [CaseFileController::class, 'store'])->name('api.cases.store');
    Route::get('/cases/{caseFile}', [CaseFileController::class, 'show'])->name('api.cases.show');
    Route::put('/cases/{caseFile}', [CaseFileController::class, 'update'])->name('api.cases.update');
    Route::delete('/cases/{caseFile}', [CaseFileController::class, 'destroy'])->name('api.cases.destroy');
    Route::post('/cases/{caseFile}/assign-officer', [CaseFileController::class, 'assignOfficer'])
        ->middleware('role:admin,circle_incharge');
    Route::post('/cases/{caseFile}/submit-cfr', [CaseFileController::class, 'submitCfr']);
    Route::post('/cases/{caseFile}/approve', [CaseFileController::class, 'approve'])
        ->middleware('role:admin,circle_incharge');

    // Court Cases
    Route::get('/court-cases', [CourtCaseController::class, 'index'])->name('api.court-cases.index');
    Route::post('/court-cases', [CourtCaseController::class, 'store'])->name('api.court-cases.store');
    Route::get('/court-cases/{courtCase}', [CourtCaseController::class, 'show'])->name('api.court-cases.show');
    Route::put('/court-cases/{courtCase}', [CourtCaseController::class, 'update'])->name('api.court-cases.update');
    Route::delete('/court-cases/{courtCase}', [CourtCaseController::class, 'destroy'])->name('api.court-cases.destroy');
    Route::post('/court-cases/{courtCase}/verdict', [CourtCaseController::class, 'verdict'])->name('api.court-cases.verdict');
    Route::post('/court-cases/{courtCase}/forward-report', [CourtCaseController::class, 'forwardReport'])->name('api.court-cases.forward-report');
    Route::get('/court-cases/{courtCase}/hearings', [\App\Http\Controllers\HearingController::class, 'index']);
    Route::post('/court-cases/{courtCase}/hearings', [\App\Http\Controllers\HearingController::class, 'store']);

    // Offence Types - everyone can view, only admin can modify
    Route::get('/offence-types', [OffenceTypeController::class, 'index'])->name('api.offence-types.index');
    Route::post('/offence-types', [OffenceTypeController::class, 'store'])->name('api.offence-types.store')
        ->middleware('role:admin');
    Route::put('/offence-types/{offenceType}', [OffenceTypeController::class, 'update'])->name('api.offence-types.update')
        ->middleware('role:admin');
    Route::delete('/offence-types/{offenceType}', [OffenceTypeController::class, 'destroy'])->name('api.offence-types.destroy')
        ->middleware('role:admin');

    // Investigation Officers - admin/circle_incharge can view, only admin can modify
    Route::get('/investigation-officers', [InvestigationOfficerController::class, 'index'])->name('api.investigation-officers.index');
    Route::post('/investigation-officers', [InvestigationOfficerController::class, 'store'])->name('api.investigation-officers.store')
        ->middleware('role:admin');
    Route::get('/investigation-officers/{investigationOfficer}', [InvestigationOfficerController::class, 'show'])->name('api.investigation-officers.show')
        ->middleware('role:admin');
    Route::put('/investigation-officers/{investigationOfficer}', [InvestigationOfficerController::class, 'update'])->name('api.investigation-officers.update')
        ->middleware('role:admin');
    Route::delete('/investigation-officers/{investigationOfficer}', [InvestigationOfficerController::class, 'destroy'])->name('api.investigation-officers.destroy')
        ->middleware('role:admin');
    Route::post('/investigation-officers/{investigation_officer}/grant-access', [InvestigationOfficerController::class, 'grantAccess'])
        ->middleware('role:admin');
    Route::post('/investigation-officers/{investigation_officer}/revoke-access', [InvestigationOfficerController::class, 'revokeAccess'])
        ->middleware('role:admin');
    Route::post('/investigation-officers/{investigation_officer}/reset-password', [InvestigationOfficerController::class, 'resetPassword'])
        ->middleware('role:admin');
    Route::post('/investigation-officers/{investigation_officer}/send-otp', [InvestigationOfficerController::class, 'sendOtp'])
        ->middleware('role:admin');
    Route::post('/investigation-officers/{investigation_officer}/verify-otp', [InvestigationOfficerController::class, 'verifyOtp'])
        ->middleware('role:admin');

    // User management — admin only
    Route::get('/users', [UserController::class, 'index'])->name('api.users.index')
        ->middleware('role:admin');
    Route::post('/users', [UserController::class, 'store'])->name('api.users.store')
        ->middleware('role:admin');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('api.users.show')
        ->middleware('role:admin');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('api.users.update')
        ->middleware('role:admin');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('api.users.destroy')
        ->middleware('role:admin');
    Route::post('/users/{user}/grant-permission', [UserController::class, 'grantPermission'])
        ->middleware('role:admin');
    Route::post('/users/{user}/revoke-permission', [UserController::class, 'revokePermission'])
        ->middleware('role:admin');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->middleware('role:admin');

    // Circle management — admin only
    Route::get('/circles', function () {
        return response()->json(\App\Models\Circle::with('zone')->orderBy('name')->paginate(20));
    })->middleware('role:admin');
    Route::post('/circles', function (\Illuminate\Http\Request $req) {
        $data = $req->validate(['name' => 'required|string|max:255', 'code' => 'required|string|max:10|unique:circles,code', 'zone_id' => 'nullable|exists:zones,id']);
        return response()->json(\App\Models\Circle::create($data), 201);
    })->middleware('role:admin');
    Route::put('/circles/{circle}', function (\Illuminate\Http\Request $req, \App\Models\Circle $circle) {
        $data = $req->validate(['name' => 'required|string|max:255', 'code' => 'required|string|max:10|unique:circles,code,'.$circle->id, 'zone_id' => 'nullable|exists:zones,id']);
        $circle->update($data);
        return response()->json($circle->fresh()->load('zone'));
    })->middleware('role:admin');
    Route::delete('/circles/{circle}', function (\App\Models\Circle $circle) {
        $circle->delete();
        return response()->json(['message' => 'Circle deleted']);
    })->middleware('role:admin');

    // Lookups
    Route::get('/lookup/professions', [LookupController::class, 'professions']);
    Route::get('/lookup/received-via', [LookupController::class, 'receivedVia']);
    Route::get('/lookup/received-from', [LookupController::class, 'receivedFrom']);
    Route::get('/lookup/cmu-options', [LookupController::class, 'cmuOptions']);
    Route::get('/lookup/offence-types', [LookupController::class, 'offenceTypes']);
    Route::get('/lookup/roles', function () {
        return response()->json(\Spatie\Permission\Models\Role::orderBy('name')->pluck('name'));
    });
    Route::get('/lookup/circles', function () {
        return response()->json(\App\Models\Circle::orderBy('name')->get(['id', 'name', 'code', 'zone_id']));
    });
    Route::get('/lookup/zones', function () {
        return response()->json(\App\Models\Zone::orderBy('name')->get(['id', 'name', 'code']));
    });
    Route::get('/lookup/enquiry-officers', [LookupController::class, 'enquiryOfficers']);
    Route::get('/lookup/legal-officers', [LookupController::class, 'legalOfficers']);
    Route::get('/lookup/verification-officers', [LookupController::class, 'verificationOfficers']);
    Route::get('/lookup/investigation-officers', [LookupController::class, 'investigationOfficers']);
    Route::get('/lookup/circle-incharges', [LookupController::class, 'circleIncharges']);

    // Reference data — Laws, Rules, SOPs, User Manuals
    Route::get('/laws', [ReferenceController::class, 'lawsIndex']);
    Route::post('/laws', [ReferenceController::class, 'lawsStore']);
    Route::get('/laws/{law}', [ReferenceController::class, 'lawsShow']);
    Route::put('/laws/{law}', [ReferenceController::class, 'lawsUpdate']);
    Route::delete('/laws/{law}', [ReferenceController::class, 'lawsDestroy']);
    Route::get('/rules', [ReferenceController::class, 'rulesIndex']);
    Route::post('/rules', [ReferenceController::class, 'rulesStore']);
    Route::get('/rules/{rule}', [ReferenceController::class, 'rulesShow']);
    Route::put('/rules/{rule}', [ReferenceController::class, 'rulesUpdate']);
    Route::delete('/rules/{rule}', [ReferenceController::class, 'rulesDestroy']);
    Route::get('/sops', [ReferenceController::class, 'sopsIndex']);
    Route::post('/sops', [ReferenceController::class, 'sopsStore']);
    Route::get('/sops/{sop}', [ReferenceController::class, 'sopsShow']);
    Route::put('/sops/{sop}', [ReferenceController::class, 'sopsUpdate']);
    Route::delete('/sops/{sop}', [ReferenceController::class, 'sopsDestroy']);
    Route::get('/user-manuals', [ReferenceController::class, 'manualsIndex']);
    Route::post('/user-manuals', [ReferenceController::class, 'manualsStore']);
    Route::get('/user-manuals/{manual}', [ReferenceController::class, 'manualsShow']);
    Route::put('/user-manuals/{manual}', [ReferenceController::class, 'manualsUpdate']);
    Route::delete('/user-manuals/{manual}', [ReferenceController::class, 'manualsDestroy']);

    Route::get('/sidebar-counts', SidebarCountsController::class);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/pending-tasks', [NotificationController::class, 'pendingTasks']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Internal messaging
    Route::get('/messages/contacts', [MessageController::class, 'contacts']);
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/conversations/{user}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::post('/messages/read-all', [MessageController::class, 'markAllRead']);
});
