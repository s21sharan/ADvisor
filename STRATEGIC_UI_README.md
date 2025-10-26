# AdVisor Strategic UI Implementation

## Overview

This is the **enterprise-grade, strategic intelligence** version of AdVisor, inspired by Artificial Societies (societies.io). The UI focuses on:

- **Serious, professional aesthetic** (not playful or bubbly)
- **AI superpower positioning** (control room for marketing decisions)
- **Narrative insights over charts** (story-driven, not dashboard-driven)
- **Strong input/output contrast** (upload left, context right → simulation → insights)

---

## Architecture

### File Structure

```
/app/
  strategic-upload/page.tsx       # Screen A: Upload & Describe
  strategic-results/page.tsx      # Screen B: Results / Simulation Report (HERO)
  strategic-detail/page.tsx       # Screen C: Society Detail / Agent Transcript

/components/strategic/
  UploadZone.tsx                  # File upload drag-and-drop
  BrandInfoForm.tsx               # Brand context form
  PrimaryCTA.tsx                  # "Run Simulation" button
  CreativeSummaryCard.tsx         # Detected creative features
  SocietyList.tsx                 # List of society cards
  SocietyCard.tsx                 # Individual society breakdown
  VariantSuggestionsPanel.tsx     # Improved hooks/copy
  ActionBar.tsx                   # Export/download actions
  SocietyHeader.tsx               # Detail page header
  AgentFeedbackThread.tsx         # Agent transcript display

/types/
  advisor.ts                      # TypeScript interfaces

/data/
  mockSimulation.ts               # Mock simulation data
```

---

## User Flow

```
1. Upload & Describe
   ↓
2. Run Simulation (CTA)
   ↓
3. Results Page (HERO SCREEN)
   - Creative summary
   - Society breakdown
   - Variant suggestions
   - Export options
   ↓
4. Click "View Agent Transcripts"
   ↓
5. Society Detail Page
   - Agent-by-agent feedback
   - Transparency layer
```

---

## Screen Specifications

### Screen A: Upload & Describe (`/strategic-upload`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ "Test your creative before you spend."             │
│ Subtext: "We'll analyze your ad..."                │
├─────────────────────┬───────────────────────────────┤
│ LEFT: Upload Zone   │ RIGHT: Brand Context Form     │
│                     │                               │
└─────────────────────┴───────────────────────────────┘
            [Run Simulation]
```

**Components:**
- `UploadZone`: Drag-and-drop for .png/.mp4
- `BrandInfoForm`: Product name, category, price position, value prop, target audience, ad goal
- `PrimaryCTA`: "Run Simulation" button

**Behavior:**
- Validates: file + product name + value prop + target audience
- On submit: Stores context in sessionStorage, navigates to `/strategic-results`

---

### Screen B: Results / Simulation Report (`/strategic-results`) **[HERO SCREEN]**

**Purpose:** Show what the system detected, which societies matched, and how to improve.

**Sections:**

1. **Simulation Summary**
   - Headline: "Simulation Complete"
   - Subtext: "We analyzed your creative and ran simulations across buyer societies..."

2. **Creative Summary Card**
   - Shows uploaded file name + detected features:
     - Tone (e.g., "Fast-cut, high urgency")
     - CTA (e.g., "50% Off Today Only")
     - Implied Promise (e.g., "Save 6 hours a week on dinner")

3. **Society Breakdown**
   - List of `SocietyCard` components
   - Each card shows:
     - Society name
     - Relevance score (0-100%)
     - **Motivation** (core driver)
     - **Friction** (objection/skepticism)
     - **Conversion Trigger** (what makes them click)
     - "View Agent Transcripts" button

4. **Variant Suggestions Panel**
   - Shows rewritten hooks/copy for top 2 societies
   - Example: "Dinner done in 2 minutes. They eat. You breathe."

5. **Action Bar**
   - "Download Report" button
   - "Generate New Variant" button

**Key Design:**
- Clean white background
- Bordered cards with subtle shadows
- Strong typography hierarchy
- No charts, just narrative text

---

### Screen C: Society Detail (`/strategic-detail`)

**Purpose:** Transparency layer showing agent-by-agent feedback.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Society: Time-Starved Working Parents                │
│ Simulated reaction:                                  │
├──────────────────────────────────────────────────────┤
│ [Agent Avatar] Stressed Parent Agent                 │
│ • Emotional reaction: "..."                          │
│ • Objection: "..."                                   │
│ • Click trigger: "..."                               │
│ • Suggested change: "..."                            │
├──────────────────────────────────────────────────────┤
│ [Agent Avatar] Performance Marketer Agent            │
│ • Funnel analysis: "..."                             │
│ • ...                                                │
└──────────────────────────────────────────────────────┘
```

**Components:**
- `SocietyHeader`: Shows society name + relevance score
- `AgentFeedbackThread`: Renders multiple `AgentFeedback` items
  - Each shows: role, emotional reaction, objection, click trigger, suggested change

---

## Data Types

### Core Interfaces (see `/types/advisor.ts`)

```typescript
interface BrandContext {
  productName: string;
  productCategory: string;
  pricePosition: 'budget' | 'mid' | 'premium';
  valueProp: string;
  targetAudience: string;
  adGoal: 'awareness' | 'signups' | 'purchase';
}

interface CreativeAnalysis {
  tone: string;
  cta: string;
  impliedPromise: string;
}

interface Society {
  id: string;
  name: string;
  score: number; // 0.0-1.0
  motivation: string;
  friction: string;
  conversionTrigger: string;
  recommended: boolean;
  suggestedHooks: string[];
}

interface AgentFeedback {
  agentRole: string;
  emotionalReaction: string;
  objection: string;
  clickTrigger: string;
  suggestedChange: string;
  funnelAnalysis?: string;
}

interface SimulationResult {
  creativeAnalysis: CreativeAnalysis;
  societies: Society[];
  agentTranscripts: {
    [societyId: string]: AgentFeedback[];
  };
}
```

---

## Mock Data

**Example:** Meal-prep ad for overwhelmed parents

**Societies:**
1. **Time-Starved Working Parents** (92% match, RECOMMENDED)
   - Motivation: "I just need dinner solved fast"
   - Friction: "Is this actually healthy?"
   - Trigger: "Show my kid eating happily in first 2 seconds"
   - Hooks:
     - "Dinner done in 2 minutes. They eat. You breathe."
     - "Stop scrambling tonight. 50% off your first calm evening."

2. **Deal-Driven Budget Hunters** (81% match, RECOMMENDED)
   - Motivation: "Show me the discount and the math"
   - Friction: "I don't believe this is really 50% off"
   - Trigger: "Proof of savings right now"
   - Hooks:
     - "Feed the house under $4 a plate tonight."
     - "$47 normally. $23.50 tonight. Do the math."

**Agent Transcripts (Time-Starved Parents):**
- **Stressed Parent Agent**
  - Emotional reaction: "I'm overwhelmed. Talk to me like you're saving my night."
  - Objection: "Is my kid gonna eat this or complain again?"
  - Click trigger: "Show me a calm kid eating without a fight."
  - Suggested change: "Open with a kid happily eating, not kitchen chaos. Lead with relief, not stress."

- **Performance Marketer Agent**
  - Funnel analysis: "High click-through potential but expect 60%+ bounce if landing page doesn't immediately show happy kids eating."
  - Suggested change: "The CTA '50% Off Today Only' is good urgency, but you didn't earn trust yet. Lead with relief, then price."

---

## Backend Integration Points

### TODO Comments in Code

```typescript
// TODO(matthew): populate creative summary from feature extraction pipeline
// Located in: /app/strategic-results/page.tsx

// TODO(router): replace hardcoded societies with output from Society Selection module
// Located in: /app/strategic-results/page.tsx

// TODO(sharan): fetch society-specific agent transcripts
// Located in: /app/strategic-detail/page.tsx
```

### API Endpoints to Implement

1. **POST /api/analyze-creative**
   - Input: `{ file: File, brandContext: BrandContext }`
   - Output: `CreativeAnalysis`

2. **POST /api/select-societies**
   - Input: `{ creativeAnalysis: CreativeAnalysis, brandContext: BrandContext }`
   - Output: `Society[]`

3. **GET /api/agent-transcripts/:societyId**
   - Input: `societyId`
   - Output: `AgentFeedback[]`

---

## Design Principles

### ✅ DO
- Use clean white/gray backgrounds
- Strong typography hierarchy (semibold headers, regular body)
- Bordered cards with subtle shadows
- Narrative explanations (motivation, friction, trigger)
- Enterprise-grade, serious tone
- "Control room" aesthetic

### ❌ DON'T
- No playful colors or bubbly design
- No generic charts/graphs
- No dashboard clutter
- No cute illustrations
- Not Canva-style

---

## Running the Code

### Start Dev Server
```bash
npm run dev
```

### Navigate to Strategic UI
```
http://localhost:3000/strategic-upload
```

### Flow
1. Upload a creative file
2. Fill brand context form
3. Click "Run Simulation"
4. View results page with societies
5. Click "View Agent Transcripts" on any society
6. See detailed agent feedback

---

## Component Exports

All components are properly exported and can be imported:

```typescript
import UploadZone from '@/components/strategic/UploadZone';
import BrandInfoForm from '@/components/strategic/BrandInfoForm';
import PrimaryCTA from '@/components/strategic/PrimaryCTA';
import CreativeSummaryCard from '@/components/strategic/CreativeSummaryCard';
import SocietyCard from '@/components/strategic/SocietyCard';
import SocietyList from '@/components/strategic/SocietyList';
import VariantSuggestionsPanel from '@/components/strategic/VariantSuggestionsPanel';
import ActionBar from '@/components/strategic/ActionBar';
import SocietyHeader from '@/components/strategic/SocietyHeader';
import AgentFeedbackThread from '@/components/strategic/AgentFeedbackThread';
```

---

## Styling

Uses **utility-first className** approach (Tailwind-compatible):

```jsx
className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black"
```

To enable Tailwind CSS:
1. Install: `npm install -D tailwindcss postcss autoprefixer`
2. Initialize: `npx tailwindcss init`
3. Configure `tailwind.config.js` content paths
4. Add Tailwind directives to `globals.css`

---

## Next Steps

1. **Wire up backend**: Replace mock data with real API calls
2. **Add Tailwind**: Install and configure Tailwind CSS
3. **Creative preview**: Show actual uploaded image/video preview
4. **Export functionality**: Implement PDF report generation
5. **Variant generation**: Connect to creative generation pipeline
6. **Authentication**: Add user accounts and saved simulations
7. **Analytics**: Track which societies perform best

---

## Key Differentiators

This UI mirrors Artificial Societies' positioning:

| Artificial Societies | AdVisor |
|---------------------|---------|
| "Describe your audience, we simulate it" | "Upload your ad, we analyze it" |
| "Here's how they respond" | "Here's which societies react" |
| "Here are winning variants" | "Here are better hooks/copy" |
| Simulates LinkedIn engagement | Simulates buyer behavior |
| Professional, serious, strategic | Professional, serious, strategic |

---

**Built for strategic intelligence. Not for decoration.**
