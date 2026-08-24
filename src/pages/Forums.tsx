import { useMemo, useState } from 'react';
import { MessageSquare, Lock, Globe } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface ForumPost {
  id: string;
  scope: 'district' | 'national';
  district?: string;
  title: string;
  author: string;
  replies: number;
}

const POSTS: ForumPost[] = [
  { id: '1', scope: 'national', title: 'Should the digital ID rollout be accelerated?', author: 'Citizen_2291', replies: 47 },
  { id: '2', scope: 'national', title: 'Views on the road contracts transparency act', author: 'Citizen_0148', replies: 22 },
  { id: '3', scope: 'district', district: 'Accra Metropolitan', title: 'Drainage works on Spintex Road', author: 'Citizen_7732', replies: 15 },
  { id: '4', scope: 'district', district: 'Kumasi Metropolitan', title: 'Market renovation timeline concerns', author: 'Citizen_5510', replies: 9 },
  { id: '5', scope: 'district', district: 'Accra Metropolitan', title: 'Assembly budget Q3 breakdown', author: 'Citizen_3390', replies: 6 },
];

export default function Forums() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'district' | 'national'>('national');

  const visiblePosts = useMemo(() => {
    if (tab === 'national') return POSTS.filter((post) => post.scope === 'national');
    return POSTS.filter((post) => post.scope === 'district' && post.district === user?.district);
  }, [tab, user?.district]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forums</h1>
          <p className="text-sm text-slate-500">
            {tab === 'district'
              ? `Discussions locked to ${user?.district ?? 'your district'}.`
              : 'Open discussions visible nationwide.'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('national')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              tab === 'national' ? 'bg-ghana-green text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" />
            National
          </button>
          <button
            onClick={() => setTab('district')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              tab === 'district' ? 'bg-ghana-green text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Lock className="h-4 w-4" />
            My District
          </button>
        </div>

        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
          {visiblePosts.length === 0 && (
            <p className="p-5 text-sm text-slate-400">No discussions here yet. Start one below.</p>
          )}
          {visiblePosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{post.title}</p>
                <p className="text-xs text-slate-500">by {post.author}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" />
                {post.replies}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
