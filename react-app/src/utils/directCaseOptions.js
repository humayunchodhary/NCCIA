/** Shared options for VIP / direct / departmental entries (no normal complaint). */

export const HIGH_PROFILE_TYPES = [
  { value: 'vip', name: 'VIP' },
  { value: 'vvip', name: 'VVIP' },
  { value: 'high_profile', name: 'High Profile' },
  { value: 'political', name: 'Political' },
  { value: 'media_sensitive', name: 'Media Sensitive' },
  { value: 'court_directed', name: 'Court Directed' },
  { value: 'other', name: 'Other' },
];

export const DEPARTMENT_TYPES = [
  { value: 'individual', name: 'Individual' },
  { value: 'police', name: 'Police' },
  { value: 'fia', name: 'FIA' },
  { value: 'nab', name: 'NAB' },
  { value: 'court', name: 'Court' },
  { value: 'ministry', name: 'Ministry / Federal Dept' },
  { value: 'provincial', name: 'Provincial Department' },
  { value: 'intelligence', name: 'Intelligence Agency' },
  { value: 'other_agency', name: 'Other Agency' },
];

export const DIRECT_RECEIVED_VIA = [
  { value: 'individually', name: 'Individually' },
  { value: 'departmental_referral', name: 'Departmental Referral' },
  { value: 'letter_dispatch', name: 'Letter / Dispatch' },
  { value: 'court_order', name: 'Court Order' },
  { value: 'hq_directive', name: 'HQ Directive' },
  { value: 'other', name: 'Other' },
];

export const emptyDirectInfo = () => ({
  reference_no: '',
  complainant_name: '',
  circle_id: '',
  circle_code: '',
  high_profile_type: '',
  department_type: '',
  received_via: '',
});

export function normalizeDirectInfo(raw = {}) {
  return {
    ...emptyDirectInfo(),
    ...raw,
    reference_no: raw.reference_no || '',
    complainant_name: raw.complainant_name || '',
    circle_id: raw.circle_id || '',
    circle_code: raw.circle_code || '',
    high_profile_type: raw.high_profile_type || '',
    department_type: raw.department_type || '',
    received_via: raw.received_via || '',
  };
}
