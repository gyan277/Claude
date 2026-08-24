import { Quote } from 'lucide-react';

interface QuoteCardProps {
  quote?: string;
  author?: string;
}

const DEFAULT_QUOTE = 'Democracy is not just about voting once every four years — it is about being heard every day.';
const DEFAULT_AUTHOR = 'Kwame Nkrumah';

export default function QuoteCard({ quote = DEFAULT_QUOTE, author = DEFAULT_AUTHOR }: QuoteCardProps) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
      <Quote className="h-6 w-6 text-blue-500" />
      <p className="mt-2 text-base font-medium text-blue-900">&ldquo;{quote}&rdquo;</p>
      <p className="mt-2 text-sm text-blue-600">— {author}</p>
    </div>
  );
}
