import { CreativeAnalysis } from '@/types/advisor';

interface CreativeSummaryCardProps {
  analysis: CreativeAnalysis;
  fileName?: string;
}

export default function CreativeSummaryCard({ analysis, fileName }: CreativeSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
      <div className="flex items-start gap-8">
        {/* Creative Thumbnail Placeholder */}
        <div className="flex-shrink-0 w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-200 flex items-center justify-center shadow-inner">
          <div className="text-center p-4">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-500">{fileName || 'Creative'}</p>
          </div>
        </div>

        {/* Detected Summary */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Detected Creative Signals</h3>
          <dl className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <dt className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Tone</dt>
              <dd className="text-base text-gray-900">{analysis.tone}</dd>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <dt className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1">Primary CTA</dt>
              <dd className="text-base text-gray-900">"{analysis.cta}"</dd>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <dt className="text-xs font-bold text-green-900 uppercase tracking-wide mb-1">Implied Promise</dt>
              <dd className="text-base text-gray-900">{analysis.impliedPromise}</dd>
            </div>
            {analysis.visualStyle && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <dt className="text-xs font-bold text-orange-900 uppercase tracking-wide mb-1">Visual Style</dt>
                <dd className="text-base text-gray-900">{analysis.visualStyle}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
