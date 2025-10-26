"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SocietyHeader from '@/components/strategic/SocietyHeader';
import AgentFeedbackThread from '@/components/strategic/AgentFeedbackThread';
import { mockSimulationResult } from '@/data/mockSimulation';
import { Society, AgentFeedback } from '@/types/advisor';

export default function StrategicDetailPage() {
  const router = useRouter();
  const [society, setSociety] = useState<Society | null>(null);
  const [feedbacks, setFeedbacks] = useState<AgentFeedback[]>([]);

  useEffect(() => {
    const selectedSocietyId = sessionStorage.getItem('selectedSocietyId');

    if (!selectedSocietyId) {
      router.push('/strategic-results');
      return;
    }

    // TODO(sharan): fetch society-specific agent transcripts from real API

    // Load mock data
    const foundSociety = mockSimulationResult.societies.find(
      s => s.id === selectedSocietyId
    );

    if (!foundSociety) {
      router.push('/strategic-results');
      return;
    }

    setSociety(foundSociety);
    setFeedbacks(mockSimulationResult.agentTranscripts[selectedSocietyId] || []);
  }, [router]);

  if (!society) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading agent transcripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <button
            onClick={() => router.push('/strategic-results')}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Results
          </button>

          <SocietyHeader societyName={society.name} score={society.score} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Agent Feedback</h2>
          <p className="text-sm text-gray-600">
            Each agent represents a different voice within this buyer society. Their feedback shows how different personas within this group would react to your creative.
          </p>
        </div>

        <AgentFeedbackThread feedbacks={feedbacks} />

        {/* Summary Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            What This Means
          </h3>
          <div className="space-y-2 text-sm text-blue-900">
            <p>
              <strong>Motivation:</strong> {society.motivation}
            </p>
            <p>
              <strong>Friction Point:</strong> {society.friction}
            </p>
            <p>
              <strong>Conversion Trigger:</strong> {society.conversionTrigger}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
