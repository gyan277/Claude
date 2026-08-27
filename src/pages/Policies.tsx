import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../services/supabaseClient';

const STATUS_STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'proposed', label: 'Proposed' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'approved', label: 'Approved' },
  { key: 'active', label: 'Active' },
];

const STATUS_LABEL = Object.fromEntries(STATUS_STEPS.map((step) => [step.key, step.label]));

interface Policy {
  id: string;
  title: string;
  description: string;
  ministry?: string;
  category: string;
  status: string;
  created_at: string;
}

export default function Policies() {
  const [query, setQuery] = useState('');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter(
      (policy) => 
        policy.title.toLowerCase().includes(q) || 
        policy.ministry?.toLowerCase().includes(q) ||
        policy.description?.toLowerCase().includes(q)
    );
  }, [policies, query]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="animate-slide-in-left">
          <h1 className="text-2xl font-bold text-slate-900">Policies</h1>
          <p className="text-sm text-slate-500">Rapid, 3-bullet summaries of active legislation.</p>
        </div>

        <div className="relative max-w-sm animate-slide-in-right">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search policies or ministries…"
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-ghana-green focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center p-8">
            <p className="text-sm text-slate-500">Loading policies...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-sm text-slate-500">
              {query ? `No policies match "${query}"` : 'No policies yet. Admins can add policies from the admin panel.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((policy, index) => (
              <Link
                key={policy.id}
                to={`/policies/${policy.id}`}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-ghana-green/40 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-ghana-green">{policy.ministry || 'Government'}</p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-500">
                    {STATUS_LABEL[policy.status] || policy.status}
                  </span>
                </div>

                <h2 className="mt-3 font-semibold text-slate-900 leading-snug">{policy.title}</h2>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{policy.description}</p>
                <p className="mt-2 text-xs text-slate-500">Category: {policy.category}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
