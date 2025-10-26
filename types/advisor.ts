/**
 * Core type definitions for AdVisor
 * Strategic intelligence platform for ad creative testing
 */

export interface CreativeUpload {
  file: File | null;
  fileName?: string;
  fileType?: 'image' | 'video';
  previewUrl?: string;
}

export interface BrandContext {
  productName: string;
  productCategory: string;
  pricePosition: 'budget' | 'mid' | 'premium';
  valueProp: string;
  targetAudience: string;
  adGoal: 'awareness' | 'signups' | 'purchase';
}

export interface CreativeAnalysis {
  tone: string;
  cta: string;
  impliedPromise: string;
  pacing?: string;
  visualStyle?: string;
}

export interface Society {
  id: string;
  name: string;
  score: number; // 0.0-1.0 relevance score
  motivation: string;
  friction: string;
  conversionTrigger: string;
  recommended: boolean;
  suggestedHooks: string[];
}

export interface AgentFeedback {
  agentRole: string;
  emotionalReaction: string;
  objection: string;
  clickTrigger: string;
  suggestedChange: string;
  funnelAnalysis?: string;
}

export interface SimulationResult {
  creativeAnalysis: CreativeAnalysis;
  societies: Society[];
  agentTranscripts: {
    [societyId: string]: AgentFeedback[];
  };
}
