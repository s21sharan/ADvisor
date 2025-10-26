/**
 * Core type definitions for AdVisor
 */

export interface BrandMeta {
  productName: string;
  valueProp: string;
  pricePositioning: "budget" | "mid" | "premium";
  selfDeclaredAudience: string;
}

export interface CreativeFeatures {
  tone: string; // "urgent survival mode", "calm luxury", etc.
  pacing: string; // "fast", "slow"
  ctaText: string;
  visualEnergy: number; // 0-1
  demographicSignals: string[]; // ["busy parents packing lunches", "fit 20s female in soft light"]
}

export interface SocietyMatch {
  societyId: string;
  societyName: string;
  score: number; // 0-100
  whyWeChoseThis: string;
  predictedBehavior: string;
  agentVoicesToSim: string[];
}

export interface PlaybookRec {
  societyName: string;
  openWithHook: string;
  ctaRecommendation: string;
  cutThis: string;
  sharingLikelihood: "low" | "medium" | "high";
  topObjection: string;
  fixAdvice: string;
}

export interface AnalysisResult {
  creativeFeatures: CreativeFeatures;
  societies: SocietyMatch[];
}

export interface UploadedCreative {
  file: File | null;
  brandMeta: BrandMeta;
}
