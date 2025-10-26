"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandMeta } from '@/lib/types';

export default function AudiencePage() {
  const router = useRouter();
  const [selfDeclaredAudience, setSelfDeclaredAudience] = useState('');

  useEffect(() => {
    // Check if previous steps completed
    const brandMetaStr = sessionStorage.getItem('brandMeta');
    if (!brandMetaStr) {
      router.push('/');
    }
  }, [router]);

  const handleContinue = () => {
    if (!selfDeclaredAudience.trim()) {
      alert('Please describe who you think this ad is for');
      return;
    }

    // Update brand meta with audience info
    const brandMetaStr = sessionStorage.getItem('brandMeta');
    if (brandMetaStr) {
      const brandMeta: BrandMeta = JSON.parse(brandMetaStr);
      brandMeta.selfDeclaredAudience = selfDeclaredAudience;
      sessionStorage.setItem('brandMeta', JSON.stringify(brandMeta));
    }

    // Navigate to simulation
    router.push('/simulation');
  };

  const handleBack = () => {
    router.push('/brand-info');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600">Step 3 of 4</span>
          <span className="text-xs text-gray-500">Target Audience</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '75%' }}></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Who Do You Think This Ad Is For?
        </h2>
        <p className="text-sm text-gray-600">
          We'll test if your intuition matches how artificial societies actually react
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="space-y-4">
          <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
            Describe your target audience
          </label>
          <textarea
            id="audience"
            value={selfDeclaredAudience}
            onChange={(e) => setSelfDeclaredAudience(e.target.value)}
            placeholder="e.g., Busy working parents, 30-45, who need quick dinner solutions and value time over cost"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          />
          <p className="text-xs text-gray-500">
            Include demographics, behaviors, pain points, or anything that describes who should see this ad
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-900">
            <span className="font-medium">What happens next:</span> We'll extract signals from your creative, map it to artificial societies (networked buyer micro-communities), and simulate how each society will react before you spend on reach.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selfDeclaredAudience.trim()}
          className={`
            px-8 py-3 font-semibold rounded-lg transition-all flex items-center gap-2
            ${selfDeclaredAudience.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Start Simulation
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
