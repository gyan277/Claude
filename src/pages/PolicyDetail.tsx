import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Languages, CheckCircle2, Landmark } from 'lucide-react';
import Layout from '../components/Layout';
import { POLICIES, STATUS_STEPS } from '../data/policies';
import { translatePolicyText, SUPPORTED_LANGUAGES, type LocalLanguage } from '../services/translation';
import { getOfficialResponse, setOfficialResponse, type OfficialResponse } from '../services/officialResponses';
import { useAuth } from '../context/AuthContext';

type Vote = 'support' | 'oppose' | null;

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const policy = POLICIES.find((item) => item.id === id);

  const [language, setLanguage] = useState<LocalLanguage>('english');
  const [translated, setTranslated] = useState<string[] | null>(null);
  const [translating, setTranslating] = useState(false);
  const [vote, setVote] = useState<Vote>(null);
  const [response, setResponse] = useState<OfficialResponse | null>(null);
  const [draft, setDraft] = useState('');

  const canRespond = user?.role === 'assembly' || user?.role === 'minister';

  useEffect(() => {
    if (id) setResponse(getOfficialResponse(id));
  }, [id]);

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
      const results = await Promise.all(policy.bullets.map((bullet) => translatePolicyText(bullet, nextLanguage)));
      setTranslated(results);
    } finally {
      setTranslating(false);
    }
  };

  const handleRespond = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !user) return;
    const next: OfficialResponse = {
      text: draft.trim(),
      respondedBy: `${user.name} · ${policy.ministry}`,
      respondedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setOfficialResponse(policy.id, next);
    setResponse(next);
    setDraft('');
  };

  const displayedBullets = translated ?? policy.bullets;
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
                    className={`mt-1 whitespace-nowrap text-[11px] ${
                      index <= currentStepIndex ? 'font-medium text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${index < currentStepIndex ? 'bg-ghana-green' : 'bg-slate-100'}`}
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
          <ul className="space-y-2 text-sm text-slate-700">
            {displayedBullets.map((bullet, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-ghana-gold">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Public support</span>
            <span className="text-slate-500">{policy.supportPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-ghana-green" style={{ width: `${policy.supportPct}%` }} />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setVote('support')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                vote === 'support'
                  ? 'border-ghana-green bg-ghana-green/10 text-ghana-green'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              Support
            </button>
            <button
              onClick={() => setVote('oppose')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                vote === 'oppose'
                  ? 'border-ghana-red bg-ghana-red/10 text-ghana-red'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              Oppose
            </button>
          </div>
          {vote && <p className="mt-3 text-xs text-slate-400">Your vote is recorded anonymously.</p>}
        </div>

        <div className="rounded-lg border border-ghana-green/30 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-ghana-green" />
            <span className="text-sm font-medium text-slate-700">Official response</span>
          </div>

          {response ? (
            <div className="rounded-md bg-ghana-green/5 p-4">
              <p className="text-sm text-slate-700">{response.text}</p>
              <p className="mt-2 text-xs text-slate-400">
                {response.respondedBy} · {response.respondedAt}
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
                disabled={!draft.trim()}
              >
                Publish response
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
