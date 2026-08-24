import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { MessageSquare, Lock, Globe, Search, Plus } from 'lucide-react';
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

const SEED_POSTS: ForumPost[] = [
  { id: '1', scope: 'national', title: 'Should the digital ID rollout be accelerated?', author: 'Citizen_2291', replies: 47 },
  { id: '2', scope: 'national', title: 'Views on the road contracts transparency act', author: 'Citizen_0148', replies: 22 },
  { id: '3', scope: 'district', district: 'Accra Metropolitan', title: 'Drainage works on Spintex Road', author: 'Citizen_7732', replies: 15 },
  { id: '4', scope: 'district', district: 'Kumasi Metropolitan', title: 'Market renovation timeline concerns', author: 'Citizen_5510', replies: 9 },
  { id: '5', scope: 'district', district: 'Accra Metropolitan', title: 'Assembly budget Q3 breakdown', author: 'Citizen_3390', replies: 6 },
];

const STORAGE_KEY = 'dodow-amanmuo:forum-posts';

function loadPosts(): ForumPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const extra: ForumPost[] = raw ? JSON.parse(raw) : [];
    return [...extra, ...SEED_POSTS];
  } catch {
    return SEED_POSTS;
  }
}

function persistExtraPosts(posts: ForumPost[]) {
  const extra = posts.filter((post) => !SEED_POSTS.some((seed) => seed.id === post.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(extra));
}

export default function Forums() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'district' | 'national'>('national');
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>(loadPosts);
  const [draftTitle, setDraftTitle] = useState('');

  useEffect(() => {
    persistExtraPosts(posts);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    const scoped =
      tab === 'national'
        ? posts.filter((post) => post.scope === 'national')
        : posts.filter((post) => post.scope === 'district' && post.district === user?.district);

    const q = query.trim().toLowerCase();
    return q ? scoped.filter((post) => post.title.toLowerCase().includes(q)) : scoped;
  }, [posts, tab, user?.district, query]);

  const handleNewPost = (event: FormEvent) => {
    event.preventDefault();
    if (!draftTitle.trim() || !user) return;

    const post: ForumPost = {
      id: crypto.randomUUID(),
      scope: tab,
      district: tab === 'district' ? user.district : undefined,
      title: draftTitle.trim(),
      author: `Citizen_${user.id.slice(0, 4)}`,
      replies: 0,
    };
    setPosts((prev) => [post, ...prev]);
    setDraftTitle('');
  };

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

        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search discussions…"
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-ghana-green focus:outline-none"
            />
          </div>
        </div>

        <form onSubmit={handleNewPost} className="flex gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder={tab === 'district' ? `Start a discussion in ${user?.district ?? 'your district'}…` : 'Start a national discussion…'}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draftTitle.trim()}
            className="flex items-center gap-1.5 rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Post
          </button>
        </form>

        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
          {visiblePosts.length === 0 && (
            <p className="p-5 text-sm text-slate-400">No discussions here yet. Start one above.</p>
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
