import { useEffect, useState } from 'react';
import { Users, TrendingUp, FileText, MessageSquare, ThumbsUp } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export default function Insights() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPolicies: 0,
    totalForumPosts: 0,
    totalUsers: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load policies count
      const { count: policiesCount } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true });

      // Load forum posts count
      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      // Load users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Load votes count
      const { count: votesCount } = await supabase
        .from('policy_votes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPolicies: policiesCount || 0,
        totalForumPosts: postsCount || 0,
        totalUsers: usersCount || 0,
        totalVotes: votesCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMinister = user?.role === 'minister';
  const isAssembly = user?.role === 'assembly';
  const isAdmin = isMinister || isAssembly;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-slide-in-left">
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Dashboard' : 'Insights'}
          </h1>
          <p className="text-sm text-slate-500">
            {isAdmin 
              ? `Welcome back, ${user?.name}. Here's an overview of civic engagement.`
              : 'Platform statistics and engagement metrics.'
            }
          </p>
        </div>

        {/* Role Badge */}
        {user && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-ghana-green/10 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-ghana-green animate-pulse"></div>
            <span className="text-sm font-medium text-ghana-green capitalize">
              {user.role === 'minister' ? 'Minister' : user.role === 'assembly' ? 'Assembly Member' : 'Citizen'}
            </span>
            {user.verified && <span className="text-xs text-ghana-green/70">• Verified</span>}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center p-8">
            <p className="text-sm text-slate-500">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Policies */}
            <div className="card p-5 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-ghana-green/10 p-3">
                  <FileText className="h-5 w-5 text-ghana-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalPolicies}</p>
                  <p className="text-xs text-slate-600">Active Policies</p>
                </div>
              </div>
            </div>

            {/* Forum Posts */}
            <div className="card p-5 animate-scale-in animate-delay-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-ghana-gold/10 p-3">
                  <MessageSquare className="h-5 w-5 text-ghana-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalForumPosts}</p>
                  <p className="text-xs text-slate-600">Forum Discussions</p>
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="card p-5 animate-scale-in animate-delay-200">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-ghana-red/10 p-3">
                  <Users className="h-5 w-5 text-ghana-red" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                  <p className="text-xs text-slate-600">Registered Users</p>
                </div>
              </div>
            </div>

            {/* Total Votes */}
            <div className="card p-5 animate-scale-in animate-delay-300">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <ThumbsUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalVotes}</p>
                  <p className="text-xs text-slate-600">Policy Votes Cast</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User District Info */}
        {user?.district && (
          <div className="card p-5 animate-slide-up">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Your District</h2>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ghana-green/10 p-3">
                <TrendingUp className="h-5 w-5 text-ghana-green" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user.district}</p>
                <p className="text-sm text-slate-600">
                  {isAdmin 
                    ? 'Your constituency' 
                    : 'Participate in your district forum'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin-specific section */}
        {isAdmin && (
          <div className="card p-5 animate-slide-up">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <a 
                href="/admin" 
                className="block p-3 rounded-lg border border-slate-200 hover:border-ghana-green hover:bg-ghana-green/5 transition-colors"
              >
                <p className="font-medium text-slate-900">Admin Panel</p>
                <p className="text-sm text-slate-600">Manage policies, news, and users</p>
              </a>
              <a 
                href="/policies" 
                className="block p-3 rounded-lg border border-slate-200 hover:border-ghana-green hover:bg-ghana-green/5 transition-colors"
              >
                <p className="font-medium text-slate-900">Review Policies</p>
                <p className="text-sm text-slate-600">View and respond to policies</p>
              </a>
              <a 
                href="/forums" 
                className="block p-3 rounded-lg border border-slate-200 hover:border-ghana-green hover:bg-ghana-green/5 transition-colors"
              >
                <p className="font-medium text-slate-900">Community Forums</p>
                <p className="text-sm text-slate-600">Engage with citizen discussions</p>
              </a>
            </div>
          </div>
        )}

        {/* Coming Soon */}
        <div className="card p-5 bg-slate-50 animate-slide-up">
          <h3 className="font-semibold text-slate-700 mb-2">📊 More Insights Coming Soon</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• District engagement rankings</li>
            <li>• Policy support trends over time</li>
            <li>• Most active discussion topics</li>
            <li>• Voter turnout statistics</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
