interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
}

const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'Parliament debates new local governance bill', source: 'GBC News', publishedAt: '2h ago' },
  { id: '2', title: 'District assemblies to receive expanded budgets', source: 'Ghana News Agency', publishedAt: '5h ago' },
  { id: '3', title: 'Citizens push for transparency in road contracts', source: 'JoyNews', publishedAt: '1d ago' },
  { id: '4', title: 'Ministry outlines digital ID rollout timeline', source: 'Citi Newsroom', publishedAt: '2d ago' },
];

export default function NewsSection() {
  return (
    <section id="ghana-news" className="scroll-mt-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-800">Ghana News</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
        {MOCK_NEWS.map((item) => (
          <article
            key={item.id}
            className="min-w-[240px] shrink-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:min-w-0"
          >
            <h3 className="text-sm font-medium text-slate-900">{item.title}</h3>
            <p className="mt-2 text-xs text-slate-500">
              {item.source} · {item.publishedAt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
