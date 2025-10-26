"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PlaybookHeader from '@/components/PlaybookHeader';
import VariantRecommendationCard from '@/components/VariantRecommendationCard';
import ObjectionList from '@/components/ObjectionList';
import DownloadBlock from '@/components/DownloadBlock';
import { PlaybookRec, AnalysisResult } from '@/lib/types';
import { getPlaybook } from '@/lib/mockApi';

export default function PlaybookPage() {
  const router = useRouter();
  const [playbook, setPlaybook] = useState<PlaybookRec[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topSocietyName, setTopSocietyName] = useState<string>('');

  useEffect(() => {
    const loadPlaybook = async () => {
      // Load analysis result to get top society
      const storedResult = sessionStorage.getItem('analysisResult');
      if (!storedResult) {
        router.push('/');
        return;
      }

      const analysisResult: AnalysisResult = JSON.parse(storedResult);
      const topSociety = analysisResult.societies[0]; // Highest scoring society

      if (!topSociety) {
        router.push('/');
        return;
      }

      setTopSocietyName(topSociety.societyName);

      // TODO(sharan): fetch real simulation output for playbook
      const playbookData = await getPlaybook(topSociety.societyId);
      setPlaybook(playbookData);
      setIsLoading(false);
    };

    loadPlaybook();
  }, [router]);

  const handleStartOver = () => {
    sessionStorage.clear();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Generating your playbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PlaybookHeader societyName={topSocietyName} />

      {playbook.map((rec, index) => (
        <div key={index} className="space-y-6">
          <VariantRecommendationCard playbook={rec} />
          <ObjectionList playbook={rec} />
        </div>
      ))}

      <DownloadBlock />

      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Test Another Ad Creative?
          </p>
          <p className="text-xs text-gray-600">
            Upload a new creative and see how different artificial societies react.
          </p>
        </div>
        <button
          onClick={handleStartOver}
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          What Just Happened?
        </h4>
        <p className="text-sm text-gray-700">
          We simulated how <span className="font-semibold">{topSocietyName}</span> would react to your ad in their group chats, forums, and buying conversations. The recommendations above are based on agent-based modeling of this artificial society's shared incentives, pain points, and influence patterns. This is pre-spend culture testing—now you know exactly where to aim your budget and what messaging will actually convert.
        </p>
      </div>
    </div>
  );
}
