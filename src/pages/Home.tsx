import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import AnonymityBanner from '../components/AnonymityBanner';
import QuoteCard from '../components/QuoteCard';
import NewsSection from '../components/NewsSection';
import { useAuth } from '../context/AuthContext';

const METRICS = [
  { label: 'Active Policies', value: '18', icon: FileText },
  { label: 'Forum Discussions', value: '342', icon: MessageSquare },
  { label: 'Verified Citizens', value: '12.4k', icon: Users },
  { label: 'Engagement This Week', value: '+9%', icon: TrendingUp },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user ? `Welcome back, ${user.name}` : 'Welcome to Dodow Amanmuo'}
          </h1>
          <p className="text-sm text-slate-500">
            {user
              ? "Here's what's happening in civic life today."
              : 'Policies, forums and every voice are open to everyone — no account needed to look around.'}
          </p>
        </div>

        {user?.verified ? (
          <AnonymityBanner />
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-ghana-gold/40 bg-ghana-gold/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ghana-gold" />
              <p className="text-slate-600">
                {user
                  ? 'Verify your Ghana Card to vote, post, and be heard — your activity stays anonymous.'
                  : "You're browsing publicly. Verify your Ghana Card to vote, post, and be heard — your identity stays anonymous."}
              </p>
            </div>
            {!user && (
              <Link
                to="/signup"
                className="shrink-0 rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white"
              >
                Register
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {METRICS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="h-5 w-5 text-ghana-green" />
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <QuoteCard />

        <NewsSection />
      </div>
    </Layout>
  );
}
