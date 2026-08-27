import { AlertCircle } from 'lucide-react';

export default function UnderageNotice() {
  return (
    <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 mb-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-orange-900 mb-1">
            Age Restriction
          </h3>
          <p className="text-xs text-orange-800">
            You must be <strong>18 years or older</strong> to vote on policies and post in forums. 
            You can browse content, but voting and posting are restricted until you meet the age requirement.
          </p>
        </div>
      </div>
    </div>
  );
}
