"""
Migrate existing data from Supabase to Elasticsearch
Syncs all personas, communities, content, and interests
"""
import sys
from pathlib import Path
from typing import List, Dict
import time
import json

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from db.knowledge_graph import KnowledgeGraph
from db.vector_store import VectorStore
from es_search.es_client import ElasticsearchClient
from config import get_client


def parse_embedding(emb_data) -> List[float]:
    """Parse embedding from string or list"""
    if isinstance(emb_data, list):
        return emb_data
    elif isinstance(emb_data, str):
        # Parse string representation of list
        return json.loads(emb_data)
    else:
        raise ValueError(f"Unknown embedding format: {type(emb_data)}")


class SupabaseToElasticsearchMigration:
    """
    Migrates data from Supabase (PostgreSQL + pgvector) to Elasticsearch
    """

    def __init__(self):
        self.kg = KnowledgeGraph()
        self.vs = VectorStore()
        self.es = ElasticsearchClient()
        self.client = get_client()

    def migrate_personas(self) -> int:
        """Migrate all personas from Supabase to Elasticsearch"""
        print("\n" + "=" * 80)
        print("MIGRATING PERSONAS")
        print("=" * 80)

        # Get all personas from Supabase
        personas = self.kg.list_personas()
        print(f"\nFound {len(personas)} personas in Supabase")

        if not personas:
            print("No personas to migrate")
            return 0

        migrated = 0
        for idx, persona in enumerate(personas, 1):
            try:
                persona_id = persona["id"]

                # Get persona embedding
                embedding_data = self.vs.get_persona_embedding(persona_id)
                if not embedding_data or not embedding_data.get("embedding"):
                    print(f"  ⚠ Skipping {persona.get('name', persona_id)} - no embedding found")
                    continue

                # Parse embedding from string to list
                embedding = parse_embedding(embedding_data["embedding"])

                # Get associated communities
                communities_data = self.kg.get_persona_communities(persona_id)
                community_names = [c["name"] for c in communities_data] if communities_data else []

                # Get associated interests
                interests_data = self.kg.get_persona_interests(persona_id)
                interest_labels = [i["label"] for i in interests_data] if interests_data else []

                # Index in Elasticsearch
                self.es.index_persona(
                    persona_id=persona_id,
                    name=persona.get("name", "Unknown"),
                    summary=persona.get("summary", ""),
                    embedding=embedding,
                    demographics=persona.get("demographics", {}),
                    psychographics=persona.get("psychographics", {}),
                    interests=interest_labels,
                    pain_points=persona.get("pain_points", []),
                    motivations=persona.get("motivations", []),
                    communities=community_names,
                )

                migrated += 1
                if idx % 10 == 0:
                    print(f"  Progress: {idx}/{len(personas)} personas processed, {migrated} migrated")

            except Exception as e:
                print(f"  ✗ Error migrating persona {persona.get('name', persona_id)}: {e}")

        print(f"\n✓ Migrated {migrated}/{len(personas)} personas to Elasticsearch")
        return migrated

    def migrate_communities(self) -> int:
        """Migrate all communities from Supabase to Elasticsearch"""
        print("\n" + "=" * 80)
        print("MIGRATING COMMUNITIES")
        print("=" * 80)

        # Get all communities from Supabase
        communities = self.kg.list_communities()
        print(f"\nFound {len(communities)} communities in Supabase")

        if not communities:
            print("No communities to migrate")
            return 0

        migrated = 0
        for idx, community in enumerate(communities, 1):
            try:
                community_id = community["id"]

                # Get community embedding
                embedding_data = self.vs.get_community_embedding(community_id)
                if not embedding_data or not embedding_data.get("embedding"):
                    print(f"  ⚠ Skipping {community['name']} - no embedding found")
                    continue

                # Parse embedding from string to list
                embedding = parse_embedding(embedding_data["embedding"])

                # Index in Elasticsearch
                self.es.index_community(
                    community_id=community_id,
                    name=community["name"],
                    description=community.get("description", ""),
                    embedding=embedding,
                    platform=community.get("platform", "reddit"),
                    audience_type=community.get("audience_type", "general"),
                    tone=community.get("tone", "neutral"),
                    activity_level=community.get("activity_level", "medium"),
                    topic_categories=community.get("topic_categories", []) if community.get("topic_categories") else [],
                )

                migrated += 1
                if idx % 5 == 0:
                    print(f"  Progress: {idx}/{len(communities)} communities processed, {migrated} migrated")

            except Exception as e:
                print(f"  ✗ Error migrating community {community.get('name', community_id)}: {e}")
                import traceback
                traceback.print_exc()

        print(f"\n✓ Migrated {migrated}/{len(communities)} communities to Elasticsearch")
        return migrated

    def migrate_content(self, batch_size: int = 100) -> int:
        """Migrate content embeddings from Supabase to Elasticsearch"""
        print("\n" + "=" * 80)
        print("MIGRATING CONTENT")
        print("=" * 80)

        try:
            # Query content_embeddings table directly
            response = self.client.table("content_embeddings").select("*").execute()
            content_items = response.data

            print(f"\nFound {len(content_items)} content items in Supabase")

            if not content_items:
                print("No content to migrate")
                return 0

            # Process in batches
            migrated = 0
            for i in range(0, len(content_items), batch_size):
                batch = content_items[i : i + batch_size]

                es_docs = []
                for item in batch:
                    try:
                        # Parse embedding
                        embedding = parse_embedding(item.get("embedding"))

                        # Parse metadata if it exists
                        metadata = item.get("metadata", {})

                        doc = {
                            "content_id": item["content_id"],
                            "content_type": item.get("content_type", "post"),
                            "title": item.get("embedding_text", "")[:200],
                            "body": item.get("embedding_text", ""),
                            "community_name": metadata.get("community_name", "") if metadata else "",
                            "author": metadata.get("author", "") if metadata else "",
                            "upvotes": metadata.get("upvotes", 0) if metadata else 0,
                            "num_comments": metadata.get("num_comments", 0) if metadata else 0,
                            "url": metadata.get("url", "") if metadata else "",
                            "date_posted": metadata.get("date_posted") if metadata else None,
                            "embedding": embedding,
                        }

                        es_docs.append(doc)

                    except Exception as e:
                        print(f"  ⚠ Error preparing content item: {e}")

                # Bulk index in Elasticsearch
                if es_docs:
                    result = self.es.bulk_index_content(es_docs)
                    migrated += result["success"]

                    print(f"  Progress: {min(i + batch_size, len(content_items))}/{len(content_items)} content items processed")

            print(f"\n✓ Migrated {migrated}/{len(content_items)} content items to Elasticsearch")
            return migrated

        except Exception as e:
            print(f"  ✗ Error migrating content: {e}")
            import traceback
            traceback.print_exc()
            return 0

    def migrate_interests(self) -> int:
        """Migrate all interests from Supabase to Elasticsearch"""
        print("\n" + "=" * 80)
        print("MIGRATING INTERESTS")
        print("=" * 80)

        # Get all interests from Supabase
        interests = self.kg.list_interests()
        print(f"\nFound {len(interests)} interests in Supabase")

        if not interests:
            print("No interests to migrate")
            return 0

        migrated = 0
        for idx, interest in enumerate(interests, 1):
            try:
                interest_id = interest["id"]

                # Index in Elasticsearch
                self.es.index_interest(
                    interest_id=interest_id,
                    label=interest["label"],
                    category=interest.get("category", "general"),
                    description=interest.get("description", ""),
                    keywords=interest.get("keywords", []) if interest.get("keywords") else [],
                )

                migrated += 1

            except Exception as e:
                print(f"  ✗ Error migrating interest {interest.get('label', interest_id)}: {e}")

        print(f"\n✓ Migrated {migrated}/{len(interests)} interests to Elasticsearch")
        return migrated

    def migrate_all(self) -> Dict[str, int]:
        """Migrate all data from Supabase to Elasticsearch"""
        print("\n" + "=" * 80)
        print("SUPABASE → ELASTICSEARCH MIGRATION")
        print("=" * 80)

        start_time = time.time()

        # Ensure Elasticsearch indices exist
        print("\nEnsuring Elasticsearch indices exist...")
        self.es.create_all_indices(force_recreate=False)

        # Migrate all data types
        counts = {
            "personas": self.migrate_personas(),
            "communities": self.migrate_communities(),
            "content": self.migrate_content(),
            "interests": self.migrate_interests(),
        }

        elapsed = time.time() - start_time

        # Summary
        print("\n" + "=" * 80)
        print("MIGRATION COMPLETE!")
        print("=" * 80)
        print(f"\nMigration Summary:")
        print(f"  Personas:    {counts['personas']}")
        print(f"  Communities: {counts['communities']}")
        print(f"  Content:     {counts['content']}")
        print(f"  Interests:   {counts['interests']}")
        print(f"  Total:       {sum(counts.values())}")
        print(f"\nTime elapsed: {elapsed:.1f} seconds")

        # Verify counts in Elasticsearch
        print("\n" + "=" * 80)
        print("VERIFICATION")
        print("=" * 80)
        print("\nElasticsearch document counts:")
        es_counts = self.es.get_all_counts()
        for key, value in es_counts.items():
            print(f"  {key}: {value}")

        return counts


def main():
    """Run migration"""
    migration = SupabaseToElasticsearchMigration()
    migration.migrate_all()


if __name__ == "__main__":
    main()
