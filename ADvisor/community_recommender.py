"""
AdVisor Community Recommender / Audience Router Module
=======================================================

PART 1: PRD FOR THIS MODULE
----------------------------

PURPOSE:
    The Community Recommender is the intelligent routing layer that determines which audience
    personas/communities should evaluate a given ad creative. It prevents generic, one-size-fits-all
    agent feedback by matching ads to specific psychographic personas who would actually encounter
    this ad in the wild. This module is the brain that says "this premium wearable should be judged
    by biohacker early adopters AND status-driven tech flex people, NOT by budget hunters."

INPUTS:
    1. BrandMeta: Product category, price positioning, claimed value prop, target keywords from advertiser
    2. CreativeFeatures: Extracted visual/audio/emotional features from the ad creative (tone, pacing,
       CTA, themes, demographic signals, etc.)

    NOTE: In production, CreativeFeatures comes from Matthew's Feature Extraction Engine.
    For now we mock it.

OUTPUTS:
    RoutingDecision containing:
    - ranked_results: All communities scored with rationale
    - primary_communities: Top N community IDs we select for simulation
    - notes_for_agents: Natural language summary handed to Sharan's Agent Simulation Layer
    - agent_roles: Specific agent personas to activate per community

CORE LOGIC (V1 - Transparent Heuristics):
    Scoring function evaluates each community on 3 axes:

    1. KEYWORD ALIGNMENT (40% weight):
       - Overlap between brand target_keywords + creative themes/demographics_shown
       - vs community decision_keywords
       - Uses Jaccard similarity on keyword sets

    2. PRICE SENSITIVITY MATCH (30% weight):
       - Direct alignment: premium brand → low price sensitivity community = high score
       - Mismatch penalty: budget brand → low price sensitivity = lower score

    3. CREATIVE TONE/VIBE MATCH (30% weight):
       - Matches visual_style, pacing, sentiment_tone against community visual_preferences
       - String overlap heuristic with bonus for exact phrase matches

    Final score normalized to [0.0, 1.0]. Top N communities selected for routing.

CONSTRAINTS / NON-FUNCTIONAL REQUIREMENTS:
    - Speed: Must route in <100ms for real-time feedback loop
    - Interpretability: Every score must come with human-readable rationale
    - Deterministic: Same inputs = same outputs (no randomness in V1)
    - Extensible: Easy to swap in vector similarity (Chroma) or agent marketplace (Fetch.ai) later
    - Type-safe: Full type hints for IDE autocomplete and mypy validation

SUCCESS METRICS:
    - Coverage: % of ads that get matched to at least 2 communities
    - Diversity: Avg distinct communities per ad (want 2-4, not 1, not 10)
    - Agent activation rate: % of routed communities that actually get agents spawned
    - Downstream quality: Do agents give differentiated feedback per community? (measured in Stage 5-6)
    - Manual validation: Product team spot-checks 20 ads/week, scores routing relevance 1-5
      (target: avg 4+/5)

----------------------------
PART 2: DATA MODEL / SCHEMAS
----------------------------
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional
import json


@dataclass
class BrandMeta:
    """
    Metadata about the brand/product being advertised.
    This comes from the advertiser at ad upload time.
    """
    product_name: str
    """Human-readable product name, e.g. 'Oura Ring', 'HelloFresh'"""

    category: str
    """Product category, e.g. 'meal-prep', 'wearable health', 'insurance', 'fintech'"""

    price_positioning: str
    """Price tier: 'budget', 'mid', 'premium'"""

    claimed_value_prop: str
    """What the brand says they deliver, e.g. 'save time', 'take control of your health data'"""

    target_keywords: List[str]
    """Freeform tags from advertiser about who they're targeting, e.g. ['parents', 'biohackers', 'gamers']"""


@dataclass
class CreativeFeatures:
    """
    Extracted features from the ad creative itself.
    In production, this comes from Matthew's Feature Extraction Engine.
    For now we construct this manually in tests.
    """
    visual_style: str
    """Overall aesthetic: 'minimal', 'high energy', 'chaotic cuts', 'calm luxury', etc."""

    pacing: str
    """Edit speed: 'slow', 'medium', 'fast'"""

    cta_text: str
    """Call-to-action text, e.g. 'Get 50% Off Today Only', 'Own Your Data', 'Try Free'"""

    sentiment_tone: str
    """Emotional tone: 'empowering', 'urgent scarcity', 'comfort/reassurance', 'aspirational', etc."""

    logo_presence_intensity: float
    """0.0-1.0: How in-your-face is the brand logo? 0=subtle, 1=loud branding"""

    motion_intensity: float
    """0.0-1.0: How visually busy/active is the ad? 0=static/calm, 1=high motion"""

    audio_voice_profile: str
    """Description of VO/audio: 'whispery female VO', 'hype male VO', 'no VO text-only', 'upbeat music bed'"""

    themes: List[str]
    """Conceptual themes detected: ['self-sovereignty', 'bio-tracking', 'privacy', 'family convenience', 'kid lunch prep']"""

    demographics_explicitly_shown: List[str]
    """Visual demographics in the ad: ['young parents', 'fit 20s female', 'corporate guy in suit']"""


@dataclass
class AudienceCommunity:
    """
    A psychographic persona / audience community that we can route ads to.
    Think of this like a subreddit with specific interests, vibes, and behaviors.
    """
    id: str
    """Stable handle for this community, e.g. 'r_fitness', 'r_frugal', 'r_skincareaddiction'"""

    display_name: str
    """Human-readable persona name: 'r/Fitness Enthusiasts', 'r/Frugal Deal Hunters'"""

    descriptor: str
    """1-2 sentence description of who they are and what they care about"""

    decision_keywords: List[str]
    """Topical interests (like subreddit topics): what content they engage with.
    Examples: ['gym', 'workout', 'protein', 'gains'] or ['discount', 'coupon', 'budget', 'cheap']"""

    pain_points: List[str]
    """What problems keep them up at night / what messaging works on them"""

    price_sensitivity: str
    """'low', 'medium', 'high' - how much do they care about cost?"""

    visual_preferences: List[str]
    """What creative styles appeal to them: 'high energy cuts', 'calm minimal', 'bold text', etc."""

    preferred_energy: str = "any"
    """Preferred motion/energy level: 'high' (>0.7 motion), 'low' (<0.3 motion), 'medium' (0.3-0.7), or 'any'"""

    agent_roles: List[str] = field(default_factory=list)
    """Agent personas to spawn for this community in Sharan's simulation layer:
    e.g. ['Skeptical Buyer', 'Creative Director Feedback', 'Performance Marketer Analyst']"""


@dataclass
class CommunityMatchResult:
    """
    The result of scoring one community against one ad.
    """
    community_id: str
    """Which community was scored"""

    score: float
    """0.0-1.0 relevance score"""

    rationale: str
    """Human-readable explanation of why this score happened"""

    agent_roles: List[str]
    """Which agent roles should be activated for this community"""


@dataclass
class RoutingDecision:
    """
    Final output of the Community Recommender.
    This gets passed to Sharan's Agent Simulation Layer.
    """
    ranked_results: List[CommunityMatchResult]
    """All communities, scored and sorted by relevance (high to low)"""

    primary_communities: List[str]
    """Top N community IDs we actually choose to simulate (typically 2-4)"""

    notes_for_agents: str
    """Natural language summary for agent context:
    'Act like busy working parents who need dinner fast and respond to urgency pricing'"""


"""
----------------------------
PART 3: MATCHING / SCORING DESIGN (REDESIGNED)
----------------------------

SCORING ALGORITHM V2: Content-First Intelligent Routing

CORE INSIGHT: The ad creative itself is the strongest signal. We analyze what the ad
actually shows/says and match to communities who would encounter/care about that content.

The score_community() function computes a relevance score [0.0, 1.0] by combining:

1. CONTENT SEMANTIC MATCH (60% weight) - MOST IMPORTANT
   - What is the ad actually about? Extract from:
     * creative_features.themes (concepts, topics, product categories)
     * creative_features.demographics_explicitly_shown (who's shown in the ad)
     * brand_meta.category (product type)
     * brand_meta.claimed_value_prop (benefit promises)
     * creative_features.cta_text (urgency signals, offers)

   - Match against community's subreddit-style interests:
     * decision_keywords = topics this community cares about (like subreddit names)
     * Example: r/fitness community cares about: gym, workout, gains, health
     * Example: r/budgetfood community cares about: cheap, meal-prep, discount, save money

   - Scoring:
     * Direct topic match: 1.0 (ad is about fitness → fitness community)
     * Related topic: 0.6 (ad is about health tracking → wellness community)
     * Weak overlap: 0.3 (some shared keywords)
     * No match: 0.0

2. CREATIVE ENERGY/VIBE MATCH (25% weight)
   - Does the ad's aesthetic/energy match community preferences?
   - Motion intensity matching:
     * High motion (>0.7) → energetic communities (fitness, gaming, youth)
     * Low motion (<0.3) → calm communities (wellness, minimalism, sleep/relaxation)
     * Medium motion → broad appeal

   - Sentiment tone matching:
     * "urgent / scarcity" → deal hunters, busy people
     * "calm / reassuring" → wellness, parents, anxiety-prone
     * "empowering / aspirational" → self-improvement, status-driven

   - Visual style matching:
     * "minimal / clean" → design-conscious, Gen Z, tech early adopters
     * "busy / colorful" → mass market, families, discount-focused

3. PRICE SENSITIVITY MATCH (15% weight)
   - Does the price tier match community's spending behavior?
   - "premium" → low sensitivity communities (tech enthusiasts, wellness optimizers)
   - "budget" → high sensitivity (students, frugal living, deal hunters)
   - "mid" → medium sensitivity (parents, mainstream)

FINAL SCORE:
   score = 0.60 * content_match + 0.25 * vibe_match + 0.15 * price_match

KEY DIFFERENCE FROM V1:
   - V1: Generic keyword overlap (40%), equal weight to price/vibe
   - V2: Content-first (60%), analyzes what ad is actually about, matches to subreddit-style communities

RATIONALE GENERATION:
   Build human-readable explanation:
   - "Ad content about [X] strongly matches community interest in [Y]"
   - "Creative energy [high/low/medium] aligns with community vibe"
   - "Price point [budget/mid/premium] fits community spending patterns"

FUTURE UPGRADES (TODO):
   - Use Chroma vector DB to store embeddings of past (ad, community) pairs
   - Compute semantic similarity instead of keyword overlap (handles synonyms, concepts)
   - Use Fetch.ai agent marketplace to dynamically discover niche persona agents
   - Use Bright Data web scraping to enrich community definitions with real shopper language from forums/reviews
"""


def score_community(
    brand_meta: BrandMeta,
    creative_features: CreativeFeatures,
    community: AudienceCommunity
) -> tuple[float, str]:
    """
    Score how well a community matches an ad creative using content-first approach.

    Returns:
        (raw_score: float [0.0-1.0], rationale: str)
    """

    # --- 1. CONTENT SEMANTIC MATCH (60% weight) - MOST IMPORTANT ---
    # Collect all content signals from the ad
    ad_content_signals = set()

    # Category is strongest signal (e.g., "fitness", "food", "tech")
    ad_content_signals.add(brand_meta.category.lower())

    # Target keywords from advertiser
    ad_content_signals.update([k.lower() for k in brand_meta.target_keywords])

    # Themes extracted from creative
    ad_content_signals.update([t.lower() for t in creative_features.themes])

    # Demographics shown (e.g., "young athletes", "parents", "students")
    ad_content_signals.update([d.lower() for d in creative_features.demographics_explicitly_shown])

    # Extract content from value prop (split into words)
    value_prop_words = [w.lower() for w in brand_meta.claimed_value_prop.split() if len(w) > 3]
    ad_content_signals.update(value_prop_words)

    # Extract urgency/offer signals from CTA
    cta_lower = creative_features.cta_text.lower()
    if any(x in cta_lower for x in ['%', 'off', 'discount', 'deal', 'free', 'sale']):
        ad_content_signals.add('discount-offer')
    if any(x in cta_lower for x in ['today', 'now', 'limited', 'hurry', 'expires']):
        ad_content_signals.add('urgency')

    # Match against community's topical interests
    community_keywords = set([k.lower() for k in community.decision_keywords])

    if len(ad_content_signals) == 0 or len(community_keywords) == 0:
        content_score = 0.0
        content_matches = []
    else:
        intersection = ad_content_signals & community_keywords
        # Weighted scoring: more matches = better, but also consider coverage
        if len(intersection) >= 3:
            content_score = 1.0  # Strong topical match
        elif len(intersection) >= 2:
            content_score = 0.75  # Good match
        elif len(intersection) == 1:
            content_score = 0.4  # Weak match
        else:
            content_score = 0.0  # No match

        content_matches = list(intersection)

    # --- 2. CREATIVE ENERGY/VIBE MATCH (25% weight) ---
    vibe_score = 0.0
    vibe_reasons = []

    # Motion intensity matching
    motion = creative_features.motion_intensity
    if hasattr(community, 'preferred_energy') and community.preferred_energy:
        if community.preferred_energy == 'high' and motion > 0.7:
            vibe_score += 0.4
            vibe_reasons.append("high motion matches high-energy community")
        elif community.preferred_energy == 'low' and motion < 0.3:
            vibe_score += 0.4
            vibe_reasons.append("calm/slow pacing matches low-energy community")
        elif community.preferred_energy == 'medium' and 0.3 <= motion <= 0.7:
            vibe_score += 0.3
            vibe_reasons.append("moderate motion fits community")
        elif community.preferred_energy == 'any':
            vibe_score += 0.2  # Neutral, not a strong signal
    else:
        # Fallback: check visual_preferences for energy keywords
        prefs_str = ' '.join(community.visual_preferences).lower()
        if 'high energy' in prefs_str or 'fast' in prefs_str:
            if motion > 0.7:
                vibe_score += 0.4
                vibe_reasons.append("high motion matches community preference")
        elif 'calm' in prefs_str or 'slow' in prefs_str or 'minimal' in prefs_str:
            if motion < 0.3:
                vibe_score += 0.4
                vibe_reasons.append("calm aesthetic matches community preference")

    # Sentiment tone matching
    sentiment = creative_features.sentiment_tone.lower()
    prefs_str = ' '.join(community.visual_preferences).lower()

    if 'urgent' in sentiment or 'scarcity' in sentiment:
        if any(x in prefs_str for x in ['urgency', 'deal', 'discount', 'fast']):
            vibe_score += 0.3
            vibe_reasons.append("urgent tone matches community responsiveness")
    elif 'calm' in sentiment or 'reassuring' in sentiment:
        if any(x in prefs_str for x in ['calm', 'mindful', 'soothing', 'gentle']):
            vibe_score += 0.3
            vibe_reasons.append("calm tone matches community vibe")
    elif 'empowering' in sentiment or 'aspirational' in sentiment:
        if any(x in prefs_str for x in ['aspirational', 'growth', 'optimization', 'premium']):
            vibe_score += 0.3
            vibe_reasons.append("aspirational tone matches community mindset")

    # Visual style matching
    visual = creative_features.visual_style.lower()
    if 'minimal' in visual or 'clean' in visual:
        if any(x in prefs_str for x in ['minimal', 'clean', 'aesthetic', 'design']):
            vibe_score += 0.3
            vibe_reasons.append("minimal design matches aesthetic preferences")
    elif 'busy' in visual or 'colorful' in visual:
        if any(x in prefs_str for x in ['energetic', 'vibrant', 'bold', 'loud']):
            vibe_score += 0.3
            vibe_reasons.append("bold visual style matches community taste")

    vibe_score = min(vibe_score, 1.0)  # Cap at 1.0

    # --- 3. PRICE SENSITIVITY MATCH (15% weight) ---
    price_map = {
        ("premium", "low"): 1.0,
        ("premium", "medium"): 0.6,
        ("premium", "high"): 0.2,
        ("mid", "low"): 0.6,
        ("mid", "medium"): 1.0,
        ("mid", "high"): 0.6,
        ("budget", "low"): 0.2,
        ("budget", "medium"): 0.6,
        ("budget", "high"): 1.0,
    }
    price_score = price_map.get(
        (brand_meta.price_positioning.lower(), community.price_sensitivity.lower()),
        0.5  # default to neutral if unknown
    )

    # --- FINAL SCORE ---
    final_score = 0.60 * content_score + 0.25 * vibe_score + 0.15 * price_score

    # --- RATIONALE ---
    rationale_parts = []

    if content_matches:
        top_matches = content_matches[:5]  # Show first 5
        rationale_parts.append(
            f"Content match on topics: {top_matches}"
        )
    else:
        rationale_parts.append("No topical overlap with community interests")

    if vibe_reasons:
        rationale_parts.append(f"Creative vibe: {'; '.join(vibe_reasons)}")
    else:
        rationale_parts.append("Creative energy/style does not strongly align")

    price_desc = {
        1.0: "perfect price fit",
        0.6: "acceptable price match",
        0.2: "price mismatch"
    }
    rationale_parts.append(f"Price: {price_desc.get(price_score, 'neutral')}")

    rationale = ". ".join(rationale_parts).capitalize() + f". (Score: {final_score:.2f})"

    return final_score, rationale


def route_audiences(
    brand_meta: BrandMeta,
    creative_features: CreativeFeatures,
    community_library: List[AudienceCommunity],
    top_n: int = 2
) -> RoutingDecision:
    """
    Route an ad to the most relevant audience communities.

    Args:
        brand_meta: Brand/product metadata
        creative_features: Extracted creative features
        community_library: List of all available communities
        top_n: How many top communities to select for simulation (default 2)

    Returns:
        RoutingDecision with ranked results and top N primary communities
    """

    # Score every community
    results = []
    for community in community_library:
        score, rationale = score_community(brand_meta, creative_features, community)
        results.append(CommunityMatchResult(
            community_id=community.id,
            score=score,
            rationale=rationale,
            agent_roles=community.agent_roles
        ))

    # Sort by score descending
    results.sort(key=lambda r: r.score, reverse=True)

    # Select top N
    primary = [r.community_id for r in results[:top_n]]

    # Generate notes for agents
    if len(primary) == 0:
        notes = "No strong community match found. Use generic feedback agents."
    else:
        # Get display names for selected communities
        selected_communities = [c for c in community_library if c.id in primary]
        personas = [c.display_name for c in selected_communities]
        descriptors = [c.descriptor for c in selected_communities]

        notes = (
            f"Simulate feedback from these audience communities: {', '.join(personas)}. "
            f"Context: {' | '.join(descriptors)}"
        )

    return RoutingDecision(
        ranked_results=results,
        primary_communities=primary,
        notes_for_agents=notes
    )


"""
----------------------------
PART 4: IN-MEMORY COMMUNITY LIBRARY
----------------------------
"""

COMMUNITY_LIBRARY: List[AudienceCommunity] = [

    # r/Fitness - Gym Enthusiasts & Athletes
    AudienceCommunity(
        id="r_fitness",
        display_name="r/Fitness - Gym Enthusiasts",
        descriptor=(
            "Dedicated gym-goers, athletes, and fitness enthusiasts (18-45) who track workouts, "
            "care about gains, and want to optimize their training. Respond to transformation stories and performance metrics."
        ),
        decision_keywords=[
            "gym", "fitness", "workout", "training", "gains", "muscle", "strength",
            "bodybuilding", "exercise", "athletes", "crunch", "membership", "free trial",
            "join", "sweat", "lifting", "cardio", "health", "weight"
        ],
        pain_points=[
            "Finding affordable gym memberships",
            "Staying motivated to work out",
            "Getting visible results",
            "Gym anxiety / intimidation",
            "Balancing fitness with busy schedule"
        ],
        price_sensitivity="medium",
        visual_preferences=[
            "high energy action shots",
            "transformation before/afters",
            "people working out",
            "bold text overlays",
            "fast cuts",
            "motivational tone"
        ],
        preferred_energy="high",
        agent_roles=["Fitness Enthusiast Critic", "Deal-Seeker Gym Member", "Skeptical Newbie"]
    ),

    # r/Frugal - Budget-Conscious Deal Hunters
    AudienceCommunity(
        id="r_frugal",
        display_name="r/Frugal - Budget-Conscious Shoppers",
        descriptor=(
            "Extremely price-sensitive consumers (all ages) who hunt for discounts, compare prices obsessively, "
            "and only buy when there's a clear value. Flash sales and limited-time offers grab their attention."
        ),
        decision_keywords=[
            "discount", "deal", "coupon", "sale", "% off", "cheap", "budget", "save money",
            "affordable", "promo code", "limited time", "flash sale", "free shipping",
            "price", "value", "bargain", "clearance", "today only", "expires", "hurry"
        ],
        pain_points=[
            "Can't justify full price purchases",
            "FOMO on missing good deals",
            "Need to stretch every dollar",
            "Skeptical of marketing tricks"
        ],
        price_sensitivity="high",
        visual_preferences=[
            "big bold discount percentages",
            "countdown timers",
            "urgency messaging",
            "clear price comparisons",
            "red/yellow sale colors"
        ],
        preferred_energy="high",
        agent_roles=["Extreme Coupon Hunter", "Price Skeptic", "Deal Calculator"]
    ),

    # r/Food / r/FoodPorn - Food Lovers
    AudienceCommunity(
        id="r_food",
        display_name="r/Food - Food Enthusiasts",
        descriptor=(
            "People who love food (all ages), enjoy trying new restaurants/menu items, "
            "and make impulse food decisions based on cravings. Respond to mouth-watering visuals."
        ),
        decision_keywords=[
            "food", "sandwich", "burger", "bagel", "meal", "restaurant", "menu", "eat",
            "delicious", "tasty", "yummy", "new item", "limited edition", "egg",
            "bacon", "cheese", "oktoberfest", "breakfast", "lunch", "dinner", "order now"
        ],
        pain_points=[
            "Decision fatigue about what to eat",
            "Wanting to try new flavors",
            "Fear of missing limited-time menu items",
            "Craving satisfaction"
        ],
        price_sensitivity="medium",
        visual_preferences=[
            "close-up food shots",
            "appetizing colors",
            "hands holding food",
            "product focus",
            "mouth-watering presentation"
        ],
        preferred_energy="medium",
        agent_roles=["Foodie Critic", "Impulse Eater", "Menu Skeptic"]
    ),

    # r/Sleep / r/Biohackers - Sleep & Health Optimization
    AudienceCommunity(
        id="r_sleep_optimization",
        display_name="r/Sleep - Sleep & Recovery Focused",
        descriptor=(
            "People struggling with sleep quality (25-55), biohackers optimizing recovery, "
            "and health-conscious individuals who invest in sleep tech. Want data-driven benefits."
        ),
        decision_keywords=[
            "sleep", "bed", "mattress", "cool", "temperature", "rest", "recovery",
            "sleep tracking", "smart bed", "comfort", "insomnia", "sleep better",
            "temperature control", "cooling", "climate", "control", "sleep number"
        ],
        pain_points=[
            "Can't sleep because too hot/cold",
            "Poor sleep quality affecting energy",
            "Willing to invest in better rest",
            "Want measurable sleep improvements"
        ],
        price_sensitivity="low",
        visual_preferences=[
            "calm soothing visuals",
            "product demos",
            "clean professional look",
            "data/stats overlays",
            "bedroom settings"
        ],
        preferred_energy="low",
        agent_roles=["Sleep-Deprived Buyer", "Tech Specs Analyst", "Comfort Skeptic"]
    ),

    # r/CollegeStudents - Students & Young Adults
    AudienceCommunity(
        id="r_college_students",
        display_name="r/CollegeStudents - Students & Young Adults",
        descriptor=(
            "College students and young adults (18-24) living on tight budgets but wanting social experiences. "
            "Respond to student discounts, free trials, and low-commitment offers."
        ),
        decision_keywords=[
            "student", "college", "university", "cheap", "free", "trial", "membership",
            "young", "campus", "$1", "down payment", "month free", "starting at",
            "affordable", "budget", "broke", "discount"
        ],
        pain_points=[
            "Living on student budget",
            "FOMO on social activities",
            "Want fitness/services but can't afford full price",
            "Need flexible commitments (not long contracts)"
        ],
        price_sensitivity="high",
        visual_preferences=[
            "relatable student scenarios",
            "energetic youthful vibe",
            "social proof (groups of people)",
            "bold offers highlighted"
        ],
        preferred_energy="high",
        agent_roles=["Broke College Student", "Deal-Seeking Skeptic", "Social FOMO Responder"]
    ),

    # r/DesignPorn / r/MinimalistLiving - Aesthetic-Focused
    AudienceCommunity(
        id="r_design_aesthetics",
        display_name="r/DesignPorn - Design & Aesthetic Lovers",
        descriptor=(
            "Design-conscious individuals (22-40) who care deeply about aesthetics, minimalism, "
            "and visual coherence. Hate loud branding and busy designs. Premium willingness if beautiful."
        ),
        decision_keywords=[
            "design", "aesthetic", "minimal", "clean", "sleek", "beautiful", "elegant",
            "modern", "simple", "sophisticated", "visual", "style", "luxury", "premium",
            "calm", "muted colors", "typography"
        ],
        pain_points=[
            "Tired of ugly, cluttered ads",
            "Want products that look good",
            "Willing to pay for good design",
            "Hate loud, obnoxious branding"
        ],
        price_sensitivity="low",
        visual_preferences=[
            "minimal clean layouts",
            "plenty of whitespace",
            "muted color palettes",
            "high-quality product photography",
            "slow deliberate pacing"
        ],
        preferred_energy="low",
        agent_roles=["Design Snob", "Aesthetic Purist", "Brand Skeptic"]
    ),

    # r/BuyItForLife / r/Wellness - Quality-Focused Health Seekers
    AudienceCommunity(
        id="r_wellness_quality",
        display_name="r/Wellness - Holistic Health & Quality",
        descriptor=(
            "Health-conscious consumers (28-55) who prioritize quality, natural ingredients, "
            "and long-term wellness over quick fixes. Skeptical of gimmicks, want science-backed claims."
        ),
        decision_keywords=[
            "wellness", "health", "natural", "quality", "organic", "holistic", "sustainable",
            "sleep", "recovery", "balance", "self-care", "mindful", "healing", "clean",
            "body", "science", "research", "proven"
        ],
        pain_points=[
            "Tired of low-quality products",
            "Want brands aligned with values",
            "Skeptical of greenwashing",
            "Need actual health benefits, not hype"
        ],
        price_sensitivity="medium",
        visual_preferences=[
            "calm natural tones",
            "authentic real people",
            "slow mindful pacing",
            "data/research mentions",
            "soft reassuring messaging"
        ],
        preferred_energy="low",
        agent_roles=["Health Purist", "Research Skeptic", "Value-Conscious Buyer"]
    ),

]


"""
----------------------------
PART 4 (continued): TEST ADS AND EXECUTION
----------------------------
"""

if __name__ == "__main__":

    # TODO(matthew): wire in real CreativeFeatures from extractor pipeline
    # For now we manually construct test ads

    print("=" * 80)
    print("AdVisor Community Recommender - Test Run")
    print("=" * 80)
    print()

    # ---- TEST AD A: Premium Wearable Health Ring ----
    print("▶ TEST AD A: Premium Wearable Health Ring (Oura-style)")
    print("-" * 80)

    brand_meta_A = BrandMeta(
        product_name="Aura Ring",
        category="wearable health",
        price_positioning="premium",
        claimed_value_prop="take control of your health data",
        target_keywords=["biohackers", "self-optimization", "privacy", "status"]
    )

    creative_features_A = CreativeFeatures(
        visual_style="minimal calm luxury",
        pacing="slow",
        cta_text="Own Your Data",
        sentiment_tone="empowering / self-sovereign",
        logo_presence_intensity=0.2,
        motion_intensity=0.1,
        audio_voice_profile="soft female VO, confident whisper",
        themes=["self-sovereignty", "biometrics", "privacy", "elite control"],
        demographics_explicitly_shown=["fit 20s female", "sleek hand close-ups"]
    )

    decision_A = route_audiences(
        brand_meta=brand_meta_A,
        creative_features=creative_features_A,
        community_library=COMMUNITY_LIBRARY,
        top_n=3  # Let's see top 3 for this premium ad
    )

    print("\n📊 ROUTING DECISION (as dict):")
    print(json.dumps(asdict(decision_A), indent=2))

    print("\n📝 HUMAN-READABLE EXPLANATION:")
    print(f"\n✓ Top communities selected: {decision_A.primary_communities}")
    print(f"\n✓ Why they were chosen:")
    for result in decision_A.ranked_results[:3]:
        community_obj = next(c for c in COMMUNITY_LIBRARY if c.id == result.community_id)
        print(f"   • {community_obj.display_name} (score: {result.score:.3f})")
        print(f"     → {result.rationale}")

    print(f"\n✓ Agent context for Sharan's layer:")
    print(f"   {decision_A.notes_for_agents}")

    all_agent_roles_A = []
    for cid in decision_A.primary_communities:
        community_obj = next(c for c in COMMUNITY_LIBRARY if c.id == cid)
        all_agent_roles_A.extend(community_obj.agent_roles)

    print(f"\n✓ Agents to activate next (Sharan hook): {all_agent_roles_A}")
    # TODO(sharan): pass RoutingDecision.primary_communities + notes_for_agents into agent simulator

    print("\n" + "=" * 80)
    print()

    # ---- TEST AD B: Meal-Prep Subscription for Parents ----
    print("▶ TEST AD B: Meal-Prep Subscription for Parents (HelloFresh-style)")
    print("-" * 80)

    brand_meta_B = BrandMeta(
        product_name="DinnerSaver",
        category="meal-prep subscription",
        price_positioning="mid",
        claimed_value_prop="save 6 hrs a week on dinner",
        target_keywords=["parents", "time saving", "family", "weeknight stress", "budget-aware"]
    )

    creative_features_B = CreativeFeatures(
        visual_style="fast-cut kitchen montage",
        pacing="fast",
        cta_text="Get 50% Off Today Only",
        sentiment_tone="urgent relief / stop stressing dinner",
        logo_presence_intensity=0.7,
        motion_intensity=0.8,
        audio_voice_profile="high-energy narration over chaos of after-school rush",
        themes=["convenience", "feeding kids fast", "discount", "school lunch packing"],
        demographics_explicitly_shown=["busy parents", "kids at table", "mom packing lunch"]
    )

    decision_B = route_audiences(
        brand_meta=brand_meta_B,
        creative_features=creative_features_B,
        community_library=COMMUNITY_LIBRARY,
        top_n=2
    )

    print("\n📊 ROUTING DECISION (as dict):")
    print(json.dumps(asdict(decision_B), indent=2))

    print("\n📝 HUMAN-READABLE EXPLANATION:")
    print(f"\n✓ Top communities selected: {decision_B.primary_communities}")
    print(f"\n✓ Why they were chosen:")
    for result in decision_B.ranked_results[:3]:
        community_obj = next(c for c in COMMUNITY_LIBRARY if c.id == result.community_id)
        print(f"   • {community_obj.display_name} (score: {result.score:.3f})")
        print(f"     → {result.rationale}")

    print(f"\n✓ Agent context for Sharan's layer:")
    print(f"   {decision_B.notes_for_agents}")

    all_agent_roles_B = []
    for cid in decision_B.primary_communities:
        community_obj = next(c for c in COMMUNITY_LIBRARY if c.id == cid)
        all_agent_roles_B.extend(community_obj.agent_roles)

    print(f"\n✓ Agents to activate next (Sharan hook): {all_agent_roles_B}")
    # TODO(sharan): pass RoutingDecision.primary_communities + notes_for_agents into agent simulator

    print("\n" + "=" * 80)
    print("✅ Community Recommender test complete.")
    print("=" * 80)


"""
----------------------------
PART 5: FUTURE / STRETCH IDEAS
----------------------------

CONCRETE NEXT STEPS FOR ENHANCEMENT:

1. CHROMA VECTOR DB FOR SEMANTIC SIMILARITY
   -------------------------------------------
   Current limitation: Keyword overlap misses semantic similarity
   (e.g. "time-saving" vs "efficiency" should match but won't with exact string matching)

   APPROACH:
   - Store embeddings of past (ad creative features + brand meta) → community matches
   - Use sentence-transformers (e.g. 'all-MiniLM-L6-v2') to embed:
     * Concatenate brand.claimed_value_prop + creative.themes + creative.sentiment_tone
     * Store in Chroma with metadata = {community_id, score, timestamp}
   - For new ad:
     * Embed the same way
     * Query Chroma for nearest neighbors (top K similar past ads)
     * Weight communities that appeared in similar past ads higher
     * Blend with heuristic score: final = 0.6*heuristic + 0.4*embedding_similarity

   IMPLEMENTATION SKETCH:
   ```python
   import chromadb
   from sentence_transformers import SentenceTransformer

   client = chromadb.Client()
   collection = client.create_collection("ad_community_matches")
   model = SentenceTransformer('all-MiniLM-L6-v2')

   def embed_ad(brand_meta, creative_features):
       text = f"{brand_meta.claimed_value_prop} {' '.join(creative_features.themes)} {creative_features.sentiment_tone}"
       return model.encode(text).tolist()

   # Store: collection.add(embeddings=[...], metadatas=[{"community_id": ...}])
   # Query: collection.query(query_embeddings=[...], n_results=5)
   ```

   BENEFIT: Handles synonyms, conceptual overlap, learns from past routing success

2. FETCH.AI AGENT MARKETPLACE FOR DYNAMIC PERSONA DISCOVERY
   ----------------------------------------------------------
   Current limitation: We have a fixed set of 6 communities. What if we need niche personas
   like "crypto-native DeFi power users" or "suburban dads who grill"?

   APPROACH:
   - Publish ad metadata to Fetch.ai marketplace as a "persona discovery request"
   - Let decentralized agents bid to provide feedback as niche personas
   - Agents self-describe their persona profile (decision_keywords, pain_points, etc.)
   - Our router evaluates incoming agent bids using same score_community() logic
   - Select top N agents dynamically, pay them for simulation work

   IMPLEMENTATION SKETCH:
   - Use Fetch.ai uAgents framework to create a "RouterAgent" that:
     * Broadcasts ad features as a task
     * Receives bids from PersonaAgent instances
     * Scores bids and selects winners
     * Passes selected agents to Sharan's simulation layer

   BENEFIT: Infinite scalability of personas, crowdsourced niche audience knowledge,
            decentralized marketplace incentives align with quality feedback

3. BRIGHT DATA FOR ENRICHING AUDIENCE DEFINITIONS
   -----------------------------------------------
   Current limitation: Our community.decision_keywords are hand-written and may be stale
   or miss real-world language that actual shoppers use.

   APPROACH:
   - Use Bright Data web scraping to pull:
     * Reddit threads about product categories (e.g. r/Parenting for "busy parents")
     * Amazon/Yelp reviews for competitor products
     * TikTok/Instagram comment sentiment for viral ads in the same category
   - Extract commonly used phrases, pain points, desire language
   - Auto-update community.decision_keywords quarterly with fresh language

   IMPLEMENTATION SKETCH:
   - Bright Data Scraping Browser API → scrape Reddit/reviews
   - Use NLP (spaCy, KeyBERT) to extract keyphrases
   - Diff against current decision_keywords, propose additions
   - Product team approves updates, or auto-merge if confidence > threshold

   BENEFIT: Keeps community definitions grounded in real user language,
            captures emerging trends (e.g. "inflammation" becoming a wellness buzzword)

4. EXPORTING TO INSIGHTS DASHBOARD
   ---------------------------------
   Current limitation: RoutingDecision lives in memory, not surfaced to product team or advertisers.

   APPROACH:
   - After routing, write RoutingDecision to a shared data store (PostgreSQL, Firestore, etc.)
   - Schema:
     * ad_id, timestamp, primary_communities[], ranked_scores[], notes_for_agents
     * Link to downstream agent outputs (from Sharan's layer)
   - Insights Dashboard (Stage 7) queries this data to show:
     * "Your ad was routed to: Busy Parents (0.87 match), Budget Hunters (0.72 match)"
     * "Agent feedback from these communities: [links to detailed reports]"
     * Aggregate stats: "Ads in 'meal-prep' category typically match 2.3 communities on avg"

   IMPLEMENTATION SKETCH:
   ```python
   def save_routing_decision(ad_id: str, decision: RoutingDecision):
       db.routing_decisions.insert({
           "ad_id": ad_id,
           "timestamp": datetime.utcnow(),
           "primary_communities": decision.primary_communities,
           "ranked_results": [asdict(r) for r in decision.ranked_results],
           "notes_for_agents": decision.notes_for_agents
       })
   ```

   BENEFIT: Product visibility, advertiser transparency, ability to A/B test routing logic,
            track which communities give most actionable feedback over time

----------------------------
END OF MODULE
----------------------------
"""
