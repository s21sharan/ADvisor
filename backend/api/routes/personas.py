"""
Personas API Routes
Fetch all personas from Supabase for frontend visualization
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from db.supabase_client import supabase_client

router = APIRouter(prefix="/api/personas", tags=["Personas"])


@router.get("/all")
async def get_all_personas():
    """
    Fetch all personas from Supabase database

    Returns:
        List of all persona records with their full data
    """
    try:
        # Fetch all personas with all fields
        response = supabase_client.from_("personas").select(
            "id, name, summary, demographics, psychographics, pain_points, motivations"
        ).execute()

        if not response.data:
            return {
                "personas": [],
                "total": 0
            }

        personas = []
        for persona in response.data:
            # Parse JSON fields if they're stored as strings
            demographics = persona.get('demographics', {})
            psychographics = persona.get('psychographics', {})
            pain_points = persona.get('pain_points', [])
            motivations = persona.get('motivations', [])

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

            if isinstance(pain_points, str):
                try:
                    pain_points = json.loads(pain_points)
                except:
                    pain_points = []

            if isinstance(motivations, str):
                try:
                    motivations = json.loads(motivations)
                except:
                    motivations = []

            personas.append({
                "id": persona['id'],
                "name": persona.get('name', 'Unknown'),
                "summary": persona.get('summary', ''),
                "demographics": demographics,
                "psychographics": psychographics,
                "pain_points": pain_points,
                "motivations": motivations
            })

        print(f"✓ Fetched {len(personas)} personas from Supabase")

        return {
            "personas": personas,
            "total": len(personas)
        }

    except Exception as e:
        print(f"Error fetching personas: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching personas: {str(e)}"
        )
