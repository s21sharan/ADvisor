"use client";

import { BrandContext } from '@/types/advisor';

interface BrandInfoFormProps {
  context: BrandContext;
  onChange: (context: BrandContext) => void;
}

export default function BrandInfoForm({ context, onChange }: BrandInfoFormProps) {
  const handleFieldChange = (field: keyof BrandContext, value: string) => {
    onChange({ ...context, [field]: value });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Brand Context</h3>
        <p className="text-sm text-gray-600">
          Tell us about your product so we can simulate the right buyer societies
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2">
        <div>
          <label htmlFor="productName" className="block text-xs font-medium text-gray-700 mb-1.5">
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            value={context.productName}
            onChange={(e) => handleFieldChange('productName', e.target.value)}
            placeholder="e.g., QuickMeal Weeknight Kits"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="productCategory" className="block text-xs font-medium text-gray-700 mb-1.5">
            Product Category
          </label>
          <input
            type="text"
            id="productCategory"
            value={context.productCategory}
            onChange={(e) => handleFieldChange('productCategory', e.target.value)}
            placeholder="e.g., Meal kits, SaaS, Fitness wearable"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="pricePosition" className="block text-xs font-medium text-gray-700 mb-1.5">
            Price Positioning
          </label>
          <select
            id="pricePosition"
            value={context.pricePosition}
            onChange={(e) => handleFieldChange('pricePosition', e.target.value as BrandContext['pricePosition'])}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            <option value="budget">Budget (value-driven, price-sensitive)</option>
            <option value="mid">Mid-market (quality-cost balance)</option>
            <option value="premium">Premium (luxury, exclusivity, status)</option>
          </select>
        </div>

        <div>
          <label htmlFor="valueProp" className="block text-xs font-medium text-gray-700 mb-1.5">
            Value Proposition
          </label>
          <textarea
            id="valueProp"
            value={context.valueProp}
            onChange={(e) => handleFieldChange('valueProp', e.target.value)}
            placeholder="What problem does this solve? Why should someone care?"
            rows={3}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-xs font-medium text-gray-700 mb-1.5">
            Who do you think this ad is for?
          </label>
          <input
            type="text"
            id="targetAudience"
            value={context.targetAudience}
            onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
            placeholder="e.g., Busy working parents, 30-45, need quick dinner solutions"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="adGoal" className="block text-xs font-medium text-gray-700 mb-1.5">
            Primary Goal of This Ad
          </label>
          <select
            id="adGoal"
            value={context.adGoal}
            onChange={(e) => handleFieldChange('adGoal', e.target.value as BrandContext['adGoal'])}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            <option value="awareness">Brand Awareness</option>
            <option value="signups">Drive Signups / Leads</option>
            <option value="purchase">Direct Purchase / Conversion</option>
          </select>
        </div>
      </div>
    </div>
  );
}
