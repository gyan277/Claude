import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, TrendingUp, ShieldCheck, Landmark, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import AnonymityBanner from '../components/AnonymityBanner';
import QuoteCard from '../components/QuoteCard';
import NewsSection from '../components/NewsSection';
import ConstitutionAssistant from '../components/ConstitutionAssistant';
import { useAuth } from '../context/AuthContext';

const METRICS: { label: string; value: string; icon: typeof FileText; to?: string }[] = [
  { label: 'Active Policies', value: '18', icon: FileText, to: '/policies' },
  { label: 'Forum Discussions', value: '342', icon: MessageSquare, to: '/forums' },
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
          {METRICS.map(({ label, value, icon: Icon, to }) => {
            const tileClass =
              'rounded-lg border border-slate-200 bg-white p-4 shadow-sm' +
              (to ? ' transition-shadow hover:shadow-md hover:border-ghana-green/40' : '');
            const content = (
              <>
                <Icon className="h-5 w-5 text-ghana-green" />
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </>
            );
            return to ? (
              <Link key={label} to={to} className={tileClass}>
                {content}
              </Link>
            ) : (
              <div key={label} className={tileClass}>
                {content}
              </div>
            );
          })}
        </div>

        <QuoteCard />

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="#ghana-news"
            className="group flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-ghana-green to-emerald-800 p-5 text-white shadow-sm"
          >
            <Landmark className="h-7 w-7 text-white/80" />
            <div className="mt-6">
              <h3 className="text-base font-semibold">Government News</h3>
              <p className="mt-1 text-sm text-white/80">
                Catch up on the latest from ministries and district assemblies.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                See updates
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>

          <Link
            to="/policies"
            className="group flex flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-ghana-red to-rose-900 p-5 text-white shadow-sm"
          >
            <FileText className="h-7 w-7 text-white/80" />
            <div className="mt-6">
              <h3 className="text-base font-semibold">Active Policies &amp; Bills</h3>
              <p className="mt-1 text-sm text-white/80">Read and respond to legislation shaping the country.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                Browse policies
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>

        <NewsSection />
      </div>

      <ConstitutionAssistant />
    </Layout>
  );
}
