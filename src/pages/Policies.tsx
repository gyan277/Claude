import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import { POLICIES, STATUS_STEPS } from '../data/policies';

const STATUS_LABEL = Object.fromEntries(STATUS_STEPS.map((step) => [step.key, step.label]));

export default function Policies() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POLICIES;
    return POLICIES.filter(
      (policy) => policy.title.toLowerCase().includes(q) || policy.ministry.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Policies</h1>
          <p className="text-sm text-slate-500">Rapid, 3-bullet summaries of active legislation.</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search policies or ministries…"
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-ghana-green focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((policy) => (
            <Link
              key={policy.id}
              to={`/policies/${policy.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-ghana-green">{policy.ministry}</p>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-500">
                  {STATUS_LABEL[policy.status]}
                </span>
              </div>
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
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-slate-400">No policies match "{query}".</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
