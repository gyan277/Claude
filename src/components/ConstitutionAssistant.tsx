import { useState, type FormEvent } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { askConstitution } from '../services/constitution';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function ConstitutionAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask me anything about the 1992 Constitution of Ghana — your rights, how government is structured, or how laws are made.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setQuestion('');
    setLoading(true);
    try {
      const answer = await askConstitution(trimmed);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I couldn't reach the constitution assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
      {open && (
        <div className="mb-3 flex h-96 w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-ghana-green px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Constitution Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-ghana-green text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400">Thinking…</div>}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2 border-t border-slate-100 p-3">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your constitution…"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-ghana-green focus:outline-none"
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              aria-label="Send"
              className="flex items-center justify-center rounded-md bg-ghana-green px-3 py-2 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <div className="group relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Ask about your constitution"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ghana-green text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="h-6 w-6" />
        </button>
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
          Ask about your constitution
        </span>
      </div>
    </div>
  );
}
