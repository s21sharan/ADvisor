import { AnalysisResult, PlaybookRec, BrandMeta, CreativeFeatures, SocietyMatch } from './types';

/**
 * Mock API layer - will be replaced with real backend calls
 * TODO(matthew): replace creativeFeatures mock with real extractor output
 * TODO(yashas): wire real society selection + activation here
 * TODO(sharan): fetch real simulation output for playbook
 */

// Mock data for Ad A: Premium health wearable ring
const mockAdA = {
  creativeFeatures: {
    tone: "calm luxury, whisper confidence",
    pacing: "slow",
    ctaText: "Own Your Data",
    visualEnergy: 0.3,
    demographicSignals: [
      "fit 20s-30s in soft natural light",
      "biometric sovereignty messaging",
      "premium minimalist aesthetic"
    ]
  } as CreativeFeatures,
  societies: [
    {
      societyId: "bio-opt-001",
      societyName: "Bio-Optimization Status Flex Health Nerds",
      score: 92,
      whyWeChoseThis: "Your ad whispers 'control your biodata.' Shows premium wearable aesthetic. Zero mention of price signals this is for people who invest in self-tracking for status and insight.",
      predictedBehavior: "Will share in bio-hacker Discord servers and longevity optimization forums. Converts if you emphasize data sovereignty and exclusive access to metrics competitors don't offer.",
      agentVoicesToSim: ["Biohacker Elite", "Data Privacy Advocate", "Performance Optimizer"]
    },
    {
      societyId: "privacy-001",
      societyName: "Data Sovereignty Minimalists",
      score: 87,
      whyWeChoseThis: "Your 'own your data' framing hits hard for people who've deleted social apps and pay for privacy tools. Calm aesthetic signals premium intent over cheap growth hacking.",
      predictedBehavior: "Will research your data encryption before buying. Sharing likelihood is low (they're private), but conversion is high if trust signals land. They'll pay premium for zero third-party data sharing.",
      agentVoicesToSim: ["Privacy Maximalist", "Anti-Surveillance Advocate"]
    }
  ] as SocietyMatch[]
};

// Mock data for Ad B: Meal-prep for overwhelmed parents
const mockAdB = {
  creativeFeatures: {
    tone: "urgent survival mode",
    pacing: "fast",
    ctaText: "50% Off Today Only",
    visualEnergy: 0.85,
    demographicSignals: [
      "busy parents packing school lunches in chaos",
      "weeknight dinner stress signals",
      "time-saving urgency framing"
    ]
  } as CreativeFeatures,
  societies: [
    {
      societyId: "parents-001",
      societyName: "Time-Starved Working Parents In Survival Mode",
      score: 95,
      whyWeChoseThis: "Your ad screams 'save time tonight.' Shows real school-lunch chaos, not staged lifestyle content. The '50% Off Today Only' urgency matches how this group makes snap buying decisions at 6pm when dinner isn't planned.",
      predictedBehavior: "Will share in parent group chats and mommy Facebook groups if it actually saves them 30+ minutes. Converts immediately on scarcity + time-save promise. Will churn if delivery is slow or recipes require 'exotic' ingredients.",
      agentVoicesToSim: ["Stressed Parent", "Deal Hunter", "Weeknight Survival Strategist"]
    },
    {
      societyId: "deal-001",
      societyName: "Discount-Motivated Deal Hunters",
      score: 78,
      whyWeChoseThis: "The '50% off' opens your ad. These people have browser extensions that auto-apply coupons and follow deal aggregator accounts. They'll try anything once if the discount is real.",
      predictedBehavior: "Will convert on urgency but immediately cancel if price goes back up. Sharing likelihood is high in deal forums. Retention requires ongoing promotions or they'll churn to next discount.",
      agentVoicesToSim: ["Coupon Maximizer", "Price Tracker"]
    }
  ] as SocietyMatch[]
};

// Mock playbook for Ad A
const mockPlaybookA: PlaybookRec[] = [
  {
    societyName: "Bio-Optimization Status Flex Health Nerds",
    openWithHook: "First 3 seconds: Show the ring capturing HRV data in real-time. Open with: 'What if your body told you exactly when to push harder—or rest?' No music, just ambient sound.",
    ctaRecommendation: "Replace 'Own Your Data' with 'Join the Waitlist—Invite Only.' Scarcity + exclusivity converts this group harder than privacy framing alone.",
    cutThis: "Cut any 'for everyone' language. This society wants to feel like they're ahead of mainstream health tracking.",
    sharingLikelihood: "high",
    topObjection: "I don't trust your data encryption claims. Every company says 'we don't sell your data' until they do.",
    fixAdvice: "Add 5-second segment showing: 'Zero cloud storage. Your biodata never leaves your device. Open-source encryption audited by [credible third party].' Link to public audit report in bio."
  }
];

// Mock playbook for Ad B
const mockPlaybookB: PlaybookRec[] = [
  {
    societyName: "Time-Starved Working Parents In Survival Mode",
    openWithHook: "First 2 seconds: Show a parent staring at an empty fridge at 5:47pm, then cut to a meal on the table by 6:15pm. Open with: 'Dinner solved in 10 minutes. Tonight.' Fast cuts, no fluff.",
    ctaRecommendation: "Change '50% Off Today Only' to '50% Off + Free Delivery Tonight.' Urgency + removing friction (delivery cost) is the conversion lever. Add countdown timer.",
    cutThis: "Cut the 'gourmet' ingredient callouts. This society doesn't care about truffle oil. They want chicken, pasta, and vegetables their kids will actually eat.",
    sharingLikelihood: "high",
    topObjection: "I've tried meal kits before and half the ingredients went bad before I could use them. I don't have time to cook 'recipes.'",
    fixAdvice: "Add testimonial from real parent: 'I'm not a cook. These are literally dump-and-stir. My 7-year-old ate it.' Show prep time as '8 min active, 12 min total' to signal low effort. Offer single-night trial ($9.99) instead of subscription lock-in."
  }
];

/**
 * Simulates ad analysis
 * In production, this will call Matthew's feature extraction API
 */
export async function analyzeAd(
  file: File,
  brandMeta: BrandMeta
): Promise<AnalysisResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // For demo purposes, return Ad B (meal-prep) mock data
  // You can toggle to mockAdA to test the other scenario
  return mockAdB;
}

/**
 * Simulates society-based playbook generation
 * In production, this will call Sharan's agent simulation + variant generation
 */
export async function getPlaybook(
  societyId: string
): Promise<PlaybookRec[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Return corresponding playbook based on society
  if (societyId.startsWith('bio-opt') || societyId.startsWith('privacy')) {
    return mockPlaybookA;
  }

  return mockPlaybookB;
}

/**
 * Export all mock data for testing
 */
export const mockData = {
  adA: mockAdA,
  adB: mockAdB,
  playbookA: mockPlaybookA,
  playbookB: mockPlaybookB
};
