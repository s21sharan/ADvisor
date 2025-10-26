"""
Elasticsearch Client SDK for AdVisor
Handles all Elasticsearch operations for personas, communities, and content
"""
import sys
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime
from elasticsearch import Elasticsearch, helpers

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config.elasticsearch_client import get_elasticsearch_client
from es_search.schema import (
    get_all_schemas,
    PERSONA_INDEX,
    COMMUNITY_INDEX,
    CONTENT_INDEX,
    INTEREST_INDEX,
)


class ElasticsearchClient:
    """
    Elasticsearch client for AdVisor
    Provides CRUD operations and vector search capabilities
    """

    def __init__(self):
        self.es = get_elasticsearch_client()

    # ========================================================================
    # INDEX MANAGEMENT
    # ========================================================================

    def create_all_indices(self, force_recreate: bool = False):
        """
        Create all necessary indices

        Args:
            force_recreate: If True, delete and recreate existing indices
        """
        schemas = get_all_schemas()

        for index_name, mapping in schemas.items():
            try:
                # Check if index exists
                if self.es.indices.exists(index=index_name):
                    if force_recreate:
                        print(f"  Deleting existing index: {index_name}")
                        self.es.indices.delete(index=index_name)
                    else:
                        print(f"  ✓ Index already exists: {index_name}")
                        continue

                # Create index
                self.es.indices.create(index=index_name, body=mapping)
                print(f"  ✓ Created index: {index_name}")

            except Exception as e:
                print(f"  ✗ Error creating index {index_name}: {e}")

    def delete_all_indices(self):
        """Delete all AdVisor indices"""
        indices = [PERSONA_INDEX, COMMUNITY_INDEX, CONTENT_INDEX, INTEREST_INDEX]

        for index_name in indices:
            try:
                if self.es.indices.exists(index=index_name):
                    self.es.indices.delete(index=index_name)
                    print(f"  ✓ Deleted index: {index_name}")
            except Exception as e:
                print(f"  ✗ Error deleting index {index_name}: {e}")

    # ========================================================================
    # PERSONA OPERATIONS
    # ========================================================================

    def index_persona(
        self,
        persona_id: str,
        name: str,
        summary: str,
        embedding: List[float],
        demographics: Optional[Dict] = None,
        psychographics: Optional[Dict] = None,
        interests: Optional[List[str]] = None,
        pain_points: Optional[List[str]] = None,
        motivations: Optional[List[str]] = None,
        communities: Optional[List[str]] = None,
    ) -> Dict:
        """
        Index a persona document

        Returns:
            Elasticsearch response
        """
        doc = {
            "persona_id": persona_id,
            "name": name,
            "summary": summary,
            "demographics": demographics or {},
            "psychographics": psychographics or {},
            "interests": interests or [],
            "pain_points": pain_points or [],
            "motivations": motivations or [],
            "communities": communities or [],
            "embedding": embedding,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        response = self.es.index(index=PERSONA_INDEX, id=persona_id, document=doc)
        return response

    def search_personas_by_vector(
        self, query_embedding: List[float], k: int = 10, filters: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Search personas using vector similarity

        Args:
            query_embedding: Query vector (1536 dims)
            k: Number of results to return
            filters: Optional filters (e.g., {"demographics.age_range": "25-34"})

        Returns:
            List of matching personas with scores
        """
        query = {
            "knn": {
                "field": "embedding",
                "query_vector": query_embedding,
                "k": k,
                "num_candidates": k * 2,
            }
        }

        # Add filters if provided
        if filters:
            query["filter"] = [{"term": {key: value}} for key, value in filters.items()]

        response = self.es.search(index=PERSONA_INDEX, body=query)

        results = []
        for hit in response["hits"]["hits"]:
            results.append(
                {
                    "persona_id": hit["_id"],
                    "score": hit["_score"],
                    "source": hit["_source"],
                }
            )

        return results

    def search_personas_by_text(self, query: str, k: int = 10) -> List[Dict]:
        """
        Full-text search for personas

        Args:
            query: Search query text
            k: Number of results

        Returns:
            List of matching personas
        """
        search_query = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["name^3", "summary^2", "pain_points", "motivations"],
                }
            },
            "size": k,
        }

        response = self.es.search(index=PERSONA_INDEX, body=search_query)

        results = []
        for hit in response["hits"]["hits"]:
            results.append(
                {
                    "persona_id": hit["_id"],
                    "score": hit["_score"],
                    "source": hit["_source"],
                }
            )

        return results

    # ========================================================================
    # COMMUNITY OPERATIONS
    # ========================================================================

    def index_community(
        self,
        community_id: str,
        name: str,
        description: str,
        embedding: List[float],
        platform: str = "reddit",
        audience_type: Optional[str] = None,
        tone: Optional[str] = None,
        activity_level: Optional[str] = None,
        topic_categories: Optional[List[str]] = None,
    ) -> Dict:
        """Index a community document"""
        doc = {
            "community_id": community_id,
            "name": name,
            "platform": platform,
            "description": description,
            "audience_type": audience_type or "general",
            "tone": tone or "neutral",
            "activity_level": activity_level or "medium",
            "topic_categories": topic_categories or [],
            "embedding": embedding,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        response = self.es.index(index=COMMUNITY_INDEX, id=community_id, document=doc)
        return response

    def search_communities_by_vector(
        self, query_embedding: List[float], k: int = 10
    ) -> List[Dict]:
        """Search communities using vector similarity"""
        query = {
            "knn": {
                "field": "embedding",
                "query_vector": query_embedding,
                "k": k,
                "num_candidates": k * 2,
            }
        }

        response = self.es.search(index=COMMUNITY_INDEX, body=query)

        results = []
        for hit in response["hits"]["hits"]:
            results.append(
                {
                    "community_id": hit["_id"],
                    "score": hit["_score"],
                    "source": hit["_source"],
                }
            )

        return results

    # ========================================================================
    # CONTENT OPERATIONS
    # ========================================================================

    def index_content(
        self,
        content_id: str,
        content_type: str,
        embedding: List[float],
        title: Optional[str] = None,
        body: Optional[str] = None,
        community_name: Optional[str] = None,
        author: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> Dict:
        """Index a content document (post, comment, etc.)"""
        doc = {
            "content_id": content_id,
            "content_type": content_type,
            "title": title or "",
            "body": body or "",
            "community_name": community_name or "",
            "author": author or "",
            "embedding": embedding,
            "created_at": datetime.utcnow().isoformat(),
        }

        # Add metadata fields
        if metadata:
            doc.update(
                {
                    "upvotes": metadata.get("upvotes", 0),
                    "num_comments": metadata.get("num_comments", 0),
                    "url": metadata.get("url", ""),
                    "date_posted": metadata.get("date_posted"),
                }
            )

        response = self.es.index(index=CONTENT_INDEX, id=content_id, document=doc)
        return response

    def bulk_index_content(self, documents: List[Dict]) -> Dict:
        """Bulk index multiple content documents"""
        actions = []
        for doc in documents:
            action = {
                "_index": CONTENT_INDEX,
                "_id": doc.get("content_id"),
                "_source": doc,
            }
            actions.append(action)

        success, failed = helpers.bulk(self.es, actions, raise_on_error=False)
        return {"success": success, "failed": failed}

    # ========================================================================
    # INTEREST OPERATIONS
    # ========================================================================

    def index_interest(
        self,
        interest_id: str,
        label: str,
        category: str,
        description: Optional[str] = None,
        keywords: Optional[List[str]] = None,
    ) -> Dict:
        """Index an interest document"""
        doc = {
            "interest_id": interest_id,
            "label": label,
            "category": category,
            "description": description or "",
            "keywords": keywords or [],
            "created_at": datetime.utcnow().isoformat(),
        }

        response = self.es.index(index=INTEREST_INDEX, id=interest_id, document=doc)
        return response

    # ========================================================================
    # UTILITY METHODS
    # ========================================================================

    def get_document_count(self, index: str) -> int:
        """Get total document count for an index"""
        try:
            response = self.es.count(index=index)
            return response["count"]
        except:
            return 0

    def get_all_counts(self) -> Dict[str, int]:
        """Get document counts for all indices"""
        return {
            "personas": self.get_document_count(PERSONA_INDEX),
            "communities": self.get_document_count(COMMUNITY_INDEX),
            "content": self.get_document_count(CONTENT_INDEX),
            "interests": self.get_document_count(INTEREST_INDEX),
        }


if __name__ == "__main__":
    # Test the client
    print("Testing Elasticsearch Client...\n")

    client = ElasticsearchClient()

    # Create indices
    print("Creating indices...")
    client.create_all_indices(force_recreate=False)

    print("\nIndex counts:")
    counts = client.get_all_counts()
    for index, count in counts.items():
        print(f"  {index}: {count} documents")
