import { useMemo, useState } from 'react';
import { Users, TrendingUp, MapPin, Inbox, ThumbsUp, ThumbsDown } from 'lucide-react';
import Layout from '../components/Layout';
import { POLICIES, DISTRICT_ENGAGEMENT } from '../data/policies';
import { listOfficialResponses } from '../services/officialResponses';

export default function Insights() {
  const [responses] = useState(() => listOfficialResponses());

  const averageSupport = useMemo(
    () => Math.round(POLICIES.reduce((sum, policy) => sum + policy.supportPct, 0) / POLICIES.length),
    [],
  );

  const mostEngagedDistrict = useMemo(
    () => [...DISTRICT_ENGAGEMENT].sort((a, b) => b.participants - a.participants)[0],
    [],
  );

  const awaitingResponse = POLICIES.filter((policy) => !responses[policy.id]).length;

  const maxParticipants = Math.max(...DISTRICT_ENGAGEMENT.map((d) => d.participants));

  const kpis = [
    { label: 'Verified Citizens', value: '12.4k', icon: Users },
    { label: 'Average Public Support', value: `${averageSupport}%`, icon: TrendingUp },
    { label: 'Most Engaged District', value: mostEngagedDistrict.district, icon: MapPin, small: true },
    { label: 'Policies Awaiting Response', value: String(awaitingResponse), icon: Inbox },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Insights</h1>
          <p className="text-sm text-slate-500">
            Real-time signal from verified, anonymous citizen engagement — for assembly and ministry use.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon, small }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="h-5 w-5 text-ghana-green" />
              <p className={`mt-2 font-bold text-slate-900 ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Public sentiment by policy</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5 text-ghana-green" /> Support
              </span>
              <span className="flex items-center gap-1.5">
                <ThumbsDown className="h-3.5 w-3.5 text-ghana-red" /> Oppose
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {POLICIES.map((policy) => {
              const oppose = 100 - policy.supportPct;
              return (
                <div key={policy.id}>
                  <p className="mb-1 text-sm font-medium text-slate-700">{policy.title}</p>
                  <div className="flex h-3 w-full gap-0.5 bg-slate-100" role="img" aria-label={`${policy.supportPct}% support, ${oppose}% oppose`}>
                    <div
                      className="flex h-full items-center justify-end rounded-l-full bg-ghana-green pr-1.5 text-[10px] font-semibold text-white"
                      style={{ width: `${policy.supportPct}%` }}
                    >
                      {policy.supportPct >= 12 && `${policy.supportPct}%`}
                    </div>
                    <div
                      className="flex h-full items-center justify-start rounded-r-full bg-ghana-red pl-1.5 text-[10px] font-semibold text-white"
                      style={{ width: `${oppose}%` }}
                    >
                      {oppose >= 12 && `${oppose}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <details className="mt-4 text-xs text-slate-500">
            <summary className="cursor-pointer select-none font-medium text-slate-600">View as table</summary>
            <table className="mt-2 w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-1 pr-4 font-medium">Policy</th>
                  <th className="py-1 pr-4 font-medium">Support</th>
                  <th className="py-1 font-medium">Oppose</th>
                </tr>
              </thead>
              <tbody>
                {POLICIES.map((policy) => (
                  <tr key={policy.id} className="border-b border-slate-100">
                    <td className="py-1 pr-4">{policy.title}</td>
                    <td className="py-1 pr-4">{policy.supportPct}%</td>
                    <td className="py-1">{100 - policy.supportPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Engagement by district</h2>
          <div className="space-y-3">
            {DISTRICT_ENGAGEMENT.map((entry) => (
              <div key={entry.district} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-slate-600">{entry.district}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-ghana-gold"
                    style={{ width: `${(entry.participants / maxParticipants) * 100}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-medium text-slate-500">
                  {entry.participants.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
