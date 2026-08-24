import { ShieldCheck } from 'lucide-react';

export default function AnonymityBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ghana-green/30 bg-ghana-green/10 px-4 py-3 text-sm text-ghana-green">
      <ShieldCheck className="h-5 w-5 shrink-0" />
      <p>
        Your identity is verified but your activity is anonymous. Votes, comments, and forum posts are never
        linked to your Ghana Card details.
      </p>
    </div>
  );
}
