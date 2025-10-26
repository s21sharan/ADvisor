import { Society } from '@/types/advisor';

interface VariantSuggestionsPanelProps {
  societies: Society[];
}

export default function VariantSuggestionsPanel({ societies }: VariantSuggestionsPanelProps) {
  // Only show top recommended societies
  const recommendedSocieties = societies.filter(s => s.recommended).slice(0, 2);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-lg p-10">

      <div className="space-y-10">
        {recommendedSocieties.map((society) => (
          <div key={society.id} className="pb-10 border-b-2 border-purple-200 last:border-b-0 last:pb-0">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{society.name}</h4>
              <p className="text-sm text-gray-700">Optimized messaging for this society:</p>
            </div>

            <ul className="space-y-4">
              {society.suggestedHooks.map((hook, idx) => (
                <li key={idx} className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-md border border-purple-100">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mt-0.5 shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="flex-1 text-base text-gray-900 leading-relaxed font-medium">
                    "{hook}"
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
