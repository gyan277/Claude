export type PolicyStatus = 'proposed' | 'under-review' | 'passed' | 'implemented';

export interface Policy {
  id: string;
  title: string;
  ministry: string;
  bullets: [string, string, string];
  supportPct: number;
  status: PolicyStatus;
}

export const STATUS_STEPS: { key: PolicyStatus; label: string }[] = [
  { key: 'proposed', label: 'Proposed' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'passed', label: 'Passed' },
  { key: 'implemented', label: 'Implemented' },
];

export const POLICIES: Policy[] = [
  {
    id: 'local-governance-bill',
    title: 'Local Governance Amendment Bill',
    ministry: 'Ministry of Local Government',
    bullets: [
      'Expands district assembly budget authority.',
      'Introduces quarterly public spending disclosures.',
      'Creates citizen oversight committees per district.',
    ],
    supportPct: 64,
    status: 'under-review',
  },
  {
    id: 'digital-id-rollout',
    title: 'National Digital ID Rollout',
    ministry: 'Ministry of Communications',
    bullets: [
      'Links Ghana Card to civic and financial services.',
      'Phases rollout across regions over 18 months.',
      'Adds biometric fallback for rural enrollment centers.',
    ],
    supportPct: 71,
    status: 'passed',
  },
  {
    id: 'road-contracts-transparency',
    title: 'Road Contracts Transparency Act',
    ministry: 'Ministry of Roads and Highways',
    bullets: [
      'Publishes all contract awards above GHS 500,000.',
      'Requires independent audits for delayed projects.',
      'Adds a public complaints portal for road works.',
    ],
    supportPct: 58,
    status: 'proposed',
  },
];

export interface DistrictEngagement {
  district: string;
  participants: number;
}

export const DISTRICT_ENGAGEMENT: DistrictEngagement[] = [
  { district: 'Accra Metropolitan', participants: 3120 },
  { district: 'Kumasi Metropolitan', participants: 2480 },
  { district: 'Tamale Metropolitan', participants: 1390 },
  { district: 'Cape Coast Metropolitan', participants: 980 },
];
