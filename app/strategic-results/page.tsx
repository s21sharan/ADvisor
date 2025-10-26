"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreativeSummaryCard from '@/components/strategic/CreativeSummaryCard';
import SocietyList from '@/components/strategic/SocietyList';
import VariantSuggestionsPanel from '@/components/strategic/VariantSuggestionsPanel';
import ActionBar from '@/components/strategic/ActionBar';
import { mockSimulationResult } from '@/data/mockSimulation';
import { SimulationResult } from '@/types/advisor';

export default function StrategicResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    // TODO(matthew): populate creative summary from feature extraction pipeline
    // TODO(router): replace hardcoded societies with output from Society Selection module
    // TODO(sharan): fetch society-specific agent transcripts

    // Load mock data
    setResult(mockSimulationResult);
    const storedFileName = sessionStorage.getItem('uploadedFileName');
    setFileName(storedFileName || 'ad-creative.mp4');
  }, []);

  const handleViewDetails = (societyId: string) => {
    sessionStorage.setItem('selectedSocietyId', societyId);
    router.push('/strategic-detail');
  };

  const handleDownloadReport = () => {
    alert('Report download functionality coming soon');
  };

  const handleGenerateVariant = () => {
    alert('Variant generation functionality coming soon');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading simulation results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-12 py-12">
          <div className="flex items-start justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-green-700/30 px-4 py-2 rounded-full mb-4">
                <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-green-100">Simulation Complete</span>
              </div>
              <h1 className="text-4xl font-bold mb-3 leading-tight">
                Strategic Intelligence Report
              </h1>
              <p className="text-lg text-green-100 leading-relaxed">
                We analyzed your creative and ran simulations across buyer societies. Here's who this ad resonates with, how they respond emotionally, and how to improve conversion.
              </p>
            </div>
            <button
              onClick={() => router.push('/strategic-upload')}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-semibold text-white hover:bg-white/20 transition-all"
            >
              ← New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-12 py-16">
        <div className="space-y-16">
          {/* Section 1: Creative Summary */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Creative Analysis</h2>
              <p className="text-base text-gray-600">
                Detected signals from your ad creative
              </p>
            </div>
            <CreativeSummaryCard
              analysis={result.creativeAnalysis}
              fileName={fileName}
            />
          </section>

          {/* Section 2: Society Breakdown */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Society Breakdown</h2>
              <p className="text-base text-gray-600 max-w-3xl">
                We mapped your ad to {result.societies.length} buyer societies. Each society has unique motivations, friction points, and conversion triggers. Focus your spend on the top matches.
              </p>
            </div>
            <SocietyList
              societies={result.societies}
              onViewDetails={handleViewDetails}
            />
          </section>

          {/* Section 3: Variant Suggestions */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Suggested Variant Hooks</h2>
              <p className="text-base text-gray-600">
                Optimized messaging to improve conversion
              </p>
            </div>
            <VariantSuggestionsPanel societies={result.societies} />
          </section>

          {/* Section 4: Action Bar */}
          <section>
            <ActionBar
              onDownloadReport={handleDownloadReport}
              onGenerateVariant={handleGenerateVariant}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
