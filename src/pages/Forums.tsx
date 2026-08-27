import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Lock, Globe, Search, Plus, Heart, Trash2, Send } from 'lucide-react';
import Layout from '../components/Layout';
import ContributeGate from '../components/ContributeGate';
import AIAssistant from '../components/AIAssistant';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

interface ForumPost {
  id: string;
  scope: 'district' | 'national';
  district?: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_has_liked?: boolean;
}

interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  likes_count: number;
  created_at: string;
  user_has_liked?: boolean;
}

export default function Forums() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'district' | 'national'>('national');
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  // Load posts from Supabase
  useEffect(() => {
    loadPosts();
  }, [tab, user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          users!forum_posts_author_id_fkey(name)
        `)
        .eq('scope', tab)
        .order('created_at', { ascending: false });

      // Filter by district for district posts
      // - Citizens: see only their district
      // - Assembly Members: see their district
      // - Ministers: don't see district tab (but query is for national anyway)
      if (tab === 'district' && user?.district) {
        query = query.eq('district', user.district);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check which posts the user has liked
      let postsWithLikes: ForumPost[] = data.map(post => ({
        id: post.id,
        scope: post.scope,
        district: post.district,
        title: post.title,
        content: post.content || '',
        author_id: post.author_id,
        author_name: post.users?.name || 'Anonymous',
        likes_count: post.likes_count || 0,
        comments_count: 0, // Will be populated separately
        created_at: post.created_at,
        user_has_liked: false,
      }));

      // Get likes for current user
      if (user) {
        const { data: likes } = await supabase
          .from('forum_post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        postsWithLikes = postsWithLikes.map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id),
        }));
      }

      // Get comments count for each post
      for (const post of postsWithLikes) {
        const { count } = await supabase
          .from('forum_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        post.comments_count = count || 0;
      }

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load comments for a specific post
  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          *,
          users!forum_comments_user_id_fkey(name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      let commentsWithLikes: ForumComment[] = data.map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        user_name: comment.users?.name || 'Anonymous',
        content: comment.content,
        likes_count: comment.likes_count || 0,
        created_at: comment.created_at,
        user_has_liked: false,
      }));

      // Get likes for current user
      if (user) {
        const { data: likes } = await supabase
          .from('forum_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsWithLikes.map(c => c.id));

        const likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);
        commentsWithLikes = commentsWithLikes.map(comment => ({
          ...comment,
          user_has_liked: likedCommentIds.has(comment.id),
        }));
      }

      setComments(prev => ({ ...prev, [postId]: commentsWithLikes }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const districtLocked = tab === 'district' && !user;

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? posts.filter((post) => post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)) : posts;
  }, [posts, query]);

  // Create new post
  const handleNewPost = async (event: FormEvent) => {
    event.preventDefault();
    if (!draftTitle.trim() || !user) return;

    // Forum access rules:
    // - Citizens: Can post in their district forum + National forum (if verified & 18+)
    // - Assembly Members: Can post in their assigned district forum + National forum
    // - Ministers: Can only post in National forum

    if (user.role === 'citizen') {
      // Citizens need verification to post
      if (!user.verified) {
        alert('You must verify your Ghana Card to post.');
        return;
      }
      // Citizens can post in both district and national forums
      // No restrictions needed beyond verification
    } else if (user.role === 'minister') {
      // Ministers can only post in national forum
      if (tab === 'district') {
        alert('Ministers can only post in the National forum. Please switch to National tab.');
        return;
      }
    } else if (user.role === 'assembly') {
      // Assembly members can post in both their district and national
      // No restrictions needed, they have full access
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert([
          {
            scope: tab,
            district: tab === 'district' ? user.district : null,
            title: draftTitle.trim(),
            content: draftContent.trim() || '',
            author_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDraftTitle('');
      setDraftContent('');
      loadPosts(); // Reload to show new post
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // Toggle like on a post
  const handleLikePost = async (postId: string) => {
    if (!user || !user.verified) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('forum_post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (error) throw error;
      }

      // Update local state
      setPosts(posts.map(p =>
        p.id === postId
          ? {
              ...p,
              likes_count: p.user_has_liked ? p.likes_count - 1 : p.likes_count + 1,
              user_has_liked: !p.user_has_liked,
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Delete a post
  const handleDeletePost = async (postId: string, authorId: string) => {
    if (!user || user.id !== authorId) return;

    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Add a comment
  const handleAddComment = async (postId: string) => {
    const content = commentDraft[postId]?.trim();
    if (!content || !user || !user.verified) return;

    try {
      const { error } = await supabase
        .from('forum_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCommentDraft(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId); // Reload comments
      
      // Update comments count
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Toggle like on a comment
  const handleLikeComment = async (commentId: string, postId: string) => {
    if (!user || !user.verified) return;

    const postComments = comments[postId] || [];
    const comment = postComments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('forum_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('forum_comment_likes')
          .insert([{ comment_id: commentId, user_id: user.id }]);

        if (error) throw error;
      }

      // Update local state
      setComments(prev => ({
        ...prev,
        [postId]: postComments.map(c =>
          c.id === commentId
            ? {
                ...c,
                likes_count: c.user_has_liked ? c.likes_count - 1 : c.likes_count + 1,
                user_has_liked: !c.user_has_liked,
              }
            : c
        ),
      }));
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string, postId: string, userId: string) => {
    if (!user || user.id !== userId) return;

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      const postComments = comments[postId] || [];
      setComments(prev => ({
        ...prev,
        [postId]: postComments.filter(c => c.id !== commentId),
      }));

      // Update comments count
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p
      ));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Toggle expand post to show comments
  const toggleExpandPost = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="animate-slide-in-left">
          <h1 className="text-2xl font-bold text-slate-900">Forums</h1>
          <p className="text-sm text-slate-500">
            {tab === 'district'
              ? `Discussions locked to ${user?.district ?? 'your district'}.`
              : 'Open discussions visible nationwide.'}
          </p>
          {user && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              {user.role === 'citizen' && (
                <p>✓ You can post in your district forum and the national forum</p>
              )}
              {user.role === 'assembly' && (
                <p>✓ You can post in your district forum and the national forum</p>
              )}
              {user.role === 'minister' && (
                <p>✓ You can post in the national forum only</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 animate-slide-in-right">
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

        {districtLocked ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <Lock className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              District discussions are locked to residents. Sign in to see and join your district's board.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Link to="/signup" className="rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white">
                Create account
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ContributeGate action="start a discussion">
              <form onSubmit={handleNewPost} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder={tab === 'district' ? `Discussion title in ${user?.district ?? 'your district'}…` : 'National discussion title…'}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium focus:border-ghana-green focus:outline-none"
                />
                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  placeholder="Add more details (optional)..."
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    {tab === 'district' 
                      ? ` Only members of ${user?.district} can see and respond` 
                      : ' Visible to everyone nationwide'
                    }
                  </p>
                  <button
                    type="submit"
                    disabled={!draftTitle.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-ghana-green/90"
                  >
                    <Plus className="h-4 w-4" />
                    Post
                  </button>
                </div>
              </form>
            </ContributeGate>

            {loading ? (
              <div className="text-center p-8">
                <p className="text-sm text-slate-500">Loading discussions...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visiblePosts.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-slate-400">No discussions here yet. Start one above!</p>
                  </div>
                )}
                {visiblePosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="rounded-lg border border-slate-200 bg-white shadow-sm animate-fade-in overflow-hidden"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Post Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 mb-1">{post.title}</h3>
                          {post.content && (
                            <p className="text-sm text-slate-600 mb-2">{post.content}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {user && user.id === post.author_id && (
                          <button
                            onClick={() => handleDeletePost(post.id, post.author_id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => user?.verified && handleLikePost(post.id)}
                          disabled={!user?.verified}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            post.user_has_liked
                              ? 'text-red-500'
                              : 'text-slate-500 hover:text-red-500'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                          {post.likes_count}
                        </button>
                        <button
                          onClick={() => toggleExpandPost(post.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-ghana-green transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {post.comments_count}
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {expandedPost === post.id && (
                      <div className="border-t border-slate-200 bg-slate-50">
                        {/* Comment Input */}
                        {user?.verified && (
                          <div className="p-4 border-b border-slate-200 bg-white">
                            <div className="flex gap-2">
                              <input
                                value={commentDraft[post.id] || ''}
                                onChange={(e) => setCommentDraft(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Add a comment..."
                                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentDraft[post.id]?.trim()}
                                className="rounded-md bg-ghana-green px-3 py-2 text-white disabled:opacity-50 hover:bg-ghana-green/90"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="p-4 space-y-3">
                          {!comments[post.id] ? (
                            <p className="text-xs text-slate-500">Loading comments...</p>
                          ) : comments[post.id].length === 0 ? (
                            <p className="text-xs text-slate-400">No comments yet. Be the first!</p>
                          ) : (
                            comments[post.id].map(comment => (
                              <div key={comment.id} className="bg-white rounded-md p-3 border border-slate-200">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm text-slate-900">{comment.content}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {comment.user_name} • {new Date(comment.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {user && user.id === comment.user_id && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id, comment.user_id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                <button
                                  onClick={() => user?.verified && handleLikeComment(comment.id, post.id)}
                                  disabled={!user?.verified}
                                  className={`flex items-center gap-1 text-xs font-medium mt-2 transition-colors ${
                                    comment.user_has_liked
                                      ? 'text-red-500'
                                      : 'text-slate-400 hover:text-red-500'
                                  } disabled:opacity-50`}
                                >
                                  <Heart className={`h-3 w-3 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                                  {comment.likes_count}
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Assistant - Available when viewing a post */}
      {expandedPost && (() => {
        const post = posts.find(p => p.id === expandedPost);
        return post ? (
          <AIAssistant
            context={{
              type: 'post',
              title: post.title,
              content: post.content,
            }}
          />
        ) : null;
      })()}
    </Layout>
  );
}
