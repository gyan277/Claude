import { FileText, MessageSquare, Users, TrendingUp } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-500">Here's what's happening in civic life today.</p>
        </div>

        <AnonymityBanner />

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
