"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandMeta } from '@/lib/types';

export default function BrandInfoPage() {
  const router = useRouter();
  const [brandMeta, setBrandMeta] = useState<BrandMeta>({
    productName: '',
    valueProp: '',
    pricePositioning: 'mid',
    selfDeclaredAudience: ''
  });

  useEffect(() => {
    // Check if file was uploaded
    const fileName = sessionStorage.getItem('uploadedFileName');
    if (!fileName) {
      router.push('/');
    }
  }, [router]);

  const handleChange = (field: keyof BrandMeta, value: string) => {
    setBrandMeta({ ...brandMeta, [field]: value });
  };

  const handleContinue = () => {
    if (!brandMeta.productName || !brandMeta.valueProp) {
      alert('Please fill in product name and value proposition');
      return;
    }

    // Store brand meta for next step
    sessionStorage.setItem('brandMeta', JSON.stringify(brandMeta));
    router.push('/audience');
  };

  const handleBack = () => {
    router.push('/');
  };

  const isValid = brandMeta.productName && brandMeta.valueProp;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600">Step 2 of 4</span>
          <span className="text-xs text-gray-500">Brand Context</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '50%' }}></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell Us About Your Product
        </h2>
        <p className="text-sm text-gray-600">
          This helps us understand what you're selling and who might care
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={brandMeta.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="e.g., QuickMeal Weeknight Kits"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label htmlFor="valueProp" className="block text-sm font-medium text-gray-700 mb-2">
              What problem does this solve? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="valueProp"
              value={brandMeta.valueProp}
              onChange={(e) => handleChange('valueProp', e.target.value)}
              placeholder="Describe the core value proposition in 1-2 sentences..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div>
            <label htmlFor="pricePositioning" className="block text-sm font-medium text-gray-700 mb-2">
              Price Positioning
            </label>
            <select
              id="pricePositioning"
              value={brandMeta.pricePositioning}
              onChange={(e) => handleChange('pricePositioning', e.target.value as BrandMeta['pricePositioning'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="budget">Budget (value-driven, price-sensitive buyers)</option>
              <option value="mid">Mid-Market (balance of quality and cost)</option>
              <option value="premium">Premium (luxury, status, or exclusivity)</option>
            </select>
          </div>
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
          disabled={!isValid}
          className={`
            px-8 py-3 font-semibold rounded-lg transition-all flex items-center gap-2
            ${isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
