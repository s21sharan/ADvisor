import { PlaybookRec } from '@/lib/types';

interface VariantRecommendationCardProps {
  playbook: PlaybookRec;
}

export default function VariantRecommendationCard({ playbook }: VariantRecommendationCardProps) {
  const getSharingColor = (likelihood: string) => {
    if (likelihood === 'high') return 'bg-green-100 text-green-800';
    if (likelihood === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Creative Recommendations
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sharing Likelihood:</span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSharingColor(playbook.sharingLikelihood)}`}>
            {playbook.sharingLikelihood.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-900 mb-1.5">
                OPEN WITH THIS HOOK
              </p>
              <p className="text-sm text-gray-800">
                {playbook.openWithHook}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900 mb-1.5">
                USE THIS CTA
              </p>
              <p className="text-sm text-gray-800">
                {playbook.ctaRecommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-900 mb-1.5">
                CUT THIS PART
              </p>
              <p className="text-sm text-gray-800">
                {playbook.cutThis}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
