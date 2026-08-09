// Role → feature permission matrix (keep in sync with RolesAndPermissionsSeeder + flowchart)
export const ROLE_FEATURES = {
  admin:                ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'users', 'circles', 'offence_types', 'reference', 'profile'],
  circle_incharge:      ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'offence_types', 'reference', 'profile'],
  // Verification stage only
  verification_officer: ['dashboard', 'verifications', 'reports', 'profile'],
  // Enquiry stage
  enquiry_officer:      ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  // Case / Court stage
  investigation_officer:['dashboard', 'dac_cases', 'court_cases', 'profile'],
  moharrar:             ['dashboard', 'analytics', 'complaints', 'enquiries', 'dac_cases', 'court_cases', 'offence_types', 'reference', 'profile'],
  reader_branch:        ['dashboard', 'complaints', 'enquiries', 'profile'],
  operator:             ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'offence_types', 'reference', 'profile'],
  ad_legal:             ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  dd_legal:             ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  additional_director:  ['dashboard', 'enquiries', 'dac_cases', 'profile'],
  director_general:     ['dashboard', 'analytics', 'complaints', 'verifications', 'reports', 'enquiries', 'io_records', 'dac_cases', 'court_cases', 'users', 'circles', 'offence_types', 'reference', 'profile'],
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

/** Who may register / create complaints (CMU / Operator stage) */
export function canCreateComplaint(user) {
  return hasAnyRole(user, ['admin', 'circle_incharge', 'operator']);
}

/** Who may assign verification officers (Circle Incharge / Operator) */
export function canAssignVerification(user) {
  return hasAnyRole(user, ['admin', 'circle_incharge', 'operator']);
}
