"""
Persona Agent System for AdVisor
Creates AI agents for each persona that can retrieve and reason about information
"""
import sys
from pathlib import Path
from typing import List, Dict, Optional, Any
import json

sys.path.append(str(Path(__file__).parent.parent))

from es_search.es_client import ElasticsearchClient
from utils.openai_client import OpenAIClient


class PersonaAgent:
    """
    AI Agent representing a specific persona
    Can retrieve information and provide insights based on persona characteristics
    """

    def __init__(self, persona_id: str):
        self.es = ElasticsearchClient()
        self.openai = OpenAIClient()
        self.persona_id = persona_id
        self.persona_data = None
        self._load_persona()

    def _load_persona(self):
        """Load persona data from Elasticsearch"""
        try:
            response = self.es.es.get(index="advisor_personas", id=self.persona_id)
            self.persona_data = response["_source"]
        except Exception as e:
            raise ValueError(f"Failed to load persona {self.persona_id}: {e}")

    def get_context(self) -> str:
        """
        Generate context string for the agent based on persona characteristics

        Returns:
            Formatted context string describing the persona
        """
        if not self.persona_data:
            return ""

        demographics = self.persona_data.get("demographics", {})
        psychographics = self.persona_data.get("psychographics", {})

        context = f"""You are {self.persona_data.get('name', 'Unknown')}, a persona representing:

Summary: {self.persona_data.get('summary', 'No summary available')}

Demographics:
- Age Range: {demographics.get('age_range', 'Unknown')}
- Gender: {demographics.get('gender', 'Unknown')}
- Income Level: {demographics.get('income_level', 'Unknown')}
- Education: {demographics.get('education', 'Unknown')}
- Occupation: {demographics.get('occupation', 'Unknown')}
- Location: {demographics.get('location', 'Unknown')}

Psychographics:
- Values: {', '.join(psychographics.get('values', [])) if isinstance(psychographics.get('values'), list) else psychographics.get('values', 'Unknown')}
- Lifestyle: {psychographics.get('lifestyle', 'Unknown')}
- Personality Traits: {', '.join(psychographics.get('personality_traits', [])) if isinstance(psychographics.get('personality_traits'), list) else psychographics.get('personality_traits', 'Unknown')}

Pain Points:
{self._format_list(self.persona_data.get('pain_points', []))}

Motivations:
{self._format_list(self.persona_data.get('motivations', []))}

Interests: {', '.join(self.persona_data.get('interests', []))}
Communities: {', '.join(self.persona_data.get('communities', []))}

As this persona, you should:
1. Think and respond from this persona's perspective
2. Consider your pain points and motivations in your responses
3. Provide authentic insights based on your demographics and psychographics
4. Reference relevant information from your communities and interests when applicable
"""
        return context

    def _format_list(self, items: List[str]) -> str:
        """Format a list of items as bullet points"""
        if not items:
            return "- None specified"
        return "\n".join([f"- {item}" for item in items])

    def retrieve_relevant_content(self, query: str, k: int = 5) -> List[Dict]:
        """
        Retrieve relevant content from Elasticsearch based on query

        Args:
            query: Search query
            k: Number of results to retrieve

        Returns:
            List of relevant content items
        """
        # Generate embedding for the query
        query_embedding = self.openai.generate_embedding(query)

        # Search for similar content
        results = []

        # Search communities
        community_results = self.es.search_communities_by_vector(query_embedding, k=3)
        for result in community_results:
            results.append({
                "type": "community",
                "score": result["score"],
                "name": result["source"]["name"],
                "description": result["source"]["description"],
            })

        # Search content
        content_query = {
            "knn": {
                "field": "embedding",
                "query_vector": query_embedding,
                "k": k,
                "num_candidates": k * 2,
            }
        }

        try:
            response = self.es.es.search(index="advisor_content", body=content_query)
            for hit in response["hits"]["hits"]:
                results.append({
                    "type": "content",
                    "score": hit["_score"],
                    "title": hit["_source"].get("title", ""),
                    "body": hit["_source"].get("body", "")[:200],
                    "community": hit["_source"].get("community_name", ""),
                })
        except:
            pass

        return results[:k]

    def retrieve_similar_personas(self, k: int = 3) -> List[Dict]:
        """
        Find similar personas based on embedding similarity

        Args:
            k: Number of similar personas to retrieve

        Returns:
            List of similar personas
        """
        if not self.persona_data or "embedding" not in self.persona_data:
            return []

        query_embedding = self.persona_data["embedding"]

        results = self.es.search_personas_by_vector(
            query_embedding=query_embedding,
            k=k + 1  # +1 because it will include self
        )

        # Filter out self
        similar_personas = []
        for result in results:
            if result["persona_id"] != self.persona_id:
                similar_personas.append({
                    "name": result["source"]["name"],
                    "summary": result["source"]["summary"],
                    "similarity_score": result["score"],
                })

        return similar_personas[:k]

    def chat(self, user_message: str, include_retrieval: bool = True) -> Dict[str, Any]:
        """
        Chat with the persona agent

        Args:
            user_message: User's message/query
            include_retrieval: Whether to retrieve relevant context

        Returns:
            Dict with response and retrieved context
        """
        # Build the prompt with persona context
        context = self.get_context()

        # Retrieve relevant information if requested
        retrieved_context = ""
        retrieved_items = []

        if include_retrieval:
            retrieved_items = self.retrieve_relevant_content(user_message, k=3)
            if retrieved_items:
                retrieved_context = "\n\nRelevant Information Retrieved:\n"
                for i, item in enumerate(retrieved_items, 1):
                    if item["type"] == "community":
                        retrieved_context += f"\n{i}. Community: {item['name']}\n   {item['description']}\n"
                    elif item["type"] == "content":
                        retrieved_context += f"\n{i}. Content from {item['community']}:\n   {item['body']}\n"

        # Construct the full prompt
        full_prompt = f"""{context}
{retrieved_context}

User Query: {user_message}

Please respond as this persona, incorporating the retrieved information if relevant. Provide authentic insights based on your characteristics, pain points, and motivations.
"""

        # Generate response using OpenAI
        response = self.openai.generate_response(
            prompt=full_prompt,
            max_tokens=500
        )

        return {
            "persona_name": self.persona_data.get("name", "Unknown"),
            "response": response,
            "retrieved_context": retrieved_items,
            "persona_summary": self.persona_data.get("summary", ""),
        }

    def analyze_ad_creative(self, ad_description: str) -> Dict[str, Any]:
        """
        Analyze an ad creative from this persona's perspective

        Args:
            ad_description: Description of the ad creative

        Returns:
            Analysis and feedback from persona's perspective
        """
        context = self.get_context()

        prompt = f"""{context}

You are being shown an advertisement. Here's the description:

{ad_description}

As this persona, please provide:
1. Your initial reaction to the ad (positive, neutral, or negative)
2. What elements resonate with you based on your pain points and motivations
3. What elements don't work for you and why
4. Suggestions for improvement that would appeal to someone like you
5. On a scale of 1-10, how likely are you to engage with this ad

Be specific and authentic to your persona's characteristics.
"""

        response = self.openai.generate_response(
            prompt=prompt,
            max_tokens=700
        )

        return {
            "persona_name": self.persona_data.get("name", "Unknown"),
            "persona_summary": self.persona_data.get("summary", ""),
            "demographics": self.persona_data.get("demographics", {}),
            "analysis": response,
        }


class PersonaAgentManager:
    """
    Manages multiple persona agents
    """

    def __init__(self):
        self.es = ElasticsearchClient()
        self.agents = {}  # Cache loaded agents

    def list_available_personas(self) -> List[Dict[str, str]]:
        """
        List all available personas that can be instantiated as agents

        Returns:
            List of persona summaries
        """
        try:
            response = self.es.es.search(
                index="advisor_personas",
                body={
                    "query": {"match_all": {}},
                    "size": 100,
                    "_source": ["name", "summary"]
                }
            )

            personas = []
            for hit in response["hits"]["hits"]:
                personas.append({
                    "id": hit["_id"],
                    "name": hit["_source"].get("name", "Unknown"),
                    "summary": hit["_source"].get("summary", "")
                })

            return personas
        except Exception as e:
            print(f"Error listing personas: {e}")
            return []

    def get_agent(self, persona_id: str) -> PersonaAgent:
        """
        Get or create a persona agent

        Args:
            persona_id: ID of the persona

        Returns:
            PersonaAgent instance
        """
        if persona_id not in self.agents:
            self.agents[persona_id] = PersonaAgent(persona_id)

        return self.agents[persona_id]

    def multi_persona_analysis(
        self,
        ad_description: str,
        persona_ids: Optional[List[str]] = None,
        num_personas: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get feedback from multiple personas on an ad

        Args:
            ad_description: Description of the ad
            persona_ids: Specific persona IDs to use (optional)
            num_personas: Number of random personas if persona_ids not provided

        Returns:
            List of analyses from different personas
        """
        if persona_ids is None:
            # Get random personas
            available = self.list_available_personas()
            import random
            selected = random.sample(available, min(num_personas, len(available)))
            persona_ids = [p["id"] for p in selected]

        analyses = []
        for persona_id in persona_ids:
            try:
                agent = self.get_agent(persona_id)
                analysis = agent.analyze_ad_creative(ad_description)
                analyses.append(analysis)
            except Exception as e:
                print(f"Error analyzing with persona {persona_id}: {e}")

        return analyses


def main():
    """Example usage of persona agents"""
    print("Persona Agent System Demo\n")
    print("=" * 80)

    # Initialize manager
    manager = PersonaAgentManager()

    # List available personas
    print("\nAvailable Personas:")
    personas = manager.list_available_personas()
    for i, persona in enumerate(personas[:5], 1):
        print(f"{i}. {persona['name']}: {persona['summary'][:80]}...")

    if not personas:
        print("No personas found. Please run migration first.")
        return

    # Create an agent for the first persona
    print(f"\n{'=' * 80}")
    print("Creating agent for first persona...\n")

    first_persona = personas[0]
    agent = manager.get_agent(first_persona["id"])

    # Test chat functionality
    print("Testing chat with retrieval:")
    print("-" * 80)
    result = agent.chat("What are your thoughts on fitness and health?", include_retrieval=True)
    print(f"Persona: {result['persona_name']}")
    print(f"Response: {result['response']}\n")

    if result['retrieved_context']:
        print("Retrieved Context:")
        for item in result['retrieved_context']:
            print(f"  - {item['type']}: {item.get('name') or item.get('title')}")

    # Test ad analysis
    print(f"\n{'=' * 80}")
    print("Testing Ad Analysis:")
    print("-" * 80)

    sample_ad = """
    A fitness app advertisement showing a busy professional using the app
    during their lunch break. The tagline reads: "5-minute workouts that fit
    your schedule. No gym required. Track your progress with AI-powered insights."
    """

    analysis = agent.analyze_ad_creative(sample_ad)
    print(f"Persona: {analysis['persona_name']}")
    print(f"Analysis:\n{analysis['analysis']}\n")

    # Multi-persona analysis
    print(f"\n{'=' * 80}")
    print("Multi-Persona Analysis (3 personas):")
    print("-" * 80)

    multi_analysis = manager.multi_persona_analysis(sample_ad, num_personas=3)
    for i, analysis in enumerate(multi_analysis, 1):
        print(f"\n{i}. {analysis['persona_name']}:")
        print(f"   {analysis['analysis'][:200]}...")


if __name__ == "__main__":
    main()
