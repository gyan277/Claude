import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Languages } from 'lucide-react';
import Layout from '../components/Layout';
import { POLICIES } from './Policies';
import { translatePolicyText, SUPPORTED_LANGUAGES, type LocalLanguage } from '../services/translation';

type Vote = 'support' | 'oppose' | null;

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const policy = POLICIES.find((item) => item.id === id);

  const [language, setLanguage] = useState<LocalLanguage>('english');
  const [translated, setTranslated] = useState<string[] | null>(null);
  const [translating, setTranslating] = useState(false);
  const [vote, setVote] = useState<Vote>(null);

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

  const displayedBullets = translated ?? policy.bullets;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ghana-green">{policy.ministry}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{policy.title}</h1>
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
      </div>
    </Layout>
  );
}
