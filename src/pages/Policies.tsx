import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export interface Policy {
  id: string;
  title: string;
  ministry: string;
  bullets: [string, string, string];
  supportPct: number;
}

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
  },
];

export default function Policies() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policies</h1>
          <p className="text-sm text-slate-500">Rapid, 3-bullet summaries of active legislation.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {POLICIES.map((policy) => (
            <Link
              key={policy.id}
              to={`/policies/${policy.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-ghana-green">{policy.ministry}</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">{policy.title}</h2>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {policy.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="text-ghana-gold">•</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs font-medium text-slate-400">{policy.supportPct}% public support</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
