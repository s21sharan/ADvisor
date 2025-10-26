"""
Ad Analysis Orchestration Endpoint
Selects relevant personas, uses ASI:One agents for analysis, saves results to Supabase
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from api.smart_agent_selector import smart_selector
from db.supabase_client import supabase_client
from utils.fetchai_client import FetchAIClient

router = APIRouter(prefix="/api", tags=["Ad Analysis"])


# Request/Response Models
class AdAnalysisRequest(BaseModel):
    """Request for intelligent ad analysis with persona selection"""
    ad_id: str = Field(..., description="ID of the ad analysis from Supabase")
    feature_vector: Dict[str, Any] = Field(..., description="Extracted features from the ad (moondream, colors, layout, etc.)")
    target_age_range: Optional[str] = Field(None, description="Target age range: '18-24', '25-34', '35-44', '45+'")
    industry_keywords: Optional[List[str]] = Field(None, description="Industry/interest keywords (e.g., ['fitness', 'health'])")
    num_personas: int = Field(50, description="Number of personas to select")


class PersonaAnalysisResult(BaseModel):
    """Result from a single persona's analysis"""
    persona_id: str
    persona_name: str
    insight: str
    attention: str  # "full", "partial", "ignore"


class AdAnalysisResponse(BaseModel):
    """Response with analysis results and metadata"""
    ad_id: str
    selected_personas: List[Dict[str, Any]]
    analysis_results: Dict[str, Any]  # Maps persona_id -> {insight, attention}
    summary: Dict[str, Any]


@router.post("/analyze-ad-smart", response_model=AdAnalysisResponse)
async def analyze_ad_with_smart_selection(request: AdAnalysisRequest):
    """
    Intelligently analyze an ad using:
    1. Smart persona selection (age + 40% industry match)
    2. ASI:One agents to analyze feature vectors from each persona's perspective
    3. Aggregate results and save to Supabase

    Returns:
        Analysis results with persona insights and attention levels
    """
    try:
        # Step 1: Select relevant personas
        print(f"Selecting {request.num_personas} personas...")
        selected_personas = smart_selector.select_relevant_personas(
            target_age_range=request.target_age_range,
            industry_keywords=request.industry_keywords,
            num_personas=request.num_personas,
            industry_match_ratio=0.4
        )

        if not selected_personas:
            raise HTTPException(
                status_code=404,
                detail="No personas found matching criteria"
            )

        print(f"✓ Selected {len(selected_personas)} personas")

        # Step 2: Initialize ASI:One client
        fetchai_client = FetchAIClient(model="asi1-mini")

        # Step 3: Analyze ad from each persona's perspective using ASI:One
        analysis_results = {}
        attention_counts = {"full": 0, "partial": 0, "ignore": 0}

        for persona in selected_personas:
            persona_id = str(persona['id'])

            # Build persona context
            demographics = persona.get('demographics', {})
            psychographics = persona.get('psychographics', {})
            pain_points = persona.get('pain_points', [])
            motivations = persona.get('motivations', [])

            # Parse JSON strings if needed
            if isinstance(demographics, str):
                try:
                    demographics = json.loads(demographics)
                except:
                    demographics = {}
            if isinstance(psychographics, str):
                try:
                    psychographics = json.loads(psychographics)
                except:
                    psychographics = {}

            # Build system prompt with persona context
            system_prompt = f"""You are embodying this persona:
Name: {persona.get('name', 'Unknown')}
Summary: {persona.get('summary', '')}
Demographics: Age {demographics.get('age_range', 'unknown')}, Income {demographics.get('income_level', 'unknown')}
Values: {psychographics.get('values', [])}
Pain Points: {', '.join(pain_points) if pain_points else 'None'}
Motivations: {', '.join(motivations) if motivations else 'None'}

You are reviewing an advertisement. Respond authentically from this persona's perspective.
Your response must be in this exact JSON format:
{{
  "attention": "full" | "partial" | "ignore",
  "insight": "A single sentence explaining your reaction as this persona"
}}

Attention levels:
- "full": This ad is highly relevant and compelling to you
- "partial": Somewhat interesting but needs refinement
- "ignore": Not relevant or appealing to you

Be honest and specific based on your persona's demographics, values, and pain points."""

            # Build user prompt with feature vector
            moondream = request.feature_vector.get('moondream', {})
            features = request.feature_vector.get('features', {})

            user_prompt = f"""Analyze this advertisement:

CREATIVE SUMMARY: {moondream.get('summary', 'N/A')}
CAPTION: {moondream.get('caption', 'N/A')}
CALL TO ACTION: {moondream.get('cta', 'N/A')}
KEYWORDS: {', '.join(moondream.get('keywords', []))}
TARGET AUDIENCE: {moondream.get('target_audience', 'N/A')}

VISUAL FEATURES:
- Colors: {features.get('color', {}).get('palette_hex', [])}
- Colorfulness: {features.get('color', {}).get('colorfulness', 'N/A')}
- Aspect Ratio: {features.get('layout', {}).get('aspect_ratio', 'N/A')}
- Whitespace: {features.get('layout', {}).get('whitespace_ratio', 'N/A')}

How would YOU as this persona react to this ad? Provide your response in JSON format."""

            try:
                # Call ASI:One
                response_text = fetchai_client.generate_response(
                    prompt=user_prompt,
                    system_prompt=system_prompt,
                    temperature=0.7,
                    max_tokens=200
                )

                # Parse JSON response
                # Extract JSON from response (handle cases where model adds extra text)
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    analysis = json.loads(json_str)

                    attention = analysis.get('attention', 'partial')
                    insight = analysis.get('insight', 'No specific feedback provided.')
                else:
                    # Fallback if JSON parsing fails
                    attention = _extract_attention_level(response_text)
                    insight = response_text[:200]

            except Exception as e:
                print(f"Error analyzing with persona {persona_id}: {e}")
                # Fallback for errors
                attention = "partial"
                insight = "Analysis unavailable for this persona."

            analysis_results[persona_id] = {
                "insight": insight,
                "attention": attention,
                "persona_name": persona.get('name', 'Unknown')
            }

            attention_counts[attention] += 1

        print(f"✓ Completed {len(analysis_results)} persona analyses using ASI:One")

        # Step 4: Create summary
        total = len(analysis_results)
        summary = {
            "total_personas": total,
            "attention": {
                "full": attention_counts["full"],
                "partial": attention_counts["partial"],
                "ignore": attention_counts["ignore"]
            },
            "attention_percentages": {
                "full": round((attention_counts["full"] / total) * 100, 1) if total > 0 else 0,
                "partial": round((attention_counts["partial"] / total) * 100, 1) if total > 0 else 0,
                "ignore": round((attention_counts["ignore"] / total) * 100, 1) if total > 0 else 0
            }
        }

        # Step 5: Save to Supabase ad_analyses table
        print(f"Saving results to Supabase for ad_id: {request.ad_id}")

        # Format for storage: {byId: {persona_id: {insight, attention}}, selected: [persona_ids]}
        agent_results = {
            "byId": analysis_results,
            "selected": list(analysis_results.keys())
        }

        # Update the ad_analyses record
        update_response = supabase_client.from_("ad_analyses").update({
            "agent_results": agent_results
        }).eq("id", request.ad_id).execute()

        if not update_response.data:
            print(f"Warning: Could not update ad_analyses record {request.ad_id}")

        print(f"✓ Saved results to Supabase")

        # Step 6: Return response
        return AdAnalysisResponse(
            ad_id=request.ad_id,
            selected_personas=selected_personas,
            analysis_results=analysis_results,
            summary=summary
        )

    except Exception as e:
        print(f"Error in analyze_ad_with_smart_selection: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing ad: {str(e)}"
        )


def _extract_attention_level(analysis_text: str) -> str:
    """
    Extract attention level from analysis text using heuristics

    Returns: "full", "partial", or "ignore"
    """
    text_lower = analysis_text.lower()

    # Keywords indicating full attention
    full_keywords = [
        "compelling", "engaging", "interested", "would consider",
        "strong hook", "clear value", "resonates", "relevant to my"
    ]

    # Keywords indicating ignore
    ignore_keywords = [
        "not relevant", "doesn't apply", "wouldn't engage",
        "skip this", "not interested", "generic", "ineffective"
    ]

    # Check for full attention
    if any(keyword in text_lower for keyword in full_keywords):
        return "full"

    # Check for ignore
    if any(keyword in text_lower for keyword in ignore_keywords):
        return "ignore"

    # Default to partial
    return "partial"
