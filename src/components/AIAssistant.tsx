import { useState } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { summarizePolicy, suggestComment } from '../services/aiAssistant';

interface AIAssistantProps {
  context?: {
    type: 'policy' | 'post';
    title: string;
    content: string;
  };
}

export default function AIAssistant({ context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeFeature, setActiveFeature] = useState<'summarize' | 'suggest' | null>(null);

  const handleSummarize = async () => {
    if (!context || context.type !== 'policy') return;

    setLoading(true);
    setActiveFeature('summarize');
    try {
      const summary = await summarizePolicy(context.content);
      setResult(summary);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestComment = async () => {
    if (!context || context.type !== 'post') return;

    setLoading(true);
    setActiveFeature('suggest');
    try {
      const suggestions = await suggestComment(context.title, context.content);
      setResult(suggestions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="h-5 w-5" />
        AI Assistant
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setResult(null);
            setActiveFeature(null);
          }}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {!result && !loading && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              How can I help you today?
            </p>

            {context?.type === 'policy' && (
              <button
                onClick={handleSummarize}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Summarize Policy</p>
                  <p className="text-xs text-slate-500">Get key points and action items</p>
                </div>
              </button>
            )}

            {context?.type === 'post' && (
              <button
                onClick={handleSuggestComment}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Suggest Comments</p>
                  <p className="text-xs text-slate-500">Get constructive comment ideas</p>
                </div>
              </button>
            )}

            {!context && (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  AI features are available on policy and forum post pages
                </p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-3" />
            <p className="text-sm text-slate-600">AI is thinking...</p>
          </div>
        )}

        {result && activeFeature === 'summarize' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Summary</h4>
              <p className="text-sm text-slate-700">{result.summary}</p>
            </div>

            {result.keyPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Points</h4>
                <ul className="space-y-2">
                  {result.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.actionItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Action Items</h4>
                <ul className="space-y-2">
                  {result.actionItems.map((item: string, index: number) => (
                    <li key={index} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setActiveFeature(null);
              }}
              className="w-full btn-secondary text-sm"
            >
              Try Another Feature
            </button>
          </div>
        )}

        {result && activeFeature === 'suggest' && Array.isArray(result) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Suggested Comments</h4>
            {result.map((suggestion: string, index: number) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-blue-50 border border-blue-200"
              >
                <p className="text-sm text-slate-700">{suggestion}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(suggestion);
                    alert('Copied to clipboard!');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  Copy to clipboard
                </button>
              </div>
            ))}

            <button
              onClick={() => {
                setResult(null);
                setActiveFeature(null);
              }}
              className="w-full btn-secondary text-sm mt-4"
            >
              Try Another Feature
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
        <p className="text-xs text-slate-500 text-center">
          Powered by Groq AI • llama-3.3-70b
        </p>
      </div>
    </div>
  );
}
