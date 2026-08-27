import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import AnonymityBanner from '../components/AnonymityBanner';
import NewsSection from '../components/NewsSection';
import ConstitutionAssistant from '../components/ConstitutionAssistant';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export default function Home() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    activePolicies: 0,
    forumDiscussions: 0,
    verifiedCitizens: 0,
    engagementChange: '+0%',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Load active policies count
      const { count: policiesCount } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Load forum discussions count
      const { count: forumsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      // Load verified citizens count
      const { count: verifiedCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true)
        .eq('role', 'citizen');

      // Calculate engagement this week (optional - simplified for now)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: recentActivity } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      const engagementPercent = forumsCount && forumsCount > 0 
        ? Math.round((recentActivity || 0) / forumsCount * 100)
        : 0;

      setMetrics({
        activePolicies: policiesCount || 0,
        forumDiscussions: forumsCount || 0,
        verifiedCitizens: verifiedCount || 0,
        engagementChange: `+${engagementPercent}%`,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const metricsData = [
    { label: 'Active Policies', value: loading ? '...' : metrics.activePolicies.toString(), icon: FileText, to: '/policies' },
    { label: 'Forum Discussions', value: loading ? '...' : metrics.forumDiscussions.toString(), icon: MessageSquare, to: '/forums' },
    { label: 'Verified Citizens', value: loading ? '...' : formatNumber(metrics.verifiedCitizens), icon: Users },
    { label: 'Engagement This Week', value: loading ? '...' : metrics.engagementChange, icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="space-y-4 md:space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-ghana-green to-ghana-green/90 p-5 md:p-8 text-white shadow-lg animate-gradient">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 opacity-10">
            <svg className="h-32 w-32 md:h-48 md:w-48" viewBox="0 0 100 100" fill="currentColor">
              {/* Ghana Star */}
              <path d="M50 15 L61 45 L92 45 L67 65 L78 95 L50 75 L22 95 L33 65 L8 45 L39 45 Z" />
            </svg>
          </div>
          
          <div className="relative flex items-start gap-4 md:gap-6">
            {/* Ghana Logo */}
            <div className="shrink-0 animate-bounce-in">
              <div className="relative">
                <div className="absolute inset-0 bg-ghana-gold/30 blur-xl rounded-full animate-pulse-slow"></div>
                <div className="relative rounded-xl bg-white/10 backdrop-blur-sm border-2 border-ghana-gold/50 p-2 md:p-3">
                  <img 
                    src="/src/assets/logo.png" 
                    alt="Ghana Government Logo" 
                    className="h-12 w-12 md:h-16 md:w-16 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 animate-slide-in-right">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                {user ? `Welcome back, ${user.name}` : 'Welcome to Dodow Amanmuo'}
              </h1>
              <p className="mt-2 md:mt-3 text-base md:text-lg lg:text-xl text-ghana-gold/90 leading-relaxed">
                {user
                  ? "Here's what's happening in civic life today."
                  : 'Policies, forums and every voice are open to everyone no account needed to look around.'}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Banner */}
        {user?.verified ? (
          <AnonymityBanner />
        ) : (
          <div className="card flex flex-col items-start gap-3 md:gap-4 p-3.5 md:p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="rounded-md md:rounded-lg bg-ghana-gold/10 p-2 md:p-2.5 shrink-0">
                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-ghana-gold" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900">Verify Your Identity</h3>
                <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-600">
                  {user
                    ? 'Verify your Ghana Card to vote, post, and be heard your activity stays anonymous.'
                    : "You're browsing publicly. Verify your Ghana Card to vote, postand be heard, your identity stays anonymous."}
                </p>
              </div>
            </div>
            {!user && (
              <Link
                to="/signup"
                className="btn-primary shrink-0 whitespace-nowrap text-xs md:text-sm px-3 py-2 md:px-4 md:py-2.5"
              >
                Register Now
              </Link>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {metricsData.map(({ label, value, icon: Icon, to }) => {
            const content = (
              <>
                <div className="rounded-md md:rounded-lg bg-ghana-green/10 p-2 md:p-3 w-fit">
                  <Icon className="h-4 w-4 md:h-6 md:w-6 text-ghana-green" />
                </div>
                <p className="mt-2 md:mt-4 text-xl md:text-3xl font-bold text-slate-900">{value}</p>
                <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-600">{label}</p>
              </>
            );
            return to ? (
              <Link key={label} to={to} className="card-interactive p-3 md:p-5">
                {content}
              </Link>
            ) : (
              <div key={label} className="card p-3 md:p-5">
                {content}
              </div>
            );
          })}
        </div>

        {/* News Section */}
        <NewsSection />
      </div>

      {/* Constitution Assistant */}
      <ConstitutionAssistant />
    </Layout>
  );
}
