// Role → feature matrix (sync with RolesAndPermissionsSeeder + NCCIA flowchart)
export const ROLE_FEATURES = {
  admin:                ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'users', 'circles', 'offence_types', 'reference', 'profile'],
  circle_incharge:      ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'offence_types', 'reference', 'profile'],
  operator:             ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'profile'],
  verification_officer: ['dashboard', 'verifications', 'reports', 'profile'],
  enquiry_officer:      ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  investigation_officer:['dashboard', 'dac_cases', 'court_cases', 'profile'],
  moharrar:             ['dashboard', 'dac_cases', 'court_cases', 'profile'],
  reader_branch:        ['dashboard', 'enquiries', 'profile'],
  ad_legal:             ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  dd_legal:             ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  additional_director:  ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  director_general:     ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'users', 'circles', 'offence_types', 'reference', 'profile'],
};

/** Who fills / does what (flowchart WS_FLOW_CHART) */
export const ROLE_DUTIES = {
  operator: {
    stage: 'Complaint (CMU)',
    fills: [
      'Complainant details (Name, CNIC, Contact, Address, Profession)',
      'Complaint details (Report Date, Received Via, Diary No, Received From)',
      'Crime details (Description, Offence Type, Amount, Occurrence)',
      'Operator details + Scrutiny (Complete / Incomplete / Invalid / Irrelevant)',
      'Direct Assign Verification Officer after tracking no.',
    ],
  },
  circle_incharge: {
    stage: 'Complaint → Verification → Enquiry → Case',
    fills: [
      'Complaint analysis & workload analysis',
      'Assign / change Verification Officer',
      'Approve verification report (Agree / Review)',
      'Assign Enquiry Officer & approve CFR',
      'Assign Investigation Officer & approve case CFR',
    ],
  },
  verification_officer: {
    stage: 'Verification only',
    fills: [
      'Call / notify complainant (appearance message / WhatsApp)',
      'Verification process & victim verification report',
      'VO Comments on verification report',
      'Recommendations: Enquiry Registration / Closure / Merge / Transfer',
      'Submit verification report for Circle approval',
    ],
  },
  enquiry_officer: {
    stage: 'Enquiry',
    fills: [
      'DAC request, bank record, search & seize',
      'Notices, diaries, seizures, recoveries',
      'Submit CFR + recommendations',
    ],
  },
  investigation_officer: {
    stage: 'Case / Court',
    fills: [
      'Mobile/bank record, notices, case diaries',
      'Seizures, forensics, raids, arrest / remand',
      'CFR / challan recommendations & court reports',
    ],
  },
  reader_branch: {
    stage: 'Enquiry registration',
    fills: ['Generate / record Enquiry Number'],
  },
  moharrar: {
    stage: 'Case / FIR',
    fills: ['Generate / record FIR Number', 'Case registry support'],
  },
  ad_legal: {
    stage: 'Legal',
    fills: ['Legal opinion on enquiry / case / court reports'],
  },
  dd_legal: {
    stage: 'Legal',
    fills: ['Legal opinion on enquiry / case / court reports'],
  },
  additional_director: {
    stage: 'Legal / Approval',
    fills: ['Opinion / approval on legal reports'],
  },
  admin: {
    stage: 'All stages',
    fills: ['Full system administration & all module access'],
  },
  director_general: {
    stage: 'Oversight',
    fills: ['Monitor all modules, analytics, higher directions'],
  },
};

export function canView(feature, user) {
  if (!user) return false;
  const permissions = user.permissions?.map?.(p => p.name || p) || [];
  if (permissions.includes(feature)) return true;
  const roles = user.roles?.map?.(r => r.name || r) || [user.role || ''];
  return roles.some(r => ROLE_FEATURES[r]?.includes(feature));
}

export function hasRole(user, roleName) {
  return !!user?.roles?.some(r => (r.name || r) === roleName);
}

export function hasAnyRole(user, roleNames) {
  return roleNames.some(r => hasRole(user, r));
}

export function canCreateComplaint(user) {
  return hasAnyRole(user, ['admin', 'circle_incharge', 'operator']);
}

export function canAssignVerification(user) {
  return hasAnyRole(user, ['admin', 'circle_incharge', 'operator']);
}

export function getRoleDuties(user) {
  const roles = user?.roles?.map?.(r => r.name || r) || [user?.role].filter(Boolean);
  const primary = roles[0] || 'operator';
  return { role: primary, ...(ROLE_DUTIES[primary] || ROLE_DUTIES.operator) };
}
