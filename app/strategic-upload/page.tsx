"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/strategic/UploadZone';
import BrandInfoForm from '@/components/strategic/BrandInfoForm';
import PrimaryCTA from '@/components/strategic/PrimaryCTA';
import { BrandContext } from '@/types/advisor';

export default function StrategicUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [brandContext, setBrandContext] = useState<BrandContext>({
    productName: '',
    productCategory: '',
    pricePosition: 'mid',
    valueProp: '',
    targetAudience: '',
    adGoal: 'purchase'
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const isFormValid = () => {
    return selectedFile &&
      brandContext.productName.trim() &&
      brandContext.valueProp.trim() &&
      brandContext.targetAudience.trim();
  };

  const handleRunSimulation = async () => {
    if (!isFormValid()) return;

    setIsSimulating(true);

    // TODO(matthew): populate creative summary from feature extraction pipeline
    // TODO(router): replace hardcoded societies with output from Society Selection module
    // TODO(sharan): fetch society-specific agent transcripts

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Store context for results page
    sessionStorage.setItem('brandContext', JSON.stringify(brandContext));
    sessionStorage.setItem('uploadedFileName', selectedFile?.name || '');

    // Navigate to results
    router.push('/strategic-results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Hero Header - Full Width */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-12 py-16">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Test your creative before you spend.
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We'll analyze your ad, simulate real buyer societies, and tell you what will actually land.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 flex items-center justify-center px-12 py-16">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Left: Upload Zone */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 min-h-[650px] flex flex-col">
              <UploadZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </div>

            {/* Right: Brand Context Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 min-h-[650px] flex flex-col">
              <BrandInfoForm
                context={brandContext}
                onChange={setBrandContext}
              />
            </div>
          </div>

          {/* CTA - Prominent */}
          <div className="max-w-xl mx-auto">
            <PrimaryCTA
              onClick={handleRunSimulation}
              disabled={!isFormValid()}
              loading={isSimulating}
            />
            {!isFormValid() && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Complete all required fields to run simulation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
