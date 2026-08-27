import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Languages, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import ContributeGate from '../components/ContributeGate';
import AIAssistant from '../components/AIAssistant';
import { supabase } from '../services/supabaseClient';
import { translatePolicyText, SUPPORTED_LANGUAGES, type LocalLanguage } from '../services/translation';
import { useAuth } from '../context/AuthContext';

type Vote = 'support' | 'oppose' | null;

interface Policy {
  id: string;
  title: string;
  description: string;
  ministry?: string;
  category: string;
  status: string;
  created_at: string;
}

interface OfficialResponse {
  id: string;
  policy_id: string;
  official_id: string;
  official_name: string;
  official_role: string;
  response_text: string;
  created_at: string;
}

interface VoteCount {
  support: number;
  oppose: number;
}

const STATUS_STEPS = [
  { key: 'draft', label: 'Draft' },
  { key: 'proposed', label: 'Proposed' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'approved', label: 'Approved' },
  { key: 'active', label: 'Active' },
];

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LocalLanguage>('english');
  const [translated, setTranslated] = useState<string[] | null>(null);
  const [translating, setTranslating] = useState(false);
  const [vote, setVote] = useState<Vote>(null);
  const [response, setResponse] = useState<OfficialResponse | null>(null);
  const [draft, setDraft] = useState('');
  const [voteCount, setVoteCount] = useState<VoteCount>({ support: 0, oppose: 0 });
  const [submittingVote, setSubmittingVote] = useState(false);
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const canRespond = (user?.role === 'assembly' || user?.role === 'minister') && user?.verified;
  
  const totalVotes = voteCount.support + voteCount.oppose;
  const supportPct = totalVotes > 0 ? Math.round((voteCount.support / totalVotes) * 100) : 0;

  useEffect(() => {
    if (id) {
      loadPolicy();
      loadOfficialResponse();
      loadUserVote();
      loadVoteCount();
    }
  }, [id]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPolicy(data);
    } catch (error) {
      console.error('Error loading policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOfficialResponse = async () => {
    try {
      const { data, error } = await supabase
        .from('official_responses')
        .select(`
          *,
          users!official_responses_official_id_fkey(name, role)
        `)
        .eq('policy_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setResponse({
          ...data,
          official_name: data.users?.name || 'Official',
          official_role: data.users?.role || 'government',
        });
      }
    } catch (error) {
      console.error('Error loading official response:', error);
    }
  };

  const loadUserVote = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('policy_votes')
        .select('vote')
        .eq('policy_id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setVote(data.vote);
      }
    } catch (error) {
      console.error('Error loading user vote:', error);
    }
  };

  const loadVoteCount = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_votes')
        .select('vote')
        .eq('policy_id', id);

      if (error) throw error;
      
      const counts = { support: 0, oppose: 0 };
      if (data) {
        data.forEach((v) => {
          if (v.vote === 'support') counts.support++;
          else if (v.vote === 'oppose') counts.oppose++;
        });
      }
      setVoteCount(counts);
    } catch (error) {
      console.error('Error loading vote count:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p className="text-sm text-slate-500">Loading policy...</p>
        </div>
      </Layout>
    );
  }

  if (!policy) {
    return (
      <Layout>
        <p className="text-sm text-slate-500">
          Policy not found.{' '}
          <Link to="/policies" className="text-ghana-green underline">
            Back to policies
          </Link>
        </p>
      </Layout>
    );
  }

  const handleLanguageChange = async (nextLanguage: LocalLanguage) => {
    setLanguage(nextLanguage);
    if (nextLanguage === 'english') {
      setTranslated(null);
      return;
    }
    setTranslating(true);
    try {
      // Translate the description
      const result = await translatePolicyText(policy.description, nextLanguage);
      setTranslated([result]); // Keep as array for consistency
    } finally {
      setTranslating(false);
    }
  };

  const handleVote = async (voteType: 'support' | 'oppose') => {
    if (!user || submittingVote) return;
    
    setSubmittingVote(true);
    try {
      // Upsert vote (insert or update)
      const { error } = await supabase
        .from('policy_votes')
        .upsert({
          policy_id: id,
          user_id: user.id,
          vote: voteType,
        }, {
          onConflict: 'policy_id,user_id'
        });

      if (error) throw error;
      
      setVote(voteType);
      await loadVoteCount(); // Reload vote counts
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleRespond = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !user || submittingResponse) return;
    
    setSubmittingResponse(true);
    try {
      const { error } = await supabase
        .from('official_responses')
        .insert({
          policy_id: id,
          official_id: user.id,
          official_name: user.name,
          official_role: user.role,
          response_text: draft.trim(),
        });

      if (error) throw error;
      
      await loadOfficialResponse();
      setDraft('');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const displayedContent = translated && translated.length > 0 ? translated[0] : policy.description;
  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === policy.status);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ghana-green">{policy.ministry}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{policy.title}</h1>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-medium text-slate-700">Progress toward implementation</p>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, index) => (
              <div key={step.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                      index <= currentStepIndex ? 'bg-ghana-green text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`mt-1 w-14 text-center text-[10px] leading-tight sm:w-auto sm:whitespace-nowrap sm:text-[11px] ${
                      index <= currentStepIndex ? 'font-medium text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 sm:mx-2 ${index < currentStepIndex ? 'bg-ghana-green' : 'bg-slate-100'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-slate-400" />
          <select
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value as LocalLanguage)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-ghana-green focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          {translating && <span className="text-xs text-slate-400">Translating…</span>}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {displayedContent}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Public support</span>
            <span className="text-slate-500">
              {supportPct}% ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-ghana-green transition-all" style={{ width: `${supportPct}%` }} />
          </div>

          <div className="mt-5">
            <ContributeGate action="vote on this policy">
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote('support')}
                  disabled={submittingVote}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                    vote === 'support'
                      ? 'border-ghana-green bg-ghana-green/10 text-ghana-green'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Support {voteCount.support > 0 && `(${voteCount.support})`}
                </button>
                <button
                  onClick={() => handleVote('oppose')}
                  disabled={submittingVote}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                    vote === 'oppose'
                      ? 'border-ghana-red bg-ghana-red/10 text-ghana-red'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Oppose {voteCount.oppose > 0 && `(${voteCount.oppose})`}
                </button>
              </div>
              {vote && <p className="mt-3 text-xs text-slate-400">Your vote is recorded anonymously.</p>}
            </ContributeGate>
          </div>
        </div>

        <div className="rounded-lg border border-ghana-green/30 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <img 
              src="/src/assets/logo.png" 
              alt="Ghana Logo" 
              className="h-4 w-4 object-contain"
            />
            <span className="text-sm font-medium text-slate-700">Official response</span>
          </div>

          {response ? (
            <div className="rounded-md bg-ghana-green/5 p-4">
              <p className="text-sm text-slate-700">{response.response_text}</p>
              <p className="mt-2 text-xs text-slate-400">
                {response.official_name} · {response.official_role} · {new Date(response.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No official response yet.</p>
          )}

          {canRespond && (
            <form onSubmit={handleRespond} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-medium text-slate-500">
                {response ? 'Update the official response' : 'Post an official response'}
              </label>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                placeholder="Address citizen feedback on this policy…"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-ghana-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                disabled={!draft.trim() || submittingResponse}
              >
                {submittingResponse ? 'Publishing...' : 'Publish response'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        context={{
          type: 'policy',
          title: policy.title,
          content: policy.description,
        }}
      />
    </Layout>
  );
}
