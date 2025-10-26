"use client";

import { BrandMeta } from '@/lib/types';

interface BrandInfoFormProps {
  brandMeta: BrandMeta;
  onChange: (meta: BrandMeta) => void;
}

export default function BrandInfoForm({ brandMeta, onChange }: BrandInfoFormProps) {
  const handleChange = (
    field: keyof BrandMeta,
    value: string
  ) => {
    onChange({
      ...brandMeta,
      [field]: value
    });
  };

  return (
    <div className="glass-effect rounded-2xl p-8 hover-lift">
      <h2 className="text-2xl font-semibold mb-8 text-gradient">Brand Context</h2>

      <div className="space-y-6">
        <div className="group">
          <label htmlFor="productName" className="block text-sm font-semibold text-foreground mb-3">
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            value={brandMeta.productName}
            onChange={(e) => handleChange('productName', e.target.value)}
            placeholder="e.g., QuickMeal Weeknight Kits"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-foreground placeholder:text-muted-foreground transition-all duration-200 group-hover:border-blue-400/50"
          />
        </div>

        <div className="group">
          <label htmlFor="valueProp" className="block text-sm font-semibold text-foreground mb-3">
            Value Proposition
          </label>
          <textarea
            id="valueProp"
            value={brandMeta.valueProp}
            onChange={(e) => handleChange('valueProp', e.target.value)}
            placeholder="What problem does this solve? What's the core promise? (1-2 sentences)"
            rows={3}
            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-foreground placeholder:text-muted-foreground resize-none transition-all duration-200 group-hover:border-blue-400/50"
          />
        </div>

        <div className="group">
          <label htmlFor="pricePositioning" className="block text-sm font-semibold text-foreground mb-3">
            Price Positioning
          </label>
          <select
            id="pricePositioning"
            value={brandMeta.pricePositioning}
            onChange={(e) => handleChange('pricePositioning', e.target.value as BrandMeta['pricePositioning'])}
            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-foreground transition-all duration-200 group-hover:border-blue-400/50"
          >
            <option value="budget">Budget (value-driven, price-sensitive buyers)</option>
            <option value="mid">Mid-Market (balance of quality and cost)</option>
            <option value="premium">Premium (luxury, status, or exclusivity)</option>
          </select>
        </div>

        <div className="group">
          <label htmlFor="selfDeclaredAudience" className="block text-sm font-semibold text-foreground mb-3">
            Who do you think this ad is for?
          </label>
          <input
            type="text"
            id="selfDeclaredAudience"
            value={brandMeta.selfDeclaredAudience}
            onChange={(e) => handleChange('selfDeclaredAudience', e.target.value)}
            placeholder="e.g., Busy working parents, 30-45, need quick dinner solutions"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-foreground placeholder:text-muted-foreground transition-all duration-200 group-hover:border-blue-400/50"
          />
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            We'll test if your intuition matches how artificial societies actually react.
          </p>
        </div>
      </div>

      <div className="mt-8 glass-effect rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-purple-300 leading-relaxed">
              <span className="font-semibold text-purple-200">Why we need this:</span> Your brand context helps us select which artificial societies to simulate. We're not just matching demographics—we're testing cultural resonance before you spend on reach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
