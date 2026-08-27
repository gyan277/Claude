import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  published_date: string;
  image_url: string;
  created_at: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ghana_news')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(4);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <section id="ghana-news" className="scroll-mt-4">
      <h2 className="mb-4 text-lg md:text-xl font-bold text-slate-800">Ghana News</h2>
      
      {loading ? (
        <div className="text-center p-8">
          <p className="text-sm text-slate-500">Loading news...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-sm text-slate-500">No news articles yet.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {news.map((item, index) => (
            <article
              key={item.id}
              className="group min-w-[280px] shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-lg hover:border-ghana-green/40 md:min-w-0 animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-40 md:h-36 overflow-hidden bg-slate-100">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-ghana-green/10">
                    <span className="text-4xl">🇬🇭</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="badge-green text-[10px] md:text-xs shadow-sm">
                    {item.source || 'Government'}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-ghana-green transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">{item.source}</span>
                  <span>{getTimeAgo(item.published_date)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
